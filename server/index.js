import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import express from "express";
import { searchTours } from "./tours.js";
import {
	IMAGE_FILE_PATTERN,
	IMAGE_URL_PREFIX,
	MAX_IMAGES,
	buildDemoReviews,
	createReview,
	decodeImage,
	listTourReviews,
	newImageName,
	publicReview,
	ratingsByTour,
	reviewEligibility,
	validateReviewInput,
} from "./reviews.js";
import { departureAvailability, seatsOf, tourAvailability } from "./availability.js";
import { parsePassengerDetails } from "./passengers.js";
import { buildDemoBookings, calculateTotal, createBooking, findUserBooking, isValidPhone, listUserBookings, parsePassengers, todayInVietnam } from "./bookings.js";
import { createPayment, DEMO_VOUCHERS, listAvailableVouchers, quoteVoucher } from "./vouchers.js";

const scrypt = promisify(scryptCallback);
const app = express();
const port = Number(process.env.PORT) || 3000;
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = resolve(projectRoot, "server/data");
const dataPath = resolve(dataDirectory, "app-data.json");
const imagesDirectory = resolve(dataDirectory, "review-images");
const profileImagesDirectory = resolve(dataDirectory, "profile-images");
const buildDirectory = resolve(projectRoot, "dist");
const sessions = new Map();
let store = { users: [], inquiries: [], bookings: [], reviews: [], vouchers: [], payments: [] };
let writeQueue = Promise.resolve();

// API đánh giá nhận ảnh đính kèm dạng base64 nên cần giới hạn lớn hơn; phải khai báo TRƯỚC bộ đọc JSON mặc định.
app.use(["/api/reviews", /^\/api\/bookings\/[^/]+\/review$/], express.json({ limit: "5mb" }));
app.use("/api/profile/avatar", express.json({ limit: "2mb" }));
app.use(express.json({ limit: "64kb" }));

function publicUser(user) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		phone: user.phone || "",
		birthDate: user.birthDate || "",
		gender: user.gender || "",
		address: user.address || "",
		avatarUrl: user.avatarFile
			? `/api/profile/avatar/${encodeURIComponent(user.id)}?v=${encodeURIComponent(user.avatarUpdatedAt || "1")}`
			: "",
	};
}

function cookieValue(request, name) {
	const prefix = `${name}=`;
	return (request.headers.cookie || "")
		.split(";")
		.map((cookie) => cookie.trim())
		.find((cookie) => cookie.startsWith(prefix))
		?.slice(prefix.length);
}

function setSessionCookie(response, token) {
	const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
	response.setHeader("Set-Cookie", `traveller_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
}

function clearSessionCookie(response) {
	response.setHeader("Set-Cookie", "traveller_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function currentUser(request) {
	const userId = sessions.get(cookieValue(request, "traveller_session"));
	return store.users.find((user) => user.id === userId) || null;
}

function persistStore() {
	const contents = JSON.stringify(store, null, 2);
	writeQueue = writeQueue.catch(() => {}).then(async () => {
		const temporaryPath = `${dataPath}.tmp`;
		await writeFile(temporaryPath, contents, "utf8");
		await rename(temporaryPath, dataPath);
	});
	return writeQueue;
}

function cleanText(value, maxLength) {
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120;
}

// Gắn điểm trung bình + số lượt đánh giá thật vào tour (null / 0 nếu chưa có đánh giá)
function withRating(tour, ratings = ratingsByTour(store.reviews)) {
	const info = ratings.get(tour.id);
	return { ...tour, rating: info?.rating ?? null, reviewCount: info?.reviewCount ?? 0 };
}

app.get("/api/tours", (request, response) => {
	const result = searchTours(request.query);
	if (result.error) return response.status(400).json({ error: result.error });
	const ratings = ratingsByTour(store.reviews);
	return response.json({ total: result.tours.length, tours: result.tours.map((tour) => withRating(tour, ratings)) });
});

app.get("/api/tours/:id", (request, response) => {
	if (!currentUser(request)) return response.status(401).json({ error: "Vui lòng đăng nhập để xem chi tiết tour." });

	const result = searchTours();
	const tour = result.tours.find((item) => item.id === request.params.id);
	if (!tour) return response.status(404).json({ error: "Tour này không tồn tại." });
	return response.json({ tour: withRating(tour) });
});

// Kiểm tra chỗ trống: sức chứa / đã đặt / còn lại của từng ngày khởi hành còn hiệu lực (công khai, chỉ đọc)
app.get("/api/tours/:id/availability", (request, response) => {
	const tour = searchTours().tours.find((item) => item.id === request.params.id);
	if (!tour) return response.status(404).json({ error: "Tour này không tồn tại." });
	response.setHeader("Cache-Control", "no-store");
	return response.json({ tourId: tour.id, departures: tourAvailability(tour, store.bookings, todayInVietnam()) });
});

app.get("/api/bookings", (request, response) => {
	const user = currentUser(request);
	if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để xem lịch sử đặt tour." });

	const result = listUserBookings(store.bookings, user.id, request.query);
	if (result.error) return response.status(400).json({ error: result.error });
	const reviewedBookings = new Set(store.reviews.filter((review) => review.userId === user.id).map((review) => review.bookingId));
	const bookings = result.bookings.map((booking) => ({ ...booking, reviewed: reviewedBookings.has(booking.id) }));
	return response.json({ total: bookings.length, totalAll: result.totalAll, counts: result.counts, bookings });
});

app.get("/api/bookings/:id", (request, response) => {
	const user = currentUser(request);
	if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để xem chi tiết đơn đặt tour." });

	// Đơn của người khác được trả về giống đơn không tồn tại để không lộ thông tin
	const booking = findUserBooking(store.bookings, user.id, request.params.id);
	if (!booking) return response.status(404).json({ error: "Không tìm thấy đơn đặt tour này." });
	const review = store.reviews.find((item) => item.bookingId === booking.id && item.userId === user.id);
	return response.json({ booking, review: review ? publicReview(review, user.id) : null });
});

app.get("/api/bookings/:id/payment", async (request, response, next) => {
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để thanh toán." });
		const booking = findUserBooking(store.bookings, user.id, request.params.id);
		if (!booking) return response.status(404).json({ error: "Không tìm thấy đơn đặt tour này." });
		if (booking.status === "cancelled" || booking.paymentStatus === "refunded") {
			return response.status(409).json({ error: "Đơn đã hủy/hoàn tiền không thể thanh toán." });
		}

		let payment = store.payments.find((item) => item.bookingId === booking.id && item.userId === user.id);
		if (!payment) {
			if (booking.paymentStatus === "paid") return response.status(409).json({ error: "Đơn này đã được thanh toán." });
			payment = createPayment({ booking, user });
			store.payments.push(payment);
			await persistStore();
		} else if (payment.status !== "confirmed" && payment.amount !== booking.total) {
			const previousAmount = payment.amount;
			payment.amount = booking.total;
			payment.updatedAt = new Date().toISOString();
			try {
				await persistStore();
			} catch (error) {
				payment.amount = previousAmount;
				throw error;
			}
		}
		const subtotal = booking.subtotal ?? calculateTotal(booking.tour.price, booking.passengers);
		return response.json({
			booking,
			payment,
			vouchers: listAvailableVouchers(store.vouchers, subtotal, todayInVietnam()),
		});
	} catch (error) {
		return next(error);
	}
});

app.post("/api/bookings/:id/voucher", async (request, response, next) => {
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để áp dụng voucher." });
		const booking = findUserBooking(store.bookings, user.id, request.params.id);
		if (!booking) return response.status(404).json({ error: "Không tìm thấy đơn đặt tour này." });
		const storedBooking = store.bookings.find((item) => item.id === booking.id && item.userId === user.id);
		if (booking.status === "cancelled" || booking.paymentStatus === "paid" || booking.paymentStatus === "refunded") {
			return response.status(409).json({ error: "Đơn này không thể thay đổi voucher." });
		}

		const subtotal = booking.subtotal ?? calculateTotal(booking.tour.price, booking.passengers);
		const quote = quoteVoucher(store.vouchers, request.body?.code, subtotal, todayInVietnam());
		if (quote.error) return response.status(400).json({ error: quote.error });
		const payment = store.payments.find((item) => item.bookingId === booking.id && item.userId === user.id);
		if (payment?.status === "confirmed") return response.status(409).json({ error: "Giao dịch đã thanh toán, không thể đổi voucher." });

		const previousBooking = { subtotal: storedBooking.subtotal, discount: storedBooking.discount, voucher: storedBooking.voucher, total: storedBooking.total };
		const previousPaymentAmount = payment?.amount;
		Object.assign(storedBooking, {
			subtotal,
			discount: quote.discount,
			voucher: quote.voucher,
			total: subtotal - quote.discount,
		});
		if (payment) {
			payment.amount = storedBooking.total;
			payment.updatedAt = new Date().toISOString();
		}
		try {
			await persistStore();
		} catch (error) {
			Object.assign(storedBooking, previousBooking);
			if (payment) payment.amount = previousPaymentAmount;
			throw error;
		}
		return response.json({
			booking: findUserBooking(store.bookings, user.id, storedBooking.id),
			payment,
			discount: storedBooking.discount,
			total: storedBooking.total,
		});
	} catch (error) {
		return next(error);
	}
});

app.post("/api/payments/:id/demo-confirm", async (request, response, next) => {
	try {
		if (process.env.NODE_ENV === "production") return response.status(404).json({ error: "Không tìm thấy API." });
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để xác nhận thanh toán." });
		const payment = store.payments.find((item) => item.id === request.params.id && item.userId === user.id);
		if (!payment) return response.status(404).json({ error: "Không tìm thấy giao dịch thanh toán." });
		const booking = store.bookings.find((item) => item.id === payment.bookingId && item.userId === user.id);
		if (!booking) return response.status(404).json({ error: "Không tìm thấy đơn đặt tour." });
		if (booking.status === "cancelled") return response.status(409).json({ error: "Đơn đã hủy không thể thanh toán." });
		if (payment.status !== "confirmed") {
			const voucher = booking.voucher && store.vouchers.find((item) => item.id === booking.voucher.id);
			if (voucher && (!voucher.active || voucher.usageCount >= voucher.usageLimit || todayInVietnam() > voucher.expiresAt)) {
				return response.status(409).json({ error: "Voucher không còn hợp lệ. Vui lòng áp dụng mã khác." });
			}
			const previousPayment = { status: payment.status, updatedAt: payment.updatedAt };
			const previousBooking = { paymentStatus: booking.paymentStatus, updatedAt: booking.updatedAt };
			const previousUsageCount = voucher?.usageCount;
			payment.status = "confirmed";
			payment.updatedAt = new Date().toISOString();
			booking.paymentStatus = "paid";
			booking.updatedAt = payment.updatedAt;
			if (voucher) voucher.usageCount += 1;
			try {
				await persistStore();
			} catch (error) {
				Object.assign(payment, previousPayment);
				Object.assign(booking, previousBooking);
				if (voucher) voucher.usageCount = previousUsageCount;
				throw error;
			}
		}
		return response.json({ payment, booking: findUserBooking(store.bookings, user.id, booking.id) });
	} catch (error) {
		return next(error);
	}
});

// Tạo đơn đặt tour (dùng chung cho luồng Đặt tour sau này). Đơn mới luôn ở trạng thái "Chờ xử lý" + "Chưa thanh toán".
app.post("/api/bookings", async (request, response, next) => {
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để đặt tour." });

		const tour = searchTours().tours.find((item) => item.id === request.body?.tourId);
		if (!tour) return response.status(404).json({ error: "Tour này không tồn tại." });
		const departureDate = cleanText(request.body?.departureDate, 10);
		if (!tour.departures.includes(departureDate)) {
			return response.status(400).json({ error: "Ngày khởi hành không hợp lệ cho tour này." });
		}
		if (departureDate < todayInVietnam()) {
			return response.status(400).json({ error: "Ngày khởi hành này đã qua, vui lòng chọn ngày khác." });
		}
		const parsed = parsePassengers(request.body?.passengers);
		if (parsed.error) return response.status(400).json({ error: parsed.error });
		const phone = cleanText(request.body?.phone, 20);
		if (!isValidPhone(phone)) return response.status(400).json({ error: "Số điện thoại không hợp lệ." });

		// Thông tin từng hành khách phải khớp số lượng đã chọn và đúng độ tuổi tại ngày khởi hành
		const details = parsePassengerDetails(request.body?.passengerDetails, parsed.passengers, departureDate, todayInVietnam());
		if (details.error) return response.status(400).json({ error: details.error });

		// Kiểm tra chỗ trống ngay trước khi lưu (không có await giữa lúc kiểm tra và push nên không bị đặt trùng chỗ)
		const slot = departureAvailability(tour, departureDate, store.bookings);
		const seats = seatsOf(parsed.passengers);
		if (seats > slot.remaining) {
			const error = slot.remaining === 0
				? "Ngày khởi hành này đã hết chỗ. Vui lòng chọn ngày khác."
				: `Ngày khởi hành này chỉ còn ${slot.remaining} chỗ, bạn đang chọn ${seats} chỗ. Vui lòng giảm số khách hoặc chọn ngày khác.`;
			return response.status(409).json({ error, remaining: slot.remaining });
		}

		const booking = createBooking({
			user,
			tour,
			departureDate,
			passengers: parsed.passengers,
			phone,
			note: cleanText(request.body?.note, 500),
			passengerDetails: details.passengerDetails,
			existingBookings: store.bookings,
		});
		store.bookings.push(booking);
		await persistStore();
		return response.status(201).json({ booking: findUserBooking(store.bookings, user.id, booking.id) });
	} catch (error) {
		return next(error);
	}
});

// Chỉ để demo/kiểm thử: tạo vài đơn mẫu cho tài khoản đang đăng nhập (tắt khi NODE_ENV=production).
app.post("/api/dev/demo-bookings", async (request, response, next) => {
	try {
		if (process.env.NODE_ENV === "production") return response.status(404).json({ error: "Không tìm thấy API." });
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập." });
		if (store.bookings.some((booking) => booking.userId === user.id)) {
			return response.status(409).json({ error: "Tài khoản này đã có đơn đặt tour." });
		}

		const demo = buildDemoBookings(user);
		store.bookings.push(...demo);
		if (!store.reviews.some((review) => review.userId.startsWith("demo-user-"))) store.reviews.push(...buildDemoReviews());
		await persistStore();
		return response.status(201).json({ created: demo.length });
	} catch (error) {
		return next(error);
	}
});

app.get("/api/auth/session", (request, response) => {
	const user = currentUser(request);
	response.json({ user: user ? publicUser(user) : null });
});

app.post("/api/auth/register", async (request, response, next) => {
	try {
		const name = cleanText(request.body?.name, 80);
		const email = cleanText(request.body?.email, 120).toLowerCase();
		const password = typeof request.body?.password === "string" ? request.body.password : "";
		if (!name || !validEmail(email) || password.length < 8 || password.length > 256) {
			return response.status(400).json({ error: "Vui lòng nhập tên, email hợp lệ và mật khẩu từ 8 ký tự." });
		}
		if (store.users.some((user) => user.email === email)) {
			return response.status(409).json({ error: "Email này đã được đăng ký." });
		}

		const salt = randomBytes(16).toString("hex");
		const hash = (await scrypt(password, salt, 64)).toString("hex");
		const user = { id: randomUUID(), name, email, salt, hash, createdAt: new Date().toISOString() };
		store.users.push(user);
		await persistStore();
		return response.status(201).json({ user: publicUser(user) });
	} catch (error) {
		return next(error);
	}
});

app.post("/api/auth/login", async (request, response, next) => {
	try {
		const email = cleanText(request.body?.email, 120).toLowerCase();
		const password = typeof request.body?.password === "string" ? request.body.password : "";
		const user = store.users.find((entry) => entry.email === email);
		if (!user || !user.salt || !user.hash) {
			return response.status(401).json({ error: "Email hoặc mật khẩu không chính xác." });
		}
		const actualHash = Buffer.from(user.hash, "hex");
		const submittedHash = await scrypt(password, user.salt, actualHash.length);
		if (actualHash.length !== submittedHash.length || !timingSafeEqual(actualHash, submittedHash)) {
			return response.status(401).json({ error: "Email hoặc mật khẩu không chính xác." });
		}

		const token = randomBytes(32).toString("hex");
		sessions.set(token, user.id);
		setSessionCookie(response, token);
		return response.json({ user: publicUser(user) });
	} catch (error) {
		return next(error);
	}
});

app.post("/api/auth/logout", (request, response) => {
	const token = cookieValue(request, "traveller_session");
	if (token) sessions.delete(token);
	clearSessionCookie(response);
	response.json({ ok: true });
});

app.get("/api/profile", (request, response) => {
	const user = currentUser(request);
	if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để xem hồ sơ." });
	const stats = {
		bookings: store.bookings.filter((booking) => booking.userId === user.id).length,
		reviews: store.reviews.filter((review) => review.userId === user.id).length,
	};
	return response.json({ profile: publicUser(user), stats });
});

app.put("/api/profile", async (request, response, next) => {
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để cập nhật hồ sơ." });
		const name = cleanText(request.body?.name, 80);
		const phone = cleanText(request.body?.phone, 20);
		const birthDate = cleanText(request.body?.birthDate, 10);
		const gender = cleanText(request.body?.gender, 10);
		const address = cleanText(request.body?.address, 250);
		const validBirthDate = !birthDate || (/^\d{4}-\d{2}-\d{2}$/.test(birthDate)
			&& !Number.isNaN(Date.parse(`${birthDate}T00:00:00Z`))
			&& new Date(`${birthDate}T00:00:00Z`).toISOString().slice(0, 10) === birthDate
			&& birthDate <= todayInVietnam());
		if (!name || (phone && !isValidPhone(phone)) || !validBirthDate || !["", "female", "male", "other"].includes(gender)) {
			return response.status(400).json({ error: "Vui lòng kiểm tra họ tên, số điện thoại, ngày sinh và giới tính." });
		}
		const previous = { name: user.name, phone: user.phone, birthDate: user.birthDate, gender: user.gender, address: user.address };
		Object.assign(user, { name, phone, birthDate, gender, address });
		try {
			await persistStore();
		} catch (error) {
			Object.assign(user, previous);
			throw error;
		}
		return response.json({ profile: publicUser(user), user: publicUser(user) });
	} catch (error) {
		return next(error);
	}
});

app.post("/api/profile/avatar", async (request, response, next) => {
	let newFile;
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để cập nhật ảnh đại diện." });
		const match = typeof request.body?.image === "string"
			? request.body.image.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/)
			: null;
		if (!match) return response.status(400).json({ error: "Ảnh đại diện phải là JPEG, PNG hoặc WebP hợp lệ." });
		const image = Buffer.from(match[2], "base64");
		if (!image.length || image.length > 1_000_000) return response.status(400).json({ error: "Ảnh đại diện tối đa 1 MB sau khi nén." });
		const signatures = {
			jpeg: image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff,
			png: image.length >= 8 && image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
			webp: image.length >= 12 && image.toString("ascii", 0, 4) === "RIFF" && image.toString("ascii", 8, 12) === "WEBP",
		};
		if (!signatures[match[1]]) return response.status(400).json({ error: "Tệp ảnh không đúng định dạng khai báo." });
		await mkdir(profileImagesDirectory, { recursive: true });
		newFile = `${user.id}-${randomUUID()}.${match[1] === "jpeg" ? "jpg" : match[1]}`;
		await writeFile(resolve(profileImagesDirectory, newFile), image);
		const previousFile = user.avatarFile;
		const previousUpdatedAt = user.avatarUpdatedAt;
		user.avatarFile = newFile;
		user.avatarUpdatedAt = new Date().toISOString();
		try {
			await persistStore();
		} catch (error) {
			if (previousFile) user.avatarFile = previousFile;
			else delete user.avatarFile;
			if (previousUpdatedAt) user.avatarUpdatedAt = previousUpdatedAt;
			else delete user.avatarUpdatedAt;
			await unlink(resolve(profileImagesDirectory, newFile)).catch((unlinkError) => {
				if (unlinkError.code !== "ENOENT") throw unlinkError;
			});
			throw error;
		}
		if (previousFile && previousFile !== newFile) {
			await unlink(resolve(profileImagesDirectory, previousFile)).catch((error) => {
				if (error.code !== "ENOENT") throw error;
			});
		}
		return response.json({ user: publicUser(user) });
	} catch (error) {
		return next(error);
	}
});

app.delete("/api/profile/avatar", async (request, response, next) => {
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để xóa ảnh đại diện." });
		const previousFile = user.avatarFile;
		const previousUpdatedAt = user.avatarUpdatedAt;
		delete user.avatarFile;
		delete user.avatarUpdatedAt;
		try {
			await persistStore();
		} catch (error) {
			if (previousFile) user.avatarFile = previousFile;
			if (previousUpdatedAt) user.avatarUpdatedAt = previousUpdatedAt;
			throw error;
		}
		if (previousFile) {
			await unlink(resolve(profileImagesDirectory, previousFile)).catch((error) => {
				if (error.code !== "ENOENT") throw error;
			});
		}
		return response.json({ user: publicUser(user) });
	} catch (error) {
		return next(error);
	}
});

app.get("/api/profile/avatar/:userId", (request, response) => {
	const user = currentUser(request);
	if (!user || user.id !== request.params.userId || !user.avatarFile) {
		return response.status(404).json({ error: "Không tìm thấy ảnh đại diện." });
	}
	response.setHeader("Cache-Control", "private, max-age=300");
	response.setHeader("X-Content-Type-Options", "nosniff");
	return response.sendFile(user.avatarFile, { root: profileImagesDirectory }, (error) => {
		if (error && !response.headersSent) response.status(404).json({ error: "Không tìm thấy ảnh đại diện." });
	});
});

app.post("/api/inquiries", async (request, response, next) => {
	try {
		const name = cleanText(request.body?.name, 80);
		const email = cleanText(request.body?.email, 120).toLowerCase();
		const topic = cleanText(request.body?.topic, 80);
		const message = cleanText(request.body?.message, 2000);
		if (!name || !validEmail(email) || !topic || message.length < 10) {
			return response.status(400).json({ error: "Vui lòng kiểm tra lại thông tin và nội dung lời nhắn (tối thiểu 10 ký tự)." });
		}

		const inquiry = {
			id: randomUUID(),
			name,
			email,
			topic,
			message,
			createdAt: new Date().toISOString(),
		};
		store.inquiries.push(inquiry);
		await persistStore();
		return response.status(201).json({ inquiry: { id: inquiry.id, name: inquiry.name } });
	} catch (error) {
		return next(error);
	}
});

// ===== Đánh giá và chấm điểm tour =====
async function saveImages(buffers) {
	await mkdir(imagesDirectory, { recursive: true });
	const names = [];
	for (const buffer of buffers) {
		const name = newImageName();
		await writeFile(resolve(imagesDirectory, name), buffer);
		names.push(name);
	}
	return names;
}

async function removeImageFiles(names) {
	await Promise.all(names.map((name) => unlink(resolve(imagesDirectory, name)).catch(() => {})));
}

function decodeNewImages(list) {
	if (!Array.isArray(list) || list.length > MAX_IMAGES) return { error: `Tối đa ${MAX_IMAGES} ảnh cho mỗi đánh giá.` };
	const buffers = [];
	for (const item of list) {
		const decoded = decodeImage(item);
		if (decoded.error) return decoded;
		buffers.push(decoded.buffer);
	}
	return { buffers };
}

// Đọc đánh giá của một tour: công khai (khách chưa đăng nhập vẫn xem được), kèm quyền đánh giá của người đang đăng nhập
app.get("/api/tours/:id/reviews", (request, response) => {
	const tour = searchTours().tours.find((item) => item.id === request.params.id);
	if (!tour) return response.status(404).json({ error: "Tour này không tồn tại." });

	const user = currentUser(request);
	const result = listTourReviews(store.reviews, tour.id, { sort: String(request.query.sort || "newest") }, user?.id);
	if (result.error) return response.status(400).json({ error: result.error });
	const mine = user ? reviewEligibility(store.bookings, store.reviews, user.id, tour.id) : { canReview: false, reason: "login" };
	return response.json({ ...result, mine });
});

app.get("/api/review-images/:file", (request, response) => {
	if (!IMAGE_FILE_PATTERN.test(request.params.file)) return response.status(404).json({ error: "Không tìm thấy ảnh." });
	response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
	response.setHeader("X-Content-Type-Options", "nosniff");
	return response.sendFile(request.params.file, { root: imagesDirectory }, (error) => {
		if (error && !response.headersSent) response.status(404).json({ error: "Không tìm thấy ảnh." });
	});
});

// Gửi đánh giá cho một đơn đặt tour (chỉ chủ đơn, chỉ khi đơn đã hoàn thành, mỗi đơn 1 lần)
app.post("/api/bookings/:id/review", async (request, response, next) => {
	let created = null;
	let savedNames = [];
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để đánh giá tour." });

		const booking = store.bookings.find((item) => item.id === request.params.id && item.userId === user.id);
		if (!booking) return response.status(404).json({ error: "Không tìm thấy đơn đặt tour này." });
		if (booking.status !== "completed") {
			return response.status(403).json({ error: "Bạn chỉ có thể đánh giá sau khi tour đã hoàn thành." });
		}
		if (store.reviews.some((item) => item.bookingId === booking.id)) {
			return response.status(409).json({ error: "Bạn đã đánh giá đơn này rồi. Hãy chỉnh sửa đánh giá hiện có." });
		}

		const input = validateReviewInput(request.body);
		if (input.error) return response.status(400).json({ error: input.error });
		const decoded = decodeNewImages(request.body?.images ?? []);
		if (decoded.error) return response.status(400).json({ error: decoded.error });

		savedNames = await saveImages(decoded.buffers);
		created = createReview({ user, booking, ...input, images: savedNames });
		store.reviews.push(created);
		await persistStore();
		return response.status(201).json({ review: publicReview(created, user.id) });
	} catch (error) {
		if (created) store.reviews = store.reviews.filter((item) => item.id !== created.id);
		await removeImageFiles(savedNames);
		return next(error);
	}
});

// Sửa đánh giá của chính mình
app.put("/api/reviews/:id", async (request, response, next) => {
	let newNames = [];
	let snapshot = null;
	let review = null;
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để sửa đánh giá." });
		review = store.reviews.find((item) => item.id === request.params.id && item.userId === user.id);
		if (!review) return response.status(404).json({ error: "Không tìm thấy đánh giá này." });

		const input = validateReviewInput(request.body);
		if (input.error) return response.status(400).json({ error: input.error });

		// images: gồm đường dẫn ảnh cũ muốn giữ + ảnh mới dạng data URL
		const items = Array.isArray(request.body?.images) ? request.body.images : [];
		const keep = [];
		const fresh = [];
		for (const item of items) {
			if (typeof item === "string" && item.startsWith(IMAGE_URL_PREFIX)) {
				const name = item.slice(IMAGE_URL_PREFIX.length);
				if (!review.images.includes(name)) return response.status(400).json({ error: "Ảnh đính kèm không hợp lệ." });
				if (!keep.includes(name)) keep.push(name);
			} else {
				fresh.push(item);
			}
		}
		if (keep.length + fresh.length > MAX_IMAGES) return response.status(400).json({ error: `Tối đa ${MAX_IMAGES} ảnh cho mỗi đánh giá.` });
		const decoded = decodeNewImages(fresh);
		if (decoded.error) return response.status(400).json({ error: decoded.error });

		newNames = await saveImages(decoded.buffers);
		snapshot = { ...review };
		Object.assign(review, { rating: input.rating, comment: input.comment, images: [...keep, ...newNames], updatedAt: new Date().toISOString() });
		await persistStore();
		await removeImageFiles(snapshot.images.filter((name) => !keep.includes(name)));
		return response.json({ review: publicReview(review, user.id) });
	} catch (error) {
		if (snapshot && review) Object.assign(review, snapshot);
		await removeImageFiles(newNames);
		return next(error);
	}
});

// Xóa đánh giá của chính mình
app.delete("/api/reviews/:id", async (request, response, next) => {
	let removed = null;
	try {
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập để xóa đánh giá." });
		removed = store.reviews.find((item) => item.id === request.params.id && item.userId === user.id);
		if (!removed) return response.status(404).json({ error: "Không tìm thấy đánh giá này." });

		store.reviews = store.reviews.filter((item) => item.id !== removed.id);
		await persistStore();
		await removeImageFiles(removed.images);
		return response.json({ ok: true });
	} catch (error) {
		if (removed && !store.reviews.some((item) => item.id === removed.id)) store.reviews.push(removed);
		return next(error);
	}
});

// Chỉ để demo/kiểm thử: giả lập tour đã hoàn thành để thử luồng đánh giá (tắt khi NODE_ENV=production).
app.post("/api/dev/bookings/:id/complete", async (request, response, next) => {
	try {
		if (process.env.NODE_ENV === "production") return response.status(404).json({ error: "Không tìm thấy API." });
		const user = currentUser(request);
		if (!user) return response.status(401).json({ error: "Vui lòng đăng nhập." });
		const booking = store.bookings.find((item) => item.id === request.params.id && item.userId === user.id);
		if (!booking) return response.status(404).json({ error: "Không tìm thấy đơn đặt tour này." });
		if (booking.status === "cancelled") return response.status(409).json({ error: "Đơn đã hủy không thể hoàn thành." });

		Object.assign(booking, { status: "completed", paymentStatus: "paid", updatedAt: new Date().toISOString() });
		await persistStore();
		return response.json({ booking: findUserBooking(store.bookings, user.id, booking.id) });
	} catch (error) {
		return next(error);
	}
});

app.use("/api", (request, response) => {
	response.status(404).json({ error: "Không tìm thấy API." });
});

app.use(express.static(buildDirectory));

app.use((error, request, response, next) => {
	if (response.headersSent) return next(error);
	const status = Number.isInteger(error.status) ? error.status : 500;
	if (status >= 500) console.error(error);
	return response.status(status).json({
		error: status === 400 ? "Dữ liệu JSON gửi lên không hợp lệ." : "Máy chủ không thể xử lý yêu cầu lúc này.",
	});
});

async function start() {
	await mkdir(dataDirectory, { recursive: true });
	await mkdir(imagesDirectory, { recursive: true });
	try {
		const savedData = JSON.parse(await readFile(dataPath, "utf8"));
		if (!Array.isArray(savedData.users) || !Array.isArray(savedData.inquiries)) {
			throw new Error(`${dataPath} không có cấu trúc users/inquiries hợp lệ.`);
		}
		store = {
			...savedData,
			bookings: Array.isArray(savedData.bookings) ? savedData.bookings : [],
			reviews: Array.isArray(savedData.reviews) ? savedData.reviews : [],
			vouchers: Array.isArray(savedData.vouchers) ? savedData.vouchers : DEMO_VOUCHERS.map((voucher) => ({ ...voucher })),
			payments: Array.isArray(savedData.payments) ? savedData.payments : [],
		};
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}

	app.listen(port, () => {
		console.log(`Traveller Team API listening on http://localhost:${port}`);
	});
}

start().catch((error) => {
	console.error("Could not start Traveller Team server:", error);
	process.exitCode = 1;
});
