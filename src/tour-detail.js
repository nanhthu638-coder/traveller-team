import { initNavigation } from "./features/navigation.js";

const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(Math.round(value))}đ`;
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function renderTourDetail(tour) {
  const highlights = [
    "Khám phá các địa danh nổi bật cùng hướng dẫn viên địa phương.",
    "Thưởng thức ẩm thực đặc sản và trải nghiệm văn hóa tại điểm đến.",
    "Lưu trú tiện nghi, lịch trình rõ ràng và dịch vụ trọn gói.",
  ];
  const departureOptions = tour.departures.map((date) => `<option value="${date}">${date.split("-").reverse().join("/")}</option>`).join("");
  const relatedTours = [
    { id: "ha-long-3n2d", name: "Vịnh Hạ Long", image: "photo-1528127269322-539801943592" },
    { id: "da-lat-3n2d", name: "Đà Lạt", image: "photo-1531058020387-3be344556be6" },
    { id: "sa-pa-3n2d", name: "Sa Pa", image: "photo-1470770841072-f978cf4d019e" },
  ].filter((item) => item.id !== tour.id);

  return `
    <div class="detail-shell">
      <button class="detail-back" type="button" data-back-to-list>← Quay lại danh sách</button>
      <header class="detail-header">
        <p class="eyebrow eyebrow-dark"><span></span> Tour du lịch</p>
        <h1 class="font-display">${escapeHtml(tour.name)}</h1>
        <div class="detail-meta"><span>${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</span><span>${escapeHtml(tour.duration)}</span><span>★★★★★ 4.8</span></div>
      </header>
      <div class="detail-media">
        <div class="media-frame media-frame--wide"><img src="${imageUrl(tour.image)}" alt="${escapeHtml(tour.name)}" /></div>
        <div class="media-frame"><img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80" alt="Cảnh quan hành trình" /></div>
        <div class="media-frame"><img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80" alt="Trải nghiệm du lịch" /></div>
      </div>
      <div class="detail-summary">
        <div><span>Thời gian</span><strong>${escapeHtml(tour.duration)}</strong></div>
        <div><span>Điểm đến</span><strong>${escapeHtml(tour.place)}</strong></div>
        <div><span>Khởi hành</span><strong>Hà Nội</strong></div>
        <div><span>Đánh giá</span><strong>4.8 / 5</strong></div>
      </div>
      <div class="detail-layout">
        <div class="detail-content">
          <section class="detail-section"><h2>Điểm nổi bật</h2><ul>${highlights.map((item) => `<li>${item}</li>`).join("")}</ul></section>
          <section class="detail-section"><h2>Lịch trình</h2>
            <article class="itinerary-item"><h3>Ngày 1: Khởi hành và khám phá</h3><p>Đón khách, di chuyển đến điểm đến, dùng bữa địa phương và nhận phòng nghỉ ngơi.</p></article>
            <article class="itinerary-item"><h3>Ngày 2: Trải nghiệm địa phương</h3><p>Tham quan những địa danh nổi bật, thưởng thức ẩm thực và khám phá văn hóa bản địa.</p></article>
            <article class="itinerary-item"><h3>Ngày cuối: Trở về</h3><p>Dùng bữa sáng, tham quan điểm cuối trong lịch trình và khởi hành về điểm đón.</p></article>
          </section>
          <section class="detail-section"><h2>Giá tour bao gồm</h2><ul><li>Phương tiện di chuyển theo chương trình.</li><li>Lưu trú và các bữa ăn theo lịch trình.</li><li>Vé tham quan, hướng dẫn viên và bảo hiểm du lịch.</li></ul></section>
          <section class="detail-section"><h2>Tour tương tự</h2><div class="related-grid">${relatedTours.map((item) => `<a class="related-card" href="/tour-detail.html?id=${encodeURIComponent(item.id)}"><img src="${imageUrl(item.image)}" alt="${escapeHtml(item.name)}" /><span>${escapeHtml(item.name)}</span></a>`).join("")}</div></section>
        </div>
        <aside class="booking-panel"><div class="booking-box">
          <div class="booking-price"><span>Giá từ</span><strong>${formatPrice(tour.price)} <small>/ khách</small></strong></div>
          <label>Ngày khởi hành<select class="booking-date">${departureOptions}</select></label>
          <div class="passenger-box">
            <div class="passenger-row"><span>Người lớn</span><div class="passenger-controls"><button type="button" data-step="-1" data-target="adult" aria-label="Giảm người lớn">−</button><input data-role="adult" type="number" min="0" value="2" /><button type="button" data-step="1" data-target="adult" aria-label="Tăng người lớn">+</button></div></div>
            <div class="passenger-row"><span>Trẻ em</span><div class="passenger-controls"><button type="button" data-step="-1" data-target="child" aria-label="Giảm trẻ em">−</button><input data-role="child" type="number" min="0" value="0" /><button type="button" data-step="1" data-target="child" aria-label="Tăng trẻ em">+</button></div></div>
            <div class="passenger-row"><span>Em bé</span><div class="passenger-controls"><button type="button" data-step="-1" data-target="infant" aria-label="Giảm em bé">−</button><input data-role="infant" type="number" min="0" value="0" /><button type="button" data-step="1" data-target="infant" aria-label="Tăng em bé">+</button></div></div>
          </div>
          <div class="booking-total"><span>Tạm tính</span><strong data-detail-total>${formatPrice(tour.price * 2)}</strong></div>
          <a class="submit-button booking-submit" href="/index.html#contact">Liên hệ đặt tour <span aria-hidden="true">↗</span></a>
        </div></aside>
      </div>
    </div>`;
}

async function initTourDetailPage() {
  const detailPage = document.getElementById("tour-detail-page");
  const tourId = new URLSearchParams(window.location.search).get("id");
  if (!tourId) {
    showError(detailPage, "Không tìm thấy tour.");
    return;
  }

  try {
    const response = await fetch("/api/tours");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể tải thông tin tour.");
    const tour = (data.tours || []).find((item) => item.id === tourId);
    if (!tour) {
      showError(detailPage, "Tour này không tồn tại.");
      return;
    }

    detailPage.innerHTML = renderTourDetail(tour);
    document.title = `${tour.name} | Traveller Team`;
    detailPage.querySelector("[data-back-to-list]").addEventListener("click", () => {
      window.location.href = "/tour-list.html";
    });

    const updateTotal = () => {
      const adults = Math.max(0, Number(detailPage.querySelector('[data-role="adult"]').value || 0));
      const children = Math.max(0, Number(detailPage.querySelector('[data-role="child"]').value || 0));
      const infants = Math.max(0, Number(detailPage.querySelector('[data-role="infant"]').value || 0));
      detailPage.querySelector("[data-detail-total]").textContent = formatPrice(adults * tour.price + children * tour.price * 0.7 + infants * 0);
    };
  detailPage.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = detailPage.querySelector(`[data-role="${button.dataset.target}"]`);
        input.value = Math.max(0, Number(input.value || 0) + Number(button.dataset.step));
        updateTotal();
      });
    });
    detailPage.querySelectorAll("input[data-role]").forEach((input) => {
      input.addEventListener("input", () => {
        input.value = Math.max(0, Number(input.value || 0));
        updateTotal();
      });
    });
  } catch (error) {
    showError(detailPage, error.message || "Không thể tải thông tin tour.");
  }
}

function showError(container, message) {
  container.innerHTML = `<div class="detail-empty">${message} <a href="/tour-list.html">Quay lại danh sách tour</a></div>`;
}

initNavigation();
initTourDetailPage();
