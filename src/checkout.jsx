import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { initHeaderAccount } from "./features/account-menu.js";
import { initNavigation } from "./features/navigation.js";
import { formatDate, formatPrice } from "./features/booking-format.js";

const container = document.getElementById("checkout");
const bookingId = new URLSearchParams(window.location.search).get("bookingId");
const cardSamples = {
  visa: { number: "4111 1111 1111 1111", holder: "NGUYEN VAN A" },
  atm: { number: "9704 1234 5678 9012", holder: "NGUYEN VAN A" },
};

function loginRedirect() {
  window.location.assign(`/index.html?auth=login&returnTo=${encodeURIComponent(`/checkout.html?bookingId=${bookingId}`)}`);
}

async function readResponse(response, fallbackMessage) {
  const result = await response.json();
  if (response.status === 401) {
    loginRedirect();
    throw new Error("Vui lòng đăng nhập để tiếp tục.");
  }
  if (!response.ok) throw new Error(result.error || fallbackMessage);
  return result;
}

function PaymentOption({ active, title, description, icon, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`group flex min-h-24 items-center gap-4 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-wait disabled:opacity-70 ${
        active ? "border-emerald-700 bg-emerald-50 shadow-md ring-2 ring-emerald-700/15" : "border-slate-200 bg-white hover:border-emerald-500"
      }`}
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-xl font-bold ${active ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100"}`} aria-hidden="true">
        {icon}
      </span>
      <span className="grid gap-1">
        <span className="text-base font-bold text-slate-900">{title}</span>
        <span className="text-sm leading-5 text-slate-500">{description}</span>
      </span>
      <span className={`ml-auto size-5 shrink-0 rounded-full border-2 ${active ? "border-emerald-700 bg-emerald-700 shadow-[inset_0_0_0_3px_white]" : "border-slate-300"}`} aria-hidden="true" />
    </button>
  );
}

function Checkout() {
  const [paymentData, setPaymentData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [voucherIsError, setVoucherIsError] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [method, setMethod] = useState("visa");
  const [cardNumber, setCardNumber] = useState(cardSamples.visa.number);
  const [cardHolder, setCardHolder] = useState(cardSamples.visa.holder);
  const [verificationCode, setVerificationCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    container?.setAttribute("aria-busy", String(!paymentData && !loadError));
  }, [paymentData, loadError]);

  useEffect(() => {
    initNavigation();
    initHeaderAccount();
    const controller = new AbortController();

    async function loadPayment() {
      if (!bookingId) {
        setLoadError("Thiếu mã đơn đặt tour để thanh toán.");
        return;
      }
      try {
        const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/payment`, { signal: controller.signal });
        const data = await readResponse(response, "Không thể tải thông tin thanh toán.");
        setPaymentData(data);
        setVoucherCode(data.booking.voucher?.code || "");
        setVerificationCode("");
        if (data.booking.paymentStatus === "paid" || data.payment.status === "confirmed") setIsPaid(true);
      } catch (error) {
        if (error.name !== "AbortError") setLoadError(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message);
      }
    }

    loadPayment();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isPaid) return undefined;
    const redirect = window.setTimeout(() => window.location.assign("/booking-history.html"), 1600);
    return () => window.clearTimeout(redirect);
  }, [isPaid]);

  useEffect(() => {
    if (!isCancelled) return undefined;
    const redirect = window.setTimeout(() => window.location.assign("/booking-history.html"), 1600);
    return () => window.clearTimeout(redirect);
  }, [isCancelled]);

  useEffect(() => {
    const expiresAt = paymentData?.payment?.expiresAt;
    if (!expiresAt || isPaid || isCancelled) return undefined;
    const updateCountdown = () => {
      const expiry = Date.parse(expiresAt);
      setSecondsLeft(Number.isFinite(expiry) ? Math.max(0, Math.ceil((expiry - Date.now()) / 1000)) : 0);
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [paymentData?.payment?.expiresAt, isPaid, isCancelled]);

  function chooseMethod(nextMethod) {
    setMethod(nextMethod);
    setPaymentError("");
    if (cardSamples[nextMethod]) {
      setCardNumber(cardSamples[nextMethod].number);
      setCardHolder(cardSamples[nextMethod].holder);
    }
  }

  async function applyVoucher() {
    setIsApplyingVoucher(true);
    setVoucherMessage("");
    setVoucherIsError(false);
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode }),
      });
      const result = await readResponse(response, "Không thể áp dụng mã giảm giá.");
      setPaymentData((current) => ({ ...current, booking: result.booking, payment: result.payment || current.payment }));
      setVoucherCode(result.booking.voucher?.code || "");
      setVerificationCode("");
      setVoucherMessage(result.discount ? `Đã áp dụng ${result.booking.voucher.code}, giảm ${formatPrice(result.discount)}.` : "Đã gỡ mã giảm giá.");
    } catch (error) {
      setVoucherIsError(true);
      setVoucherMessage(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message);
    } finally {
      setIsApplyingVoucher(false);
    }
  }

  async function confirmPayment(event) {
    event.preventDefault();
    setPaymentError("");
    if (secondsLeft === 0) {
      setPaymentError("Giao dịch đã hết hạn. Vui lòng tải lại trang để tạo mã mới.");
      return;
    }
    if (!verificationCode.trim()) {
      setPaymentError("Vui lòng nhập mã xác nhận giao dịch.");
      return;
    }
    if (method !== "serial") {
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length < 12 || digits.length > 19 || !cardHolder.trim()) {
        setPaymentError("Vui lòng kiểm tra số thẻ và tên chủ thẻ.");
        return;
      }
    }

    setIsPaying(true);
    try {
      const [response] = await Promise.all([
        fetch(`/api/payments/${encodeURIComponent(paymentData.payment.id)}/mock-confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, verificationCode }),
        }),
        new Promise((resolve) => window.setTimeout(resolve, 1100)),
      ]);
      const result = await readResponse(response, "Không thể hoàn tất thanh toán giả lập.");
      setPaymentData((current) => ({ ...current, ...result }));
      setIsPaid(true);
    } catch (error) {
      setPaymentError(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message);
    } finally {
      setIsPaying(false);
    }
  }

  async function cancelPayment() {
    setPaymentError("");
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/payments/${encodeURIComponent(paymentData.payment.id)}/cancel`, { method: "POST" });
      await readResponse(response, "Không thể hủy giao dịch.");
      setIsCancelled(true);
    } catch (error) {
      setPaymentError(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message);
    } finally {
      setIsCancelling(false);
    }
  }

  if (loadError) {
    return <p className="checkout-config-warning" role="alert">{loadError}</p>;
  }
  if (!paymentData) {
    return <p className="animate-pulse rounded-2xl bg-white p-8 text-lg font-semibold text-slate-600 shadow-sm">Đang tải thông tin thanh toán…</p>;
  }

  const { booking, payment, vouchers = [] } = paymentData;
  const passengerCount = (booking.passengers.adult || 0) + (booking.passengers.child || 0) + (booking.passengers.infant || 0);

  return (
    <div className="grid gap-8">
      <a className="detail-back w-fit" href="/booking-history.html">← Lịch sử đặt tour</a>
      <header className="checkout-heading">
        <p className="eyebrow eyebrow-dark"><span /> THANH TOÁN GIẢ LẬP</p>
        <h1 className="font-display">Hoàn tất chuyến đi</h1>
        <p>Đơn <strong>{booking.code}</strong> · Khởi hành {formatDate(booking.departureDate)}</p>
      </header>

      {isPaid && (
        <p className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-lg font-bold text-emerald-900 shadow-sm" role="status">
          <span className="grid size-9 place-items-center rounded-full bg-emerald-600 text-white" aria-hidden="true">✓</span>
          Thanh toán thành công! Đang chuyển đến lịch sử đặt tour…
        </p>
      )}
      {isCancelled && (
        <p className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-lg font-bold text-slate-800 shadow-sm" role="status">
          Giao dịch đã được huỷ. Đang chuyển đến lịch sử đặt tour…
        </p>
      )}

      {!isPaid && !isCancelled && (
        <div className="checkout-layout">
          <form className="profile-card checkout-payment gap-6 p-5 sm:p-7" onSubmit={confirmPayment}>
            <div className="grid gap-2">
              <h2 className="text-2xl font-bold text-slate-900">Chọn phương thức</h2>
              <p className="m-0 text-sm leading-6 text-slate-600">Đây là giao dịch mô phỏng, không thu thập hoặc gửi thông tin thẻ thật.</p>
            </div>

            <div className="grid gap-3">
              <PaymentOption active={method === "visa"} title="Visa / Mastercard" description="Thẻ quốc tế · dùng thông tin mẫu" icon="V" onClick={() => chooseMethod("visa")} disabled={isPaying || isApplyingVoucher || isCancelling} />
              <PaymentOption active={method === "atm"} title="Thẻ ATM nội địa" description="Thẻ nội địa · dùng thông tin mẫu" icon="▤" onClick={() => chooseMethod("atm")} disabled={isPaying || isApplyingVoucher || isCancelling} />
              <PaymentOption active={method === "serial"} title="Mã seri mô phỏng" description="Nhập mã seri được tạo cho giao dịch này" icon="＃" onClick={() => chooseMethod("serial")} disabled={isPaying || isApplyingVoucher || isCancelling} />
            </div>

            <div className="checkout-verification">
              <div className="checkout-verification-code">
                <span>Mã xác nhận được tạo cho giao dịch này</span>
                <strong>{payment.mockSerial}</strong>
              </div>
              <p className="checkout-countdown" role="timer" aria-live="polite">
                Thời gian nhập mã còn: <strong>{secondsLeft === null ? "01:00" : `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`}</strong>
              </p>
              {secondsLeft === 0 && (
                <button className="secondary-cta justify-center" type="button" onClick={() => window.location.reload()}>
                  Tạo giao dịch mới
                </button>
              )}
              <label className="grid gap-2 text-sm font-bold text-slate-800" htmlFor="mock-verification-code">
                Nhập mã xác nhận
                <input
                  id="mock-verification-code"
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-mono text-base tracking-wider outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value.toUpperCase())}
                  disabled={isPaying || isApplyingVoucher || isCancelling || secondsLeft === 0}
                  autoComplete="off"
                  required
                />
              </label>
            </div>

            {method !== "serial" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-800 sm:col-span-2" htmlFor="mock-card-number">
                  Số thẻ
                  <input
                    id="mock-card-number"
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base tracking-wide outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    disabled={isPaying || isApplyingVoucher || isCancelling || secondsLeft === 0}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={23}
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-800 sm:col-span-2" htmlFor="mock-card-holder">
                  Tên chủ thẻ
                  <input
                    id="mock-card-holder"
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base uppercase outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                    value={cardHolder}
                    onChange={(event) => setCardHolder(event.target.value)}
                    disabled={isPaying || isApplyingVoucher || isCancelling || secondsLeft === 0}
                    autoComplete="off"
                    required
                  />
                </label>
              </div>
            )}

            <div className="checkout-voucher">
              <label htmlFor="checkout-voucher">Mã giảm giá</label>
              <div className="checkout-voucher-row">
                <input id="checkout-voucher" type="text" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} placeholder="Nhập mã giảm giá" list="checkout-voucher-options" autoComplete="off" disabled={isApplyingVoucher || isPaying || isCancelling || secondsLeft === 0} />
                <datalist id="checkout-voucher-options">
                  {vouchers.map((voucher) => <option key={voucher.code} value={voucher.code}>{voucher.code} · giảm {formatPrice(voucher.discount)}</option>)}
                </datalist>
                <button className="secondary-cta" type="button" onClick={applyVoucher} disabled={isApplyingVoucher || isPaying || isCancelling || secondsLeft === 0}>
                  {isApplyingVoucher ? "Đang áp dụng…" : "Áp dụng"}
                </button>
              </div>
              <p className={`checkout-voucher-status${voucherIsError ? " is-error" : ""}`} role="status" aria-live="polite">{voucherMessage}</p>
            </div>

            {paymentError && <p className="m-0 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">{paymentError}</p>}
            <button className="checkout-mock-submit" type="submit" disabled={isPaying || isApplyingVoucher || isCancelling || secondsLeft === 0}>
              {isPaying ? <><span className="mock-payment-spinner" aria-hidden="true" /> Đang xử lý giao dịch...</> : <>Xác nhận thanh toán <span aria-hidden="true">→</span></>}
            </button>
            <button className="checkout-cancel-button" type="button" onClick={cancelPayment} disabled={isPaying || isApplyingVoucher || isCancelling}>
              {isCancelling ? "Đang huỷ giao dịch…" : "Huỷ giao dịch"}
            </button>
            <p className="m-0 text-center text-xs leading-5 text-slate-500">Chế độ đồ án: thanh toán giả lập, không kết nối ngân hàng và không phát sinh giao dịch thật.</p>
          </form>

          <aside className="profile-card checkout-summary gap-5 p-5 sm:p-7">
            <h2 className="text-2xl font-bold text-slate-900">Chi tiết đơn</h2>
            <div className="grid gap-2">
              <p className="checkout-tour-name text-lg font-bold">{booking.tour.name}</p>
              <p className="m-0 text-sm text-slate-600">{passengerCount} hành khách · {formatDate(booking.departureDate)}</p>
            </div>
            <dl className="checkout-totals">
              <div><dt>Tạm tính</dt><dd>{formatPrice(booking.subtotal ?? booking.total)}</dd></div>
              {booking.discount ? <div><dt>Voucher {booking.voucher?.code}</dt><dd>−{formatPrice(booking.discount)}</dd></div> : null}
              <div className="checkout-total"><dt>Tổng thanh toán</dt><dd>{formatPrice(booking.total)}</dd></div>
            </dl>
            <a className="secondary-cta justify-center" href={`/booking-detail.html?id=${encodeURIComponent(booking.id)}`}>Xem chi tiết đơn</a>
            <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
              <strong>Mã đơn:</strong> {booking.code}<br />
              <strong>Phương thức:</strong> Thanh toán giả lập
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

if (container) createRoot(container).render(<Checkout />);
