import { initHeaderAccount } from "./features/account-menu.js";
import { initNavigation } from "./features/navigation.js";
import { openReviewDialog } from "./features/review-dialog.js";
import { bindReviewImages, reviewCardHtml } from "./features/review-ui.js";
import {
  AuthRequiredError,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  escapeHtml,
  formatDate,
  formatDateTime,
  formatPrice,
  getJson,
  guestCount,
  imageUrl,
  redirectToLogin,
  statusBadge,
} from "./features/booking-format.js";

const container = document.getElementById("booking-detail");
const pageParams = new URLSearchParams(window.location.search);
const bookingId = pageParams.get("id");
let showCreatedBanner = pageParams.get("created") === "1"; // vừa đặt tour xong
let openReviewOnLoad = pageParams.get("review") === "1"; // bấm "Đánh giá tour" từ Lịch sử đặt tour
let currentBooking = null;
let currentReview = null;
const BACK_LINK = '<a class="detail-back" href="/booking-history.html">← Quay lại lịch sử đặt tour</a>';

// Lời nhắn theo trạng thái đơn
function statusNote(booking) {
  if (booking.status === "cancelled") {
    return booking.paymentStatus === "refunded"
      ? { tone: "danger", text: "Đơn này đã được hủy và số tiền đã được hoàn lại cho bạn." }
      : { tone: "danger", text: "Đơn này đã được hủy. Nếu bạn đã thanh toán, vui lòng liên hệ Traveller Team để được hướng dẫn hoàn tiền." };
  }
  if (booking.status === "completed") return { tone: "done", text: "Chuyến đi đã hoàn thành. Cảm ơn bạn đã đồng hành cùng Traveller Team!" };
  if (booking.status === "confirmed") return { tone: "info", text: "Đơn đã được xác nhận. Chúc bạn có một chuyến đi thật vui." };
  return { tone: "warn", text: "Đơn đang chờ Traveller Team xử lý. Chúng tôi sẽ liên hệ xác nhận sớm nhất có thể." };
}

function cancellationPanel(booking) {
  if (booking.status === "cancelled" || booking.status === "completed") return "";
  const request = booking.cancellationRequest;
  if (request?.status === "pending") {
    return `<section class="detail-section bd-cancellation"><h2>Yêu cầu hủy</h2><p>Yêu cầu hủy của bạn đang chờ Traveller Team xử lý.</p>${request.reason ? `<p><strong>Lý do:</strong> ${escapeHtml(request.reason)}</p>` : ""}</section>`;
  }
  const previousRequestNote = request?.status === "rejected"
    ? "<p>Yêu cầu hủy trước đó đã bị từ chối. Nếu cần, bạn có thể gửi yêu cầu mới.</p>"
    : "";
  return `<section class="detail-section bd-cancellation"><h2>Yêu cầu hủy đơn</h2>${previousRequestNote}<p>Nếu bạn muốn hủy chuyến đi, gửi yêu cầu để Traveller Team xem xét.</p><button class="secondary-cta" type="button" data-booking-action="request-cancellation">Gửi yêu cầu hủy</button><p class="review-inline-error" data-cancellation-error role="alert" hidden></p></section>`;
}

function priceLines(booking) {
  const { price } = booking.tour;
  const { adult, child, infant } = booking.passengers;
  const lines = [];
  if (adult) lines.push(`<li><span>Người lớn<small>${adult} × ${formatPrice(price)}</small></span><strong>${formatPrice(adult * price)}</strong></li>`);
  if (child) lines.push(`<li><span>Trẻ em (70% giá)<small>${child} × ${formatPrice(price * 0.7)}</small></span><strong>${formatPrice(child * price * 0.7)}</strong></li>`);
  if (infant) lines.push(`<li><span>Em bé<small>${infant} em bé</small></span><strong>Miễn phí</strong></li>`);
  return lines.join("");
}

const GENDER_LABEL = { male: "Nam", female: "Nữ", other: "Khác" };
const TYPE_LABEL = { adult: "Người lớn", child: "Trẻ em", infant: "Em bé" };

// Danh sách hành khách (đơn mẫu cũ không có thì bỏ qua). Số giấy tờ chỉ hiện 3 ký tự cuối.
function passengerSection(booking) {
  const list = Array.isArray(booking.passengerDetails) ? booking.passengerDetails : [];
  if (!list.length) return "";
  const items = list.map((item, index) => `
    <li>
      <span class="bd-pax-no">${index + 1}</span>
      <div><strong>${escapeHtml(item.fullName)}</strong><small>${TYPE_LABEL[item.type] || "Hành khách"} · ${GENDER_LABEL[item.gender] || "—"} · Sinh ${formatDate(item.dob)}${item.idNumber ? ` · Giấy tờ •••${escapeHtml(item.idNumber.slice(-3))}` : ""}</small></div>
    </li>`).join("");
  return `<section class="detail-section"><h2>Danh sách hành khách</h2><ol class="bd-pax-list">${items}</ol></section>`;
}

// Hộp "Đánh giá tour": chỉ hiện với đơn chưa hủy
function reviewPanel(booking, review) {
  if (booking.status === "cancelled") return "";
  let body;
  if (booking.status === "completed") {
    body = review
      ? `${reviewCardHtml(review, { actions: true })}<a class="booking-help" href="/tour-detail.html?id=${encodeURIComponent(booking.tour.id)}#reviews">Xem trên trang tour ↗</a>`
      : '<p>Chuyến đi đã hoàn thành. Hãy chia sẻ trải nghiệm của bạn để giúp những du khách khác!</p><button class="submit-button" type="button" data-review-action="write">★ Đánh giá tour</button>';
  } else {
    body = '<p>Bạn có thể đánh giá tour sau khi chuyến đi hoàn thành.</p>';
    if (import.meta.env.DEV) {
      body += '<button class="secondary-cta bd-dev-complete" type="button" data-review-action="dev-complete">Giả lập: đánh dấu đã hoàn thành (chỉ khi phát triển)</button>';
    }
  }
  return `<section class="detail-section" id="review"><h2>Đánh giá tour</h2><div class="bd-review">${body}</div><p class="review-inline-error" data-review-error role="alert" hidden></p></section>`;
}

function renderBooking(booking, review) {
  const { tour, passengers, contact } = booking;
  const note = statusNote(booking);
  const guestRows = [
    ["Người lớn", passengers.adult],
    ["Trẻ em", passengers.child],
    ["Em bé", passengers.infant],
  ].filter(([, amount]) => amount > 0).map(([label, amount]) => `${label}: ${amount}`).join(" · ");

  const successBanner = showCreatedBanner
    ? `<div class="bd-success" role="status"><strong>Đặt tour thành công!</strong><span>Mã đặt tour của bạn là <b>${escapeHtml(booking.code)}</b>. Đơn đang chờ Traveller Team xác nhận, bạn có thể theo dõi trong Lịch sử đặt tour.</span></div>`
    : "";

  return `
    ${BACK_LINK}
    ${successBanner}
    <header class="bd-header">
      <p class="eyebrow eyebrow-dark"><span></span> Chi tiết đơn đặt tour</p>
      <h1 class="font-display">${escapeHtml(tour.name)}</h1>
      <div class="bd-header-meta">
        <span class="bh-code">Mã đặt tour <strong>${escapeHtml(booking.code)}</strong></span>
        <span class="bh-badges">${statusBadge(BOOKING_STATUS, booking.status)}${statusBadge(PAYMENT_STATUS, booking.paymentStatus)}</span>
      </div>
    </header>

    <div class="bd-layout">
      <div class="bd-main">
        <div class="bd-hero"><img src="${imageUrl(tour.image, 1200)}" alt="${escapeHtml(tour.name)}" /></div>

        <section class="detail-section">
          <h2>Thông tin chuyến đi</h2>
          <dl class="bd-grid">
            <div><dt>Điểm đến</dt><dd>${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</dd></div>
            <div><dt>Thời lượng</dt><dd>${escapeHtml(tour.duration)}</dd></div>
            <div><dt>Ngày khởi hành</dt><dd>${formatDate(booking.departureDate)}</dd></div>
            <div><dt>Ngày đặt</dt><dd>${formatDateTime(booking.createdAt)}</dd></div>
            <div class="bd-grid-wide"><dt>Số lượng khách</dt><dd>${guestCount(passengers)} khách <small>${escapeHtml(guestRows)}</small></dd></div>
          </dl>
        </section>

        <section class="detail-section">
          <h2>Thông tin người đặt</h2>
          <dl class="bd-grid">
            <div><dt>Họ và tên</dt><dd>${escapeHtml(contact.name)}</dd></div>
            <div><dt>Email</dt><dd>${escapeHtml(contact.email)}</dd></div>
            <div><dt>Số điện thoại</dt><dd>${contact.phone ? escapeHtml(contact.phone) : "Chưa cung cấp"}</dd></div>
            <div class="bd-grid-wide"><dt>Ghi chú</dt><dd>${booking.note ? escapeHtml(booking.note) : "Không có ghi chú"}</dd></div>
          </dl>
        </section>

        ${passengerSection(booking)}

        ${cancellationPanel(booking)}

        ${reviewPanel(booking, review)}
      </div>

      <aside class="bd-aside">
        <div class="booking-box">
          <h2 class="bd-aside-title">Thanh toán</h2>
          <div class="bh-badges">${statusBadge(BOOKING_STATUS, booking.status, "Đơn: ")}${statusBadge(PAYMENT_STATUS, booking.paymentStatus)}</div>
          <ul class="bd-price-lines">${priceLines(booking)}</ul>
          <div class="booking-total"><span>Tổng tiền</span><strong>${formatPrice(booking.total)}</strong></div>
          <p class="bd-note is-${note.tone}">${note.text}</p>
          ${booking.paymentStatus === "unpaid" && booking.status !== "cancelled" ? `<a class="submit-button booking-submit" href="/checkout.html?bookingId=${encodeURIComponent(booking.id)}">Thanh toán trực tuyến <span aria-hidden="true">↗</span></a>` : ""}
          <a class="submit-button booking-submit" href="/tour-detail.html?id=${encodeURIComponent(tour.id)}">Xem lại tour <span aria-hidden="true">↗</span></a>
          <a class="secondary-cta bd-secondary" href="/booking-history.html">Về lịch sử đặt tour</a>
        </div>
      </aside>
    </div>`;
}

function renderMessage(title, message, actions) {
  container.innerHTML = `
    ${BACK_LINK}
    <div class="bh-state is-error" role="alert">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(message)}</span>
      <div class="bh-state-actions">${actions}</div>
    </div>`;
}

async function loadBooking() {
  if (!bookingId) {
    renderMessage("Không tìm thấy đơn đặt tour", "Đường dẫn chưa có mã đơn. Vui lòng chọn đơn từ lịch sử đặt tour.", '<a class="submit-button" href="/booking-history.html">Về lịch sử đặt tour</a>');
    container.setAttribute("aria-busy", "false");
    return;
  }

  container.setAttribute("aria-busy", "true");
  container.innerHTML = '<div class="bd-loading" aria-hidden="true"><span></span><span></span><span class="is-short"></span></div>';
  try {
    const { booking, review } = await getJson(`/api/bookings/${encodeURIComponent(bookingId)}`);
    currentBooking = booking;
    currentReview = review;
    container.innerHTML = renderBooking(booking, review);
    document.title = `Đơn ${booking.code} | Traveller Team`;
    // Bỏ cờ created/review khỏi URL để tải lại trang không lặp lại thông báo hay tự mở form
    if (showCreatedBanner || openReviewOnLoad) window.history.replaceState(null, "", `/booking-detail.html?id=${encodeURIComponent(bookingId)}`);
    showCreatedBanner = false;
    if (openReviewOnLoad && booking.status === "completed" && !review) {
      container.querySelector("#review")?.scrollIntoView({ block: "center" });
      startReview();
    }
    openReviewOnLoad = false;
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirectToLogin();
      return;
    }
    if (error.status === 404) {
      renderMessage("Không tìm thấy đơn đặt tour", "Đơn này không tồn tại hoặc không thuộc tài khoản của bạn.", '<a class="submit-button" href="/booking-history.html">Về lịch sử đặt tour</a>');
    } else {
      renderMessage("Không tải được chi tiết đơn", error.message, '<button class="submit-button" type="button" data-action="retry">Thử lại</button>');
    }
  } finally {
    container.setAttribute("aria-busy", "false");
  }
}

function startReview(review = null) {
  openReviewDialog({ tourName: currentBooking.tour.name, bookingId: currentBooking.id, review, onSaved: loadBooking });
}

function showReviewError(message) {
  const box = container.querySelector("[data-review-error]");
  if (!box) return;
  box.textContent = message;
  box.hidden = !message;
}

async function callApi(url, method, failMessage) {
  try {
    const response = await fetch(url, { method });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || failMessage);
    }
    await loadBooking();
  } catch (error) {
    showReviewError(error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng thử lại." : error.message);
  }
}

async function requestCancellation() {
  const button = container.querySelector('[data-booking-action="request-cancellation"]');
  const error = container.querySelector("[data-cancellation-error]");
  if (!button || !window.confirm("Gửi yêu cầu hủy đơn này để Traveller Team xem xét?")) return;
  button.disabled = true;
  error.hidden = true;
  try {
    const response = await fetch(`/api/bookings/${encodeURIComponent(currentBooking.id)}/cancellation-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể gửi yêu cầu hủy.");
    await loadBooking();
  } catch (failure) {
    error.textContent = failure instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng thử lại." : failure.message;
    error.hidden = false;
    button.disabled = false;
  }
}

container.addEventListener("click", (event) => {
  if (event.target.closest('[data-action="retry"]')) loadBooking();
  if (event.target.closest('[data-booking-action="request-cancellation"]')) requestCancellation();
  const action = event.target.closest("[data-review-action]")?.dataset.reviewAction;
  if (action === "write") startReview();
  if (action === "edit") startReview(currentReview);
  if (action === "delete" && window.confirm("Bạn chắc chắn muốn xóa đánh giá này? Thao tác không thể hoàn tác.")) {
    callApi(`/api/reviews/${encodeURIComponent(currentReview.id)}`, "DELETE", "Không thể xóa đánh giá. Vui lòng thử lại.");
  }
  if (action === "dev-complete") callApi(`/api/dev/bookings/${encodeURIComponent(currentBooking.id)}/complete`, "POST", "Không thể cập nhật trạng thái đơn.");
});
bindReviewImages(container);
// Ảnh tour lỗi thì giữ nền gradient
container.addEventListener("error", (event) => {
  if (event.target.tagName === "IMG") event.target.closest(".bd-hero")?.classList.add("is-broken");
}, true);

initNavigation();
initHeaderAccount();
loadBooking();
