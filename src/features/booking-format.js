// Hàm dùng chung cho các trang Lịch sử đặt tour / Chi tiết đơn đặt tour.
const priceFormat = new Intl.NumberFormat("vi-VN");

export const formatPrice = (value) => `${priceFormat.format(Math.round(value))}đ`;
export const imageUrl = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

/** "2026-11-01" → "01/11/2026" (ngày thuần, không đổi múi giờ). */
export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = String(isoDate).slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

/** ISO datetime → "18/10/2026" theo giờ máy người dùng (dùng cho "ngày đặt", tránh lệch ngày do múi giờ UTC). */
export function formatLocalDate(isoDateTime) {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** ISO datetime → "18/10/2026, 09:30" theo giờ máy người dùng. */
export function formatDateTime(isoDateTime) {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";
  const time = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${formatLocalDate(isoDateTime)}, ${time}`;
}

// Nhãn + tông màu (is-<tone> trong style.css) cho trạng thái đặt tour / thanh toán.
export const BOOKING_STATUS = {
  pending: { label: "Chờ xử lý", tone: "warn" },
  confirmed: { label: "Đã xác nhận", tone: "info" },
  completed: { label: "Đã hoàn thành", tone: "done" },
  cancelled: { label: "Đã hủy", tone: "danger" },
};

export const PAYMENT_STATUS = {
  unpaid: { label: "Chưa thanh toán", tone: "warn" },
  paid: { label: "Đã thanh toán", tone: "info" },
  refunded: { label: "Đã hoàn tiền", tone: "muted" },
};

export function statusBadge(map, key, prefix = "") {
  const entry = map[key] || { label: key || "—", tone: "muted" };
  return `<span class="status-badge is-${entry.tone}">${prefix}${escapeHtml(entry.label)}</span>`;
}

export const guestCount = (passengers) => (passengers?.adult || 0) + (passengers?.child || 0) + (passengers?.infant || 0);

/** Có nhiều hơn một loại khách (người lớn / trẻ em / em bé) không – để quyết định có cần hiển thị chi tiết. */
export const hasMixedGuests = (passengers) => [passengers?.adult, passengers?.child, passengers?.infant].filter(Boolean).length > 1;

export function guestsText(passengers) {
  const parts = [];
  if (passengers?.adult) parts.push(`${passengers.adult} người lớn`);
  if (passengers?.child) parts.push(`${passengers.child} trẻ em`);
  if (passengers?.infant) parts.push(`${passengers.infant} em bé`);
  return parts.join(" · ") || "—";
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Cần đăng nhập.");
    this.name = "AuthRequiredError";
  }
}

/** GET JSON. Ném AuthRequiredError khi 401, Error(message tiếng Việt) với các lỗi còn lại. */
export async function getJson(url) {
  let response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    throw new Error("Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.");
  }
  if (response.status === 401) throw new AuthRequiredError();
  let data = null;
  try {
    data = await response.json();
  } catch {
    // phản hồi không phải JSON (ví dụ lỗi proxy) – dùng thông báo mặc định bên dưới
  }
  if (!response.ok) {
    const error = new Error(data?.error || "Không thể tải dữ liệu. Vui lòng thử lại.");
    error.status = response.status;
    throw error;
  }
  return data;
}

/** Chuyển tới hộp thoại đăng nhập ở trang chủ, đăng nhập xong sẽ quay lại returnTo. */
export function redirectToLogin(returnTo = `${window.location.pathname}${window.location.search}`) {
  window.location.replace(`/index.html?auth=login&returnTo=${encodeURIComponent(returnTo)}`);
}
