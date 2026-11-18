// ===== Đơn đặt tour + lịch sử đặt tour (Story US06: Xem lịch sử đặt Tour) =====
// File này chỉ chứa logic thuần (không đụng tới Express) để dễ dùng lại cho các chức năng
// Đặt tour / Thanh toán / Hủy tour: chỉ cần gọi `createBooking` và cập nhật `status`, `paymentStatus`.
//
// Cấu trúc một đơn đặt tour (lưu trong store.bookings):
// {
//   id, code,                       // code: mã đặt tour hiển thị cho khách, ví dụ "TT-261018-A1B2"
//   userId,                         // chủ đơn – mọi API đọc dữ liệu đều lọc theo userId này
//   tour: { id, name, place, region, duration, price, image },   // ảnh chụp thông tin tour lúc đặt
//   departureDate,                  // "YYYY-MM-DD"
//   passengers: { adult, child, infant },
//   passengerDetails: [{ type, fullName, gender, dob, idNumber? }],   // xem server/passengers.js
//   total,                          // tổng tiền (VND, số nguyên)
//   status,                         // pending | confirmed | completed | cancelled
//   paymentStatus,                  // unpaid | paid | refunded
//   contact: { name, email, phone },
//   note,
//   createdAt, updatedAt            // ISO datetime; createdAt = "ngày đặt"
// }
import { randomBytes, randomUUID } from "node:crypto";
import { normalizeText, tours } from "./tours.js";

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"];

const SORTS = new Set(["newest", "departure-asc", "total-desc"]);
const MAX_PER_TYPE = 20;
const CHILD_RATE = 0.7; // Trẻ em tính 70% giá, em bé miễn phí (giống trang chi tiết tour)

const asString = (value) => (typeof value === "string" ? value.trim() : "");

/** Ngày hôm nay theo giờ Việt Nam, dạng "YYYY-MM-DD" (so sánh được với ngày khởi hành). */
export function todayInVietnam(now = new Date()) {
	return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Số điện thoại là tùy chọn; nếu có thì chỉ gồm số, khoảng trắng và + ( ) . - (8–20 ký tự). */
export function isValidPhone(phone) {
	return phone === "" || /^[0-9+\s().-]{8,20}$/.test(phone);
}

/** Giá tạm tính theo số khách – cùng công thức với trang chi tiết tour. */
export function calculateTotal(price, passengers) {
  return Math.round(passengers.adult * price + passengers.child * price * CHILD_RATE);
}

/** Chuẩn hóa số khách. Trả về { passengers } hoặc { error }. */
export function parsePassengers(raw = {}) {
  const passengers = {};
  for (const key of ["adult", "child", "infant"]) {
    const value = Number(raw?.[key] ?? 0);
    if (!Number.isInteger(value) || value < 0 || value > MAX_PER_TYPE) {
      return { error: `Số lượng khách không hợp lệ (mỗi loại từ 0 đến ${MAX_PER_TYPE}).` };
    }
    passengers[key] = value;
  }
  if (passengers.adult < 1) return { error: "Cần ít nhất 1 người lớn cho mỗi đơn đặt tour." };
  return { passengers };
}

/** Mã đặt tour dạng TT-YYMMDD-XXXX, không trùng với các mã đã có. */
export function generateBookingCode(existingBookings, now = new Date()) {
  const day = now.toISOString().slice(2, 10).replaceAll("-", "");
  const taken = new Set(existingBookings.map((booking) => booking.code));
  let code;
  do {
    code = `TT-${day}-${randomBytes(2).toString("hex").toUpperCase()}`;
  } while (taken.has(code));
  return code;
}

/** Tạo đơn đặt tour mới (chưa lưu). Dữ liệu đầu vào phải được kiểm tra trước đó. */
export function createBooking({ user, tour, departureDate, passengers, phone = "", note = "", passengerDetails = [], status = "pending", paymentStatus = "unpaid", createdAt = new Date(), existingBookings = [] }) {
  const timestamp = createdAt.toISOString();
  const subtotal = calculateTotal(tour.price, passengers);
  return {
    id: randomUUID(),
    code: generateBookingCode(existingBookings, createdAt),
    userId: user.id,
    tour: { id: tour.id, name: tour.name, place: tour.place, region: tour.region, duration: tour.duration, price: tour.price, image: tour.image },
    departureDate,
    passengers,
    passengerDetails, // danh sách hành khách chi tiết (họ tên, giới tính, ngày sinh, giấy tờ) – rỗng với đơn mẫu cũ
    subtotal,
    total: subtotal,
    status,
    paymentStatus,
    contact: { name: user.name, email: user.email, phone },
    note,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Bỏ các trường nội bộ trước khi trả về cho client. */
export function publicBooking(booking) {
  const { userId, ...rest } = booking;
  return rest;
}

/**
 * Lịch sử đặt tour của MỘT người dùng.
 * query: { q, status, payment, sort }
 *  - q: tìm theo tên tour, địa điểm, tỉnh hoặc mã đặt tour (không phân biệt dấu/hoa thường)
 *  - status: pending | confirmed | completed | cancelled (bỏ trống = tất cả)
 *  - payment: unpaid | paid | refunded (bỏ trống = tất cả)
 *  - sort: newest (mặc định) | departure-asc | total-desc
 * Trả về { error } nếu tham số sai, hoặc { bookings, counts, totalAll }:
 *  - counts: số đơn theo từng trạng thái (đã áp dụng q + payment, chưa áp dụng status) để hiển thị trên bộ lọc
 *  - totalAll: tổng số đơn của người dùng, không phụ thuộc bộ lọc (để phân biệt "chưa có đơn" với "không khớp bộ lọc")
 */
export function listUserBookings(allBookings, userId, query = {}) {
  const keyword = asString(query.q);
  if (keyword.length > 100) return { error: "Từ khóa quá dài (tối đa 100 ký tự)." };

  const status = asString(query.status);
  if (status && !BOOKING_STATUSES.includes(status)) return { error: "Trạng thái đặt tour không hợp lệ." };
  const payment = asString(query.payment);
  if (payment && !PAYMENT_STATUSES.includes(payment)) return { error: "Trạng thái thanh toán không hợp lệ." };
  const sort = SORTS.has(asString(query.sort)) ? asString(query.sort) : "newest";

  const mine = allBookings.filter((booking) => booking.userId === userId);
  const tokens = normalizeText(keyword).split(/\s+/).filter(Boolean);

  const base = mine.filter((booking) => {
    if (payment && booking.paymentStatus !== payment) return false;
    const haystack = normalizeText(`${booking.tour.name} ${booking.tour.place} ${booking.tour.region} ${booking.code}`);
    return tokens.every((token) => haystack.includes(token));
  });

  const counts = { all: base.length };
  for (const key of BOOKING_STATUSES) counts[key] = base.filter((booking) => booking.status === key).length;

  const bookings = base.filter((booking) => !status || booking.status === status);
  if (sort === "newest") bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (sort === "departure-asc") bookings.sort((a, b) => a.departureDate.localeCompare(b.departureDate));
  if (sort === "total-desc") bookings.sort((a, b) => b.total - a.total);

  return { bookings: bookings.map(publicBooking), counts, totalAll: mine.length };
}

/** Một đơn theo id, chỉ khi thuộc về userId (đơn của người khác coi như không tồn tại). */
export function findUserBooking(allBookings, userId, id) {
  const booking = allBookings.find((item) => item.id === id && item.userId === userId);
  return booking ? publicBooking(booking) : null;
}

const isoDate = (date) => date.toISOString().slice(0, 10);
function shiftDays(base, days) {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Dữ liệu mẫu để demo/kiểm thử trang lịch sử (chỉ dùng ở môi trường phát triển). */
export function buildDemoBookings(user, now = new Date()) {
  const byId = (id) => tours.find((tour) => tour.id === id);
  const plan = [
    { tour: "ha-long-3n2d", bookedAgo: 3, departIn: 12, passengers: { adult: 2, child: 1, infant: 0 }, status: "confirmed", paymentStatus: "paid", phone: "0901234567", note: "Gia đình có 1 bé 8 tuổi, nhờ xếp phòng gần nhau." },
    { tour: "da-lat-3n2d", bookedAgo: 1, departIn: 25, passengers: { adult: 2, child: 0, infant: 0 }, status: "pending", paymentStatus: "unpaid", phone: "0901234567", note: "" },
    { tour: "hoi-an-2n1d", bookedAgo: 40, departIn: -20, passengers: { adult: 2, child: 0, infant: 1 }, status: "completed", paymentStatus: "paid", phone: "0901234567", note: "" },
    { tour: "phu-quoc-4n3d", bookedAgo: 30, departIn: 40, passengers: { adult: 3, child: 0, infant: 0 }, status: "cancelled", paymentStatus: "refunded", phone: "", note: "Đổi kế hoạch công tác." },
    { tour: "ta-xua-2n1d", bookedAgo: 75, departIn: -55, passengers: { adult: 1, child: 0, infant: 0 }, status: "completed", paymentStatus: "paid", phone: "", note: "" },
    { tour: "sa-pa-3n2d", bookedAgo: 8, departIn: 18, passengers: { adult: 2, child: 2, infant: 0 }, status: "pending", paymentStatus: "unpaid", phone: "0987654321", note: "Cần ăn chay một bữa." },
  ];

  const created = [];
  for (const item of plan) {
    const createdAt = shiftDays(now, -item.bookedAgo);
    created.push(
      createBooking({
        user,
        tour: byId(item.tour),
        departureDate: isoDate(shiftDays(now, item.departIn)),
        passengers: item.passengers,
        phone: item.phone,
        note: item.note,
        status: item.status,
        paymentStatus: item.paymentStatus,
        createdAt,
        existingBookings: created,
      }),
    );
  }
  return created;
}
