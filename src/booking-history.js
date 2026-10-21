import { initHeaderAccount } from "./features/account-menu.js";
import { initNavigation } from "./features/navigation.js";
import {
  AuthRequiredError,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  escapeHtml,
  formatDate,
  formatLocalDate,
  formatPrice,
  getJson,
  guestCount,
  guestsText,
  hasMixedGuests,
  imageUrl,
  redirectToLogin,
  statusBadge,
} from "./features/booking-format.js";

const elements = {
  controls: document.getElementById("bh-controls"),
  form: document.getElementById("bh-search"),
  keyword: document.getElementById("bh-q"),
  payment: document.getElementById("bh-payment"),
  sort: document.getElementById("bh-sort"),
  chips: Array.from(document.querySelectorAll("#bh-chips .chip")),
  count: document.getElementById("bh-count"),
  reset: document.getElementById("bh-reset"),
  list: document.getElementById("bh-list"),
  state: document.getElementById("bh-state"),
};

const state = { q: "", status: "", payment: "", sort: "newest" };
let requestId = 0; // bỏ qua phản hồi cũ khi người dùng gõ/lọc nhanh
let hasLoaded = false;
let searchTimer;

const hasActiveFilters = () => Boolean(state.q || state.status || state.payment);

// Đơn đã hoàn thành: mời đánh giá (hoặc báo đã đánh giá)
function reviewAction(booking, detailUrl) {
  if (booking.status !== "completed") return "";
  if (booking.reviewed) return '<span class="review-done">★ Đã đánh giá</span>';
  return `<a class="secondary-cta bh-review-link" href="${detailUrl}&review=1" aria-label="Đánh giá tour, đơn ${escapeHtml(booking.code)}">★ Đánh giá tour</a>`;
}

function bookingCard(booking) {
  const detailUrl = `/booking-detail.html?id=${encodeURIComponent(booking.id)}`;
  const { tour, passengers } = booking;
  return `
    <article class="bh-card">
      <a class="bh-card-image" href="${detailUrl}" tabindex="-1" aria-hidden="true">
        <img src="${imageUrl(tour.image, 700)}" alt="" loading="lazy" />
      </a>
      <div class="bh-card-body">
        <div class="bh-card-top">
          <p class="bh-code">Mã đặt tour <strong>${escapeHtml(booking.code)}</strong></p>
          <div class="bh-badges">${statusBadge(BOOKING_STATUS, booking.status)}${statusBadge(PAYMENT_STATUS, booking.paymentStatus)}</div>
        </div>
        <h2 class="bh-card-title">${escapeHtml(tour.name)}</h2>
        <p class="bh-place">${escapeHtml(tour.place)}, ${escapeHtml(tour.region)} · ${escapeHtml(tour.duration)}</p>
        <dl class="bh-facts">
          <div><dt>Ngày đặt</dt><dd>${formatLocalDate(booking.createdAt)}</dd></div>
          <div><dt>Ngày khởi hành</dt><dd>${formatDate(booking.departureDate)}</dd></div>
          <div><dt>Số khách</dt><dd>${guestCount(passengers)} khách${hasMixedGuests(passengers) ? `<small>${escapeHtml(guestsText(passengers))}</small>` : ""}</dd></div>
        </dl>
        <div class="bh-card-footer">
          <div class="bh-total"><span>Tổng tiền</span><strong>${formatPrice(booking.total)}</strong></div>
          <div class="bh-card-actions">
            ${reviewAction(booking, detailUrl)}
            <a class="submit-button" href="${detailUrl}" aria-label="Xem chi tiết đơn ${escapeHtml(booking.code)}">Xem chi tiết <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
    </article>`;
}

function skeletonCards() {
  return Array.from({ length: 3 }, () => `
    <div class="bh-card is-skeleton" aria-hidden="true">
      <div class="bh-card-image"></div>
      <div class="bh-card-body"><span></span><span></span><span class="is-short"></span></div>
    </div>`).join("");
}

function showState(kind, message = "") {
  const variants = {
    empty: {
      title: "Bạn chưa có đơn đặt tour nào",
      text: "Khi đặt tour, các đơn của bạn sẽ xuất hiện tại đây để bạn theo dõi trạng thái và thanh toán.",
      actions: `<a class="submit-button" href="/tour-list.html">Khám phá tour <span aria-hidden="true">↗</span></a>${
        import.meta.env.DEV ? '<button class="secondary-cta bh-demo" type="button" data-action="demo">Tạo dữ liệu mẫu (chỉ khi phát triển)</button>' : ""
      }`,
    },
    "no-match": {
      title: "Không tìm thấy đơn đặt tour phù hợp",
      text: "Hãy thử đổi từ khóa hoặc bỏ bớt bộ lọc.",
      actions: '<button class="submit-button" type="button" data-action="clear">Xóa bộ lọc</button>',
    },
    error: {
      title: "Không tải được lịch sử đặt tour",
      text: message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
      actions: '<button class="submit-button" type="button" data-action="retry">Thử lại</button>',
    },
  };
  const variant = variants[kind];
  elements.state.className = `bh-state is-${kind}`;
  elements.state.setAttribute("role", kind === "error" ? "alert" : "status");
  elements.state.innerHTML = `<strong>${variant.title}</strong><span>${escapeHtml(variant.text)}</span><div class="bh-state-actions">${variant.actions}</div>`;
  elements.state.hidden = false;
}

function render(data) {
  hasLoaded = true;
  elements.controls.hidden = data.totalAll === 0;

  if (data.totalAll === 0) {
    elements.list.innerHTML = "";
    showState("empty");
    return;
  }

  elements.chips.forEach((chip) => {
    const key = chip.dataset.status || "all";
    chip.querySelector("[data-count]").textContent = String(data.counts?.[key] ?? 0);
  });
  elements.count.textContent = `${data.total} đơn đặt tour`;
  elements.reset.hidden = !hasActiveFilters();

  if (!data.bookings.length) {
    elements.list.innerHTML = "";
    showState("no-match");
    return;
  }
  elements.state.hidden = true;
  elements.list.innerHTML = data.bookings.map(bookingCard).join("");
}

async function loadBookings() {
  const currentRequest = ++requestId;
  elements.list.setAttribute("aria-busy", "true");
  elements.state.hidden = true;
  if (hasLoaded) elements.list.classList.add("is-loading");
  else elements.list.innerHTML = skeletonCards();

  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.status) params.set("status", state.status);
  if (state.payment) params.set("payment", state.payment);
  if (state.sort !== "newest") params.set("sort", state.sort);

  try {
    const data = await getJson(`/api/bookings?${params}`);
    if (currentRequest !== requestId) return;
    render(data);
  } catch (error) {
    if (currentRequest !== requestId) return;
    if (error instanceof AuthRequiredError) {
      redirectToLogin("/booking-history.html"); // Chưa đăng nhập → trang đăng nhập, xong quay lại đây
      return;
    }
    elements.list.innerHTML = "";
    showState("error", error.message);
  } finally {
    if (currentRequest === requestId) {
      elements.list.setAttribute("aria-busy", "false");
      elements.list.classList.remove("is-loading");
    }
  }
}

function setStatus(status) {
  state.status = status;
  elements.chips.forEach((chip) => {
    const active = (chip.dataset.status || "") === status;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
}

function clearFilters() {
  window.clearTimeout(searchTimer);
  state.q = "";
  state.payment = "";
  elements.form.reset();
  elements.sort.value = state.sort; // giữ cách sắp xếp hiện tại
  setStatus("");
  loadBookings();
}

async function createDemoData() {
  try {
    const response = await fetch("/api/dev/demo-bookings", { method: "POST" });
    if (response.status === 401) throw new AuthRequiredError();
    if (!response.ok && response.status !== 409) throw new Error("Không thể tạo dữ liệu mẫu.");
    loadBookings();
  } catch (error) {
    if (error instanceof AuthRequiredError) redirectToLogin("/booking-history.html");
    else showState("error", error.message);
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  window.clearTimeout(searchTimer);
  state.q = elements.keyword.value.trim();
  loadBookings();
});
elements.keyword.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.q = elements.keyword.value.trim();
    loadBookings();
  }, 300);
});
elements.payment.addEventListener("change", () => {
  state.payment = elements.payment.value;
  loadBookings();
});
elements.sort.addEventListener("change", () => {
  state.sort = elements.sort.value;
  loadBookings();
});
elements.chips.forEach((chip) => chip.addEventListener("click", () => {
  setStatus(chip.dataset.status || "");
  loadBookings();
}));
elements.reset.addEventListener("click", clearFilters);
elements.state.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "retry") loadBookings();
  if (action === "clear") clearFilters();
  if (action === "demo") createDemoData();
});
// Ảnh tour lỗi thì giữ nền gradient thay vì hiện icon ảnh hỏng
elements.list.addEventListener("error", (event) => {
  if (event.target.tagName === "IMG") event.target.closest(".bh-card-image")?.classList.add("is-broken");
}, true);

initNavigation();
initHeaderAccount();
loadBookings();
