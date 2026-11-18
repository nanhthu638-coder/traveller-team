const SUPPORT_EMAIL = "hello@travellerteam.vn";
const SUPPORT_HOURS = "Thứ Hai – Thứ Bảy, 08:30 – 17:30";

export function initSupportWidget() {
  if (document.querySelector("[data-support-widget]")) return;

  const widget = document.createElement("aside");
  widget.className = "support-widget";
  widget.dataset.supportWidget = "";
  widget.innerHTML = `
    <section class="support-panel" id="support-panel" data-support-panel aria-labelledby="support-title" hidden>
      <header class="support-panel-head">
        <div><span class="support-status-dot" aria-hidden="true"></span><h2 id="support-title">Traveller Team CSKH</h2></div>
        <button class="support-close" type="button" data-support-close aria-label="Đóng hỗ trợ">×</button>
      </header>
      <p class="support-hours">Giờ hỗ trợ: ${SUPPORT_HOURS}</p>
      <div class="support-actions">
        <a href="mailto:${SUPPORT_EMAIL}">Gửi email cho chúng tôi <span aria-hidden="true">↗</span></a>
        <a href="/index.html#contact-form">Gửi biểu mẫu liên hệ <span aria-hidden="true">↗</span></a>
      </div>
      <div class="support-faq">
        <h3>Câu hỏi thường gặp</h3>
        <details><summary>Kiểm tra đơn đặt tour ở đâu?</summary><p>Mở menu tài khoản và chọn “Lịch sử đặt tour”, sau đó chọn chi tiết đơn cần xem.</p></details>
        <details><summary>Thanh toán hoặc nhập mã giảm giá thế nào?</summary><p>Mở chi tiết đơn chưa thanh toán, chọn “Thanh toán trực tuyến” rồi áp dụng mã có sẵn trước khi xác nhận.</p></details>
        <details><summary>Cần hỗ trợ thay đổi đơn?</summary><p>Gửi biểu mẫu liên hệ và ghi mã đơn để đội ngũ hỗ trợ tra cứu, hướng dẫn.</p></details>
      </div>
    </section>
    <button class="support-trigger" type="button" aria-expanded="false" aria-controls="support-panel" data-support-toggle>
      <span aria-hidden="true">✦</span> CSKH
    </button>`;

  document.body.append(widget);
  const toggle = widget.querySelector("[data-support-toggle]");
  const panel = widget.querySelector("[data-support-panel]");
  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  widget.querySelector("[data-support-close]").addEventListener("click", () => setOpen(false));
  document.addEventListener("click", (event) => {
    if (!widget.contains(event.target)) setOpen(false);
  });
  widget.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
}
