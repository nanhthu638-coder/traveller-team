import QRCode from "qrcode";
import { initHeaderAccount } from "./features/account-menu.js";
import { initNavigation } from "./features/navigation.js";
import { escapeHtml, formatDate, formatPrice } from "./features/booking-format.js";

const container = document.getElementById("checkout");
const bookingId = new URLSearchParams(window.location.search).get("bookingId");
let paymentData;
let voucherMessage = "";
let voucherMessageIsError = false;

function render() {
  const { booking, payment } = paymentData;
  const confirmed = payment.status === "confirmed";
  const availableVouchers = Array.isArray(paymentData.vouchers) ? paymentData.vouchers : [];
  const state = confirmed
    ? '<p class="checkout-state is-success" role="status"><span aria-hidden="true">✓</span> Giao dịch thành công! Đơn hàng đã được thanh toán.</p>'
    : '<p class="checkout-state" role="status">Quét mã QR để hoàn tất thanh toán cho đơn hàng.</p>';

  container.innerHTML = `
    <a class="detail-back" href="/booking-history.html">← Lịch sử đặt tour</a>
    <header class="checkout-heading"><p class="eyebrow eyebrow-dark"><span></span> Thanh toán trực tuyến</p>
      <h1 class="font-display">Thanh toán đơn hàng</h1>
      <p>Đơn <strong>${escapeHtml(booking.code)}</strong> · Khởi hành ${formatDate(booking.departureDate)}</p></header>
    <div class="checkout-layout">
      <section class="profile-card checkout-payment"><h2>Quét mã thanh toán</h2>${state}
        ${confirmed ? "" : `<div class="checkout-qr-panel"><div class="checkout-qr" data-payment-qr aria-label="Mã QR thanh toán"></div><p>Mở camera để quét mã và kiểm tra thông tin đơn hàng</p></div>`}
        ${confirmed ? "" : `<div class="checkout-voucher">
          <label for="checkout-voucher">Mã giảm giá</label>
          <div class="checkout-voucher-row">
            <input id="checkout-voucher" type="text" value="${escapeHtml(booking.voucher?.code || "")}" placeholder="Nhập mã giảm giá" list="checkout-voucher-options" autocomplete="off" />
            <datalist id="checkout-voucher-options">
              ${availableVouchers.map((voucher) => `<option value="${escapeHtml(voucher.code)}">${escapeHtml(voucher.code)} · giảm ${formatPrice(voucher.discount)}</option>`).join("")}
            </datalist>
            <button class="secondary-cta" type="button" data-apply-voucher>Áp dụng</button>
          </div>
          <p class="checkout-voucher-status${voucherMessageIsError ? " is-error" : ""}" role="status" aria-live="polite">${escapeHtml(voucherMessage)}</p>
        </div>`}
        <dl class="checkout-bank">
          <div><dt>Mã giao dịch</dt><dd>${escapeHtml(payment.id.slice(0, 8).toUpperCase())}</dd></div>
          <div><dt>Số tiền</dt><dd>${formatPrice(payment.amount)}</dd></div>
          <div><dt>Phương thức</dt><dd>Quét mã QR</dd></div>
        </dl>
        ${confirmed ? "" : '<button class="submit-button checkout-demo-pay" type="button" data-demo-confirm>Quét mã thanh toán</button>'}
        <p class="checkout-disclaimer">Mã QR và trạng thái xác nhận chỉ phục vụ trình diễn; không kết nối ngân hàng, không chuyển tiền thật.</p>
        <p class="checkout-error" role="alert" hidden></p>
      </section>
      <aside class="profile-card checkout-summary"><h2>Chi tiết đơn</h2>
        <p class="checkout-tour-name">${escapeHtml(booking.tour.name)}</p>
        <p>${escapeHtml(booking.passengers.adult)} người lớn${booking.passengers.child ? ` · ${escapeHtml(booking.passengers.child)} trẻ em` : ""}${booking.passengers.infant ? ` · ${escapeHtml(booking.passengers.infant)} em bé` : ""}</p>
        <dl class="checkout-totals">
          <div><dt>Tạm tính</dt><dd>${formatPrice(booking.subtotal ?? booking.total)}</dd></div>
          ${booking.discount ? `<div><dt>Voucher ${escapeHtml(booking.voucher?.code || "")}</dt><dd>−${formatPrice(booking.discount)}</dd></div>` : ""}
          <div class="checkout-total"><dt>${confirmed ? "Đã thanh toán" : "Tổng thanh toán"}</dt><dd>${formatPrice(booking.total)}</dd></div>
        </dl>
        <a class="secondary-cta" href="/booking-detail.html?id=${encodeURIComponent(booking.id)}">Xem chi tiết đơn</a>
      </aside>
    </div>`;

  container.querySelector("[data-demo-confirm]")?.addEventListener("click", confirmDemoPayment);
  container.querySelector("[data-apply-voucher]")?.addEventListener("click", applyVoucher);
  if (!confirmed) renderPaymentQr();
  container.setAttribute("aria-busy", "false");
}

async function applyVoucher() {
  const button = container.querySelector("[data-apply-voucher]");
  const select = container.querySelector("#checkout-voucher");
  button.disabled = true;
  voucherMessage = "";
  voucherMessageIsError = false;
  try {
    const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/voucher`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: select.value }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể áp dụng mã giảm giá.");
    paymentData.booking = data.booking;
    if (data.payment) paymentData.payment = data.payment;
    voucherMessage = data.discount
      ? `Đã áp dụng ${data.booking.voucher.code}, giảm ${formatPrice(data.discount)}.`
      : "Đã gỡ mã giảm giá.";
    render();
  } catch (error) {
    voucherMessage = error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message;
    voucherMessageIsError = true;
    render();
  }
}

async function renderPaymentQr() {
  const qrContainer = container.querySelector("[data-payment-qr]");
  if (!qrContainer) return;
  const { booking, payment } = paymentData;
  const payload = `TRAVELLER-PAYMENT|${booking.code}|${payment.id}|${payment.amount}`;
  try {
    const dataUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 2, width: 280 });
    if (qrContainer.isConnected) {
      qrContainer.innerHTML = `<img src="${dataUrl}" alt="Mã QR thanh toán cho đơn ${escapeHtml(booking.code)}" />`;
    }
  } catch (error) {
    const errorBox = container.querySelector(".checkout-error");
    errorBox.textContent = `Không thể tạo mã QR: ${error.message}`;
    errorBox.hidden = false;
  }
}

async function confirmDemoPayment() {
  const button = container.querySelector("[data-demo-confirm]");
  const error = container.querySelector(".checkout-error");
  button.disabled = true;
  error.hidden = true;
  try {
    const response = await fetch(`/api/payments/${encodeURIComponent(paymentData.payment.id)}/demo-confirm`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể hoàn tất thanh toán demo.");
    paymentData.payment = data.payment;
    paymentData.booking = data.booking;
    render();
  } catch (failure) {
    error.textContent = failure instanceof TypeError ? "Không thể kết nối máy chủ." : failure.message;
    error.hidden = false;
    button.disabled = false;
  }
}

async function loadPayment() {
  if (!bookingId) {
    container.innerHTML = '<p class="checkout-config-warning">Thiếu mã đơn đặt tour để thanh toán.</p>';
    container.setAttribute("aria-busy", "false");
    return;
  }
  try {
    const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/payment`);
    const data = await response.json();
    if (response.status === 401) {
      window.location.replace(`/index.html?auth=login&returnTo=${encodeURIComponent(`/checkout.html?bookingId=${bookingId}`)}`);
      return;
    }
    if (!response.ok) throw new Error(data.error || "Không thể tải giao dịch thanh toán.");
    paymentData = data;
    if (data.booking.paymentStatus === "paid") {
      container.innerHTML = '<p class="checkout-config-warning" role="status">Đơn này đã được thanh toán.</p><a class="secondary-cta" href="/booking-detail.html?id=' + encodeURIComponent(data.booking.id) + '">Quay lại chi tiết đơn</a>';
      container.setAttribute("aria-busy", "false");
      return;
    }
    render();
  } catch (error) {
    container.innerHTML = `<p class="checkout-config-warning" role="alert">${escapeHtml(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message)}</p>`;
    container.setAttribute("aria-busy", "false");
  }
}

initNavigation();
initHeaderAccount();
loadPayment();
