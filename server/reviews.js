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
//   hidden,                   // boolean: đã bị Admin ẩn do vi phạm hay chưa
//   hiddenReason,             // lý do ẩn (nếu có)
//   hiddenAt,                 // thời điểm ẩn
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
export const imageUrl = (name) => {
	if (!name) return "";
	if (name.startsWith("http://") || name.startsWith("https://") || name.startsWith("/")) return name;
	if (name.startsWith("photo-")) return `https://images.unsplash.com/${name}?auto=format&fit=crop&w=800&q=80`;
	return `${IMAGE_URL_PREFIX}${name}`;
};

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
		const r = Number(review.rating);
		if (r >= 1 && r <= 5) {
			distribution[r] += 1;
			sum += r;
		}
	}
	return {
		average: reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : null,
		count: reviews.length,
		distribution,
	};
}

/** Điểm + số lượt cho từng tour: dùng để gắn vào danh sách tour (chỉ tính đánh giá đang hiển thị công khai). */
export function ratingsByTour(reviews) {
	const grouped = new Map();
	for (const review of reviews) {
		if (review.hidden) continue;
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
		images: (review.images || []).map(imageUrl),
		authorName: isMine ? review.authorName : maskName(review.authorName),
		createdAt: review.createdAt,
		updatedAt: review.updatedAt,
		edited: review.updatedAt !== review.createdAt,
		isMine,
	};
}

/** Danh sách đánh giá của một tour (chỉ lấy đánh giá đang hiển thị công khai). Trả về { error } nếu tham số sai. */
export function listTourReviews(allReviews, tourId, { sort = "newest" } = {}, viewerId = null) {
	if (!SORTS.has(sort)) return { error: "Cách sắp xếp không hợp lệ." };
	const items = allReviews.filter((review) => review.tourId === tourId && !review.hidden);
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
		hidden: false,
		createdAt: timestamp,
		updatedAt: timestamp,
	};
}

/** Đánh giá mẫu từ các khách hàng để demo trang chi tiết tour và trang Quản trị Đánh giá. */
export function buildDemoReviews(now = new Date()) {
	const day = (ago) => new Date(now.getTime() - ago * 86_400_000);
	const plan = [
		[
			"rev-demo-halong-1",
			"ha-long-3n2d",
			"Phạm Thanh Hà",
			5,
			"Du thuyền rất đẹp, hướng dẫn viên nhiệt tình, bữa tối hải sản tươi ngon. Cả nhà mình đều hài lòng, chắc chắn sẽ quay lại.",
			["photo-1528127269322-539801943592", "photo-1507525428034-b723cf961d3e"],
			2,
			false,
		],
		[
			"rev-demo-halong-2",
			"ha-long-3n2d",
			"Đỗ Quốc Bảo",
			4,
			"Lịch trình hợp lý, cảnh vịnh đẹp như tranh. Chỉ tiếc là hôm đi chèo kayak hơi đông người.",
			[],
			6,
			false,
		],
		[
			"rev-demo-halong-3",
			"ha-long-3n2d",
			"Ngô Mai Linh",
			5,
			"Phòng cabin sạch sẽ, nhân viên chu đáo. Giá trọn gói rất hợp lý so với chất lượng dịch vụ 5 sao.",
			["photo-1544644181-1484b3fdfc62"],
			14,
			false,
		],
		[
			"rev-demo-hoian-1",
			"hoi-an-2n1d",
			"Vũ Hoàng Nam",
			5,
			"Phố cổ về đêm lung linh, thả đèn hoa đăng trên sông Hoài là trải nghiệm đáng nhớ nhất chuyến đi.",
			["photo-1531058020387-3be344556be6"],
			4,
			false,
		],
		[
			"rev-demo-hoian-2",
			"hoi-an-2n1d",
			"Lý Thu Trang",
			3,
			"Tour ổn nhưng thời gian tự do buổi tối hơi ít, mình chưa kịp thử hết các món đặc sản Cao lầu và cơm gà.",
			[],
			11,
			false,
		],
		[
			"rev-demo-phuquoc-1",
			"phu-quoc-4n3d",
			"Trần Minh Tuấn",
			5,
			"Resort sát biển bãi Sao tuyệt đẹp, đi cáp treo Hòn Thơm ngắm biển từ trên cao cực kỳ ấn tượng. Gia đình mình có kỳ nghỉ rất trọn vẹn.",
			["photo-1500375592092-40eb2168fd21", "photo-1519046904884-53103b34b206"],
			3,
			false,
		],
		[
			"rev-demo-dalat-1",
			"da-lat-3n2d",
			"Trịnh Minh Châu",
			4,
			"Đà Lạt mát mẻ, homestay gỗ thông xinh xắn. Xe đón đúng giờ, bác tài xế vui tính và nhiệt tình hỗ trợ đoàn.",
			["photo-1500530855697-b586d89ba3ee"],
			8,
			false,
		],
		[
			"rev-demo-sapa-1",
			"sa-pa-3n2d",
			"Bùi Gia Huy",
			5,
			"Săn mây trên đỉnh Fansipan quá tuyệt vời, bản Cát Cát thơ mộng và người dân bản địa rất thân thiện. Nhớ mang áo ấm nhé!",
			["photo-1501785888041-af3ef285b470"],
			10,
			false,
		],
		[
			"rev-demo-hagiang-violation",
			"ha-giang-4n3d",
			"Lê Hoàng Cường",
			1,
			"Quảng cáo spam: Chuyên nhận làm sim số đẹp giá rẻ, vay vốn nhanh lãi suất thấp liên hệ ngay 0999888777 nhận hoa hồng cao!",
			[],
			1,
			false,
		],
	];
	return plan.map(([id, tourId, name, rating, comment, images, ago, hidden], index) => ({
		id,
		userId: `demo-user-${index + 1}`,
		bookingId: `TT-2610-${1000 + index}`,
		tourId,
		authorName: name,
		rating,
		comment,
		images,
		hidden,
		createdAt: day(ago).toISOString(),
		updatedAt: day(ago).toISOString(),
	}));
}
