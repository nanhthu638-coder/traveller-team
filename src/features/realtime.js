// ===== Hệ thống Real-Time (Server-Sent Events) dùng chung cho Khách hàng & Admin =====

let eventSource = null;
let isConnected = false;
let reconnectTimer = null;
const subscribers = new Set();
const statusListeners = new Set();

export const FALLBACK_TOUR_IMAGE = "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80";

/**
 * Chuẩn hóa URL hình ảnh Tour / Địa điểm:
 * Hỗ trợ cả mã ảnh Unsplash ("photo-...") lẫn đường dẫn đầy đủ ("https://...", "/...", "data:...").
 */
export function resolveTourImageUrl(raw, width = 900) {
  const value = String(raw || "").trim();
  if (!value) return FALLBACK_TOUR_IMAGE;
  if (/^(https?:\/\/|\/|data:)/i.test(value)) return value;
  return `https://images.unsplash.com/${value}?auto=format&fit=crop&w=${width}&q=80`;
}

function notifyStatus(connected) {
  isConnected = connected;
  for (const listener of statusListeners) {
    try {
      listener(connected);
    } catch {
      // ignore listener errors
    }
  }
}

function ensureConnection() {
  if (eventSource || typeof window === "undefined" || typeof EventSource === "undefined") return;

  try {
    eventSource = new EventSource("/api/realtime/stream");

    eventSource.onopen = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      notifyStatus(true);
    };

    eventSource.onmessage = (event) => {
      if (!event.data) return;
      let parsed;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!parsed || !parsed.type) return;
      if (parsed.type === "connected") {
        notifyStatus(true);
      }

      for (const sub of subscribers) {
        if (sub.types.has("*") || sub.types.has(parsed.type)) {
          try {
            sub.callback(parsed);
          } catch (err) {
            console.error("[Realtime subscriber error]", err);
          }
        }
      }
    };

    eventSource.onerror = () => {
      notifyStatus(false);
      if (eventSource && eventSource.readyState === EventSource.CLOSED) {
        eventSource = null;
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            ensureConnection();
          }, 3000);
        }
      }
    };
  } catch {
    notifyStatus(false);
  }
}

/**
 * Đăng ký lắng nghe sự kiện Real-time từ máy chủ.
 * @param {string | string[]} eventTypes - Tên sự kiện hoặc mảng sự kiện (hoặc "*" cho tất cả)
 * @param {(event: { type: string, payload: any, timestamp: string }) => void} callback
 * @returns {() => void} Hàm hủy đăng ký
 */
export function subscribeRealtime(eventTypes, callback) {
  const types = new Set(Array.isArray(eventTypes) ? eventTypes : [eventTypes]);
  const entry = { types, callback };
  subscribers.add(entry);
  ensureConnection();
  return () => {
    subscribers.delete(entry);
  };
}

/**
 * Theo dõi trạng thái kết nối Real-time (true = đang kết nối, false = mất kết nối/đang kết nối lại)
 */
export function onRealtimeStatus(callback) {
  statusListeners.add(callback);
  ensureConnection();
  callback(isConnected);
  return () => {
    statusListeners.delete(callback);
  };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function getToastStack() {
  let stack = document.getElementById("rt-toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "rt-toast-stack";
    stack.className = "rt-toast-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  return stack;
}

/**
 * Hiển thị thông báo nổi (Toast) thời gian thực trên giao diện Khách hàng.
 */
export function showRealtimeToast({ title, message = "", tone = "info", actionLabel = "", actionHref = "", duration = 5500 }) {
  const stack = getToastStack();
  const toast = document.createElement("div");
  toast.className = `rt-toast is-${tone}`;

  const icons = {
    info: "🔔",
    success: "🎉",
    warn: "⚡",
    danger: "⚠️",
  };

  toast.innerHTML = `
    <div class="rt-toast-icon" aria-hidden="true">${icons[tone] || "🔔"}</div>
    <div class="rt-toast-body">
      <div class="rt-toast-head">
        <strong>${escapeHtml(title)}</strong>
        <span class="rt-toast-live"><span class="rt-live-dot"></span>Trực tuyến</span>
      </div>
      ${message ? `<p>${escapeHtml(message)}</p>` : ""}
      ${actionLabel && actionHref ? `<a class="rt-toast-link" href="${escapeHtml(actionHref)}">${escapeHtml(actionLabel)} →</a>` : ""}
    </div>
    <button type="button" class="rt-toast-close" aria-label="Đóng thông báo">×</button>
  `;

  const remove = () => {
    toast.classList.add("is-leaving");
    setTimeout(() => toast.remove(), 220);
  };

  toast.querySelector(".rt-toast-close")?.addEventListener("click", remove);
  stack.appendChild(toast);

  // Giới hạn tối đa 3 toast hiển thị cùng lúc
  while (stack.children.length > 3) {
    stack.firstElementChild?.remove();
  }

  if (duration > 0) {
    setTimeout(remove, duration);
  }
}

/**
 * Tạo nhãn hiển thị số chỗ còn lại theo chuẩn các nền tảng đặt tour thực tế (Klook, Traveloka, iVIVU)
 */
export function renderSeatBadge(tour) {
  const remaining = Number(tour.remainingSeats ?? tour.maxGuests ?? 25);
  const capacity = Number(tour.nextCapacity ?? tour.maxGuests ?? 25);
  if (remaining <= 0) {
    return `<span class="tour-seat-badge is-soldout" title="Ngày khởi hành gần nhất đã hết chỗ">Hết chỗ đợt gần nhất</span>`;
  }
  if (remaining <= 6) {
    return `<span class="tour-seat-badge is-hot" title="Sắp hết chỗ cho đợt khởi hành gần nhất">🔥 Chỉ còn ${remaining} chỗ</span>`;
  }
  return `<span class="tour-seat-badge is-available" title="Sức chứa tối đa ${capacity} khách/đoàn">Còn ${remaining}/${capacity} chỗ</span>`;
}
