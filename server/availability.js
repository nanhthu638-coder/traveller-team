// ===== Kiểm tra chỗ trống theo từng ngày khởi hành (Story: Đặt tour – chọn số lượng khách, kiểm tra chỗ trống) =====
// Logic thuần, không đụng tới Express. Quy ước:
//  - Mỗi ngày khởi hành của một tour có sức chứa cố định (CAPACITY_BY_TOUR, mặc định DEFAULT_CAPACITY).
//  - Chỗ đã đặt = số người lớn + trẻ em của các đơn CHƯA HỦY (em bé dưới 2 tuổi không chiếm chỗ riêng).
//  - Khi có cơ sở dữ liệu thật, chỉ cần thay `CAPACITY_BY_TOUR` bằng cột sức chứa của tour.
export const DEFAULT_CAPACITY = 30;

const CAPACITY_BY_TOUR = {
  "ha-long-3n2d": 30,
  "hoi-an-2n1d": 25,
  "ta-xua-2n1d": 16,
  "ha-giang-4n3d": 12,
  "phu-quoc-4n3d": 30,
  "da-lat-3n2d": 28,
  "sa-pa-3n2d": 25,
  "con-dao-3n2d": 20,
  "hue-da-nang-4n3d": 25,
};

export const capacityOf = (tourId) => CAPACITY_BY_TOUR[tourId] ?? DEFAULT_CAPACITY;

/** Số chỗ một đơn chiếm: người lớn + trẻ em (em bé không chiếm chỗ). */
export const seatsOf = (passengers) => (passengers?.adult || 0) + (passengers?.child || 0);

/** Tình trạng chỗ của một ngày khởi hành: { date, capacity, booked, remaining }. */
export function departureAvailability(tour, date, bookings) {
  const capacity = capacityOf(tour.id);
  const booked = bookings
    .filter((booking) => booking.status !== "cancelled" && booking.tour?.id === tour.id && booking.departureDate === date)
    .reduce((sum, booking) => sum + seatsOf(booking.passengers), 0);
  return { date, capacity, booked: Math.min(booked, capacity), remaining: Math.max(0, capacity - booked) };
}

/** Tình trạng chỗ của mọi ngày khởi hành còn hiệu lực (>= today) của tour. */
export function tourAvailability(tour, bookings, today) {
  return tour.departures.filter((date) => date >= today).map((date) => departureAvailability(tour, date, bookings));
}
