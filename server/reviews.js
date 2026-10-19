// ===== Đánh giá và chấm điểm Tour =====
// Logic thuần (không đụng tới Express) để dễ kiểm thử và dùng lại.
//
// Một đánh giá (lưu trong store.reviews):
// {
//   id, userId,
//   bookingId,                // mỗi đơn đặt tour chỉ được đánh giá 1 lần
//   tourId,
//   authorName,               // tên người viết tại thời điểm viết
//   rating,                   // số nguyên 1–5
//   comment,                  // nhận xét (10–1000 ký tự)
//   images,                   // tên file ảnh đính kèm (tối đa 3), lưu ở server/data/review-images/
//   createdAt, updatedAt
// }
//
// Điều kiện xác thực: chỉ khách có đơn của CHÍNH MÌNH ở trạng thái "completed" mới được đánh giá tour đó.
import { randomUUID } from "node:crypto";

export const MAX_IMAGES = 3;
export const MAX_IMAGE_BYTES = 1_000_000; // sau khi giải mã base64
export const COMMENT_MIN = 10;
export const COMMENT_MAX = 1000;
export const IMAGE_URL_PREFIX = "/api/review-images/";
export const IMAGE_FILE_PATTERN = /^[0-9a-f-]{36}\.jpg$/;

const SORTS = new Set(["newest", "highest", "lowest"]);

/** Kiểm tra số sao + nhận xét. Trả về { rating, comment } hoặc { error }. */
export function validateReviewInput(body = {}) {
	const rating = Number(body.rating);
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Vui lòng chọn số sao từ 1 đến 5." };
	const comment = typeof body.comment === "string" ? body.comment.trim() : "";
	if (comment.length < COMMENT_MIN) return { error: `Vui lòng nhập nhận xét (ít nhất ${COMMENT_MIN} ký tự).` };
	if (comment.length > COMMENT_MAX) return { error: `Nhận xét quá dài (tối đa ${COMMENT_MAX} ký tự).` };
	return { rating, comment };
}

/** Giải mã ảnh data URL. Chỉ nhận JPEG (trình duyệt đã nén về JPEG) và kiểm tra chữ ký file thật. */
export function decodeImage(dataUrl) {
	const match = typeof dataUrl === "string" ? /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl) : null;
	if (!match) return { error: "Ảnh đính kèm không hợp lệ (chỉ nhận ảnh JPEG)." };
	const buffer = Buffer.from(match[1], "base64");
	if (buffer.length === 0 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
		return { error: "Tệp ảnh không đúng định dạng." };
	}
	if (buffer.length > MAX_IMAGE_BYTES) return { error: "Mỗi ảnh tối đa 1 MB sau khi nén. Vui lòng chọn ảnh nhỏ hơn." };
	return { buffer };
}

export const newImageName = () => `${randomUUID()}.jpg`;
export const imageUrl = (name) => `${IMAGE_URL_PREFIX}${name}`;

/** "Nguyễn Anh Thư" → "Nguyễn Anh T." (che bớt tên người khác để bảo vệ riêng tư). */
export function maskName(name) {
	const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
	if (parts.length < 2) return parts[0] || "Khách";
	return `${parts.slice(0, -1).join(" ")} ${parts.at(-1).charAt(0).toUpperCase()}.`;
}

/** Điểm trung bình (1 chữ số thập phân), tổng lượt và phân bố từng mức sao. */
export function summarize(reviews) {
	const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	let sum = 0;
	for (const review of reviews) {
		distribution[review.rating] += 1;
		sum += review.rating;
	}
	return {
		average: reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : null,
		count: reviews.length,
		distribution,
	};
}

/** Điểm + số lượt cho từng tour: dùng để gắn vào danh sách tour. */
export function ratingsByTour(reviews) {
	const grouped = new Map();
	for (const review of reviews) {
		if (!grouped.has(review.tourId)) grouped.set(review.tourId, []);
		grouped.get(review.tourId).push(review);
	}
	const result = new Map();
	for (const [tourId, items] of grouped) {
		const { average, count } = summarize(items);
		result.set(tourId, { rating: average, reviewCount: count });
	}
	return result;
}

/** Dạng trả về cho client: không lộ userId; người xem là chủ đánh giá thì thấy tên đầy đủ + cờ isMine. */
export function publicReview(review, viewerId = null) {
	const isMine = Boolean(viewerId) && review.userId === viewerId;
	return {
		id: review.id,
		bookingId: isMine ? review.bookingId : undefined,
		tourId: review.tourId,
		rating: review.rating,
		comment: review.comment,
		images: review.images.map(imageUrl),
		authorName: isMine ? review.authorName : maskName(review.authorName),
		createdAt: review.createdAt,
		updatedAt: review.updatedAt,
		edited: review.updatedAt !== review.createdAt,
		isMine,
	};
}

/** Danh sách đánh giá của một tour. Trả về { error } nếu tham số sai. */
export function listTourReviews(allReviews, tourId, { sort = "newest" } = {}, viewerId = null) {
	if (!SORTS.has(sort)) return { error: "Cách sắp xếp không hợp lệ." };
	const items = allReviews.filter((review) => review.tourId === tourId);
	const ordered = [...items];
	if (sort === "newest") ordered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	if (sort === "highest") ordered.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
	if (sort === "lowest") ordered.sort((a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt));
	return { summary: summarize(items), reviews: ordered.map((review) => publicReview(review, viewerId)) };
}

/**
 * Người dùng có được đánh giá tour này không?
 * reason: ok | reviewed | not-completed | not-booked
 */
export function reviewEligibility(allBookings, allReviews, userId, tourId) {
	const mine = allBookings.filter((booking) => booking.userId === userId && booking.tour.id === tourId && booking.status !== "cancelled");
	if (!mine.length) return { canReview: false, reason: "not-booked" };
	const reviewedBookings = new Set(allReviews.filter((review) => review.userId === userId).map((review) => review.bookingId));
	const completed = mine.filter((booking) => booking.status === "completed");
	const open = completed.find((booking) => !reviewedBookings.has(booking.id));
	if (open) return { canReview: true, reason: "ok", bookingId: open.id };
	return { canReview: false, reason: completed.length ? "reviewed" : "not-completed" };
}

/** Tạo đối tượng đánh giá mới (chưa lưu). */
export function createReview({ user, booking, rating, comment, images = [], now = new Date() }) {
	const timestamp = now.toISOString();
	return {
		id: randomUUID(),
		userId: user.id,
		bookingId: booking.id,
		tourId: booking.tour.id,
		authorName: user.name,
		rating,
		comment,
		images,
		createdAt: timestamp,
		updatedAt: timestamp,
	};
}

/** Đánh giá mẫu từ các "khách khác" để demo trang chi tiết tour (chỉ dùng ở môi trường phát triển). */
export function buildDemoReviews(now = new Date()) {
	const day = (ago) => new Date(now.getTime() - ago * 86_400_000);
	const plan = [
		["ha-long-3n2d", "Phạm Thanh Hà", 5, "Du thuyền rất đẹp, hướng dẫn viên nhiệt tình, bữa tối hải sản tươi ngon. Cả nhà mình đều hài lòng, chắc chắn sẽ quay lại.", 6],
		["ha-long-3n2d", "Đỗ Quốc Bảo", 4, "Lịch trình hợp lý, cảnh vịnh đẹp như tranh. Chỉ tiếc là hôm đi chèo kayak hơi đông người.", 18],
		["ha-long-3n2d", "Ngô Mai Linh", 5, "Phòng cabin sạch sẽ, nhân viên chu đáo. Giá trọn gói rất hợp lý so với chất lượng.", 33],
		["hoi-an-2n1d", "Vũ Hoàng Nam", 5, "Phố cổ về đêm lung linh, thả đèn hoa đăng là trải nghiệm đáng nhớ nhất chuyến đi.", 9],
		["hoi-an-2n1d", "Lý Thu Trang", 3, "Tour ổn nhưng thời gian tự do hơi ít, mình chưa kịp thử hết các món đặc sản.", 25],
		["da-lat-3n2d", "Trịnh Minh Châu", 4, "Đà Lạt mát mẻ, homestay xinh xắn. Xe đón đúng giờ, tài xế vui tính.", 12],
		["sa-pa-3n2d", "Bùi Gia Huy", 5, "Săn mây trên Fansipan quá tuyệt, bản làng thân thiện. Nhớ mang áo ấm nhé!", 15],
	];
	return plan.map(([tourId, name, rating, comment, ago], index) => ({
		id: randomUUID(),
		userId: `demo-user-${index + 1}`,
		bookingId: `demo-booking-${index + 1}`,
		tourId,
		authorName: name,
		rating,
		comment,
		images: [],
		createdAt: day(ago).toISOString(),
		updatedAt: day(ago).toISOString(),
	}));
}
