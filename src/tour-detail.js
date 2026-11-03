import { initHeaderAccount } from "./features/account-menu.js";
import { initNavigation } from "./features/navigation.js";
import { formatRating, ratingBadge } from "./features/review-ui.js";
import { initTourReviews } from "./features/tour-reviews.js";
import { departureOptions, fetchAvailability, initBooking } from "./features/booking-flow.js";
import { FALLBACK_TOUR_IMAGE, renderSeatBadge, resolveTourImageUrl, showRealtimeToast, subscribeRealtime } from "./features/realtime.js";

const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(Math.round(value))}đ`;

const MAX_PER_TYPE = 20;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function renderItineraryHtml(itineraryText) {
  const lines = String(itineraryText || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!lines.length) {
    return `
      <article class="itinerary-item"><h3>Ngày 1: Khởi hành và khám phá</h3><p>Đón khách, di chuyển đến điểm đến, dùng bữa địa phương và nhận phòng nghỉ ngơi.</p></article>
      <article class="itinerary-item"><h3>Ngày 2: Trải nghiệm địa phương</h3><p>Tham quan những địa danh nổi bật, thưởng thức ẩm thực và khám phá văn hóa bản địa.</p></article>
      <article class="itinerary-item"><h3>Ngày cuối: Trở về</h3><p>Dùng bữa sáng, tham quan điểm cuối trong lịch trình và khởi hành về điểm đón.</p></article>
    `;
  }

  return lines.map((line, index) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 35) {
      const heading = line.slice(0, colonIdx).trim();
      const body = line.slice(colonIdx + 1).trim();
      return `<article class="itinerary-item"><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(body)}</p></article>`;
    }
    return `<article class="itinerary-item"><h3>Chặng ${index + 1}</h3><p>${escapeHtml(line)}</p></article>`;
  }).join("");
}

function renderTourDetail(tour, availability, relatedTours = []) {
  const highlights = [
    `Khám phá trọn vẹn vẻ đẹp đặc sắc tại ${tour.place}, ${tour.region} cùng hướng dẫn viên bản địa giàu kinh nghiệm.`,
    "Thưởng thức ẩm thực đặc sản vùng miền và trải nghiệm văn hóa truyền thống tại điểm đến.",
    `Lưu trú tiêu chuẩn tiện nghi, lịch trình ${tour.duration} tối ưu và bảo hiểm du lịch trọn gói.`,
  ];
  const picker = departureOptions(tour, availability);
  const canBook = picker.canBook;
  const departureOptionsHtml = picker.html;
  const fallbackRelated = [
    { id: "ha-long-3n2d", name: "Vịnh Hạ Long · 3 ngày 2 đêm", image: "photo-1528127269322-539801943592" },
    { id: "da-lat-3n2d", name: "Đà Lạt · Thành phố ngàn hoa", image: "photo-1500530855697-b586d89ba3ee" },
    { id: "sa-pa-3n2d", name: "Sa Pa · Fansipan & bản làng", image: "photo-1501785888041-af3ef285b470" },
  ];
  const related = (relatedTours.length ? relatedTours : fallbackRelated)
    .filter((item) => item.id !== tour.id)
    .slice(0, 3);

  return `
    <div class="detail-shell">
      <button class="detail-back" type="button" data-back-to-list>← Quay lại danh sách</button>
      <header class="detail-header">
        <p class="eyebrow eyebrow-dark"><span></span> Tour du lịch trọn gói</p>
        <h1 class="font-display" data-tour-title>${escapeHtml(tour.name)}</h1>
        <div class="detail-meta">
          <span>📍 ${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</span>
          <span>⏱️ ${escapeHtml(tour.duration)}</span>
          <span data-tour-seat-badge>${renderSeatBadge(tour)}</span>
          <span data-rating-meta>${ratingBadge(tour)}</span>
        </div>
      </header>
      <div class="detail-media">
        <div class="media-frame media-frame--wide"><img data-tour-main-img src="${resolveTourImageUrl(tour.image, 1200)}" alt="${escapeHtml(tour.name)}" onerror="this.onerror=null;this.src='${FALLBACK_TOUR_IMAGE}';" /></div>
        <div class="media-frame"><img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80" alt="Cảnh quan hành trình" /></div>
        <div class="media-frame"><img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80" alt="Trải nghiệm du lịch" /></div>
      </div>
      <div class="detail-summary">
        <div><span>Thời gian</span><strong data-tour-duration>${escapeHtml(tour.duration)}</strong></div>
        <div><span>Điểm đến</span><strong data-tour-place>${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</strong></div>
        <div><span>Quy mô đoàn</span><strong data-tour-maxguests>Tối đa ${Number(tour.maxGuests) || 25} khách</strong></div>
        <div><span>Đánh giá</span><strong data-rating-tile>${tour.reviewCount ? `${formatRating(tour.rating)} / 5 (${tour.reviewCount})` : "Chưa có"}</strong></div>
      </div>
      <div class="detail-layout">
        <div class="detail-content">
          <section class="detail-section"><h2>Điểm nổi bật của hành trình</h2><ul>${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <section class="detail-section"><h2>Lịch trình chi tiết</h2>
            <div data-tour-itinerary>${renderItineraryHtml(tour.itinerary)}</div>
          </section>
          <section class="detail-section"><h2>Giá tour bao gồm</h2><ul><li>Phương tiện di chuyển đời mới đưa đón theo chương trình.</li><li>Khách sạn / Resort tiêu chuẩn và các bữa ăn đặc sản theo lịch trình.</li><li>Vé tham quan các điểm, hướng dẫn viên suốt tuyến và bảo hiểm du lịch tối đa 50.000.000đ/khách.</li></ul></section>
          <section class="detail-section reviews-section" id="reviews" data-reviews></section>
          <section class="detail-section"><h2>Hành trình gợi ý khác</h2><div class="related-grid">${related.map((item) => `<a class="related-card" href="/tour-detail.html?id=${encodeURIComponent(item.id)}"><img src="${resolveTourImageUrl(item.image, 700)}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src='${FALLBACK_TOUR_IMAGE}';" /><span>${escapeHtml(item.name)}</span></a>`).join("")}</div></section>
        </div>
        <aside class="booking-panel"><div class="booking-box">
          <div class="booking-live-indicator"><span class="rt-live-dot"></span><span>Cập nhật chỗ trống theo thời gian thực</span></div>
          <div class="booking-price"><span>Giá trọn gói</span><strong data-tour-price>${formatPrice(tour.price)} <small>/ khách</small></strong></div>
          <label>Ngày khởi hành <small>(kèm số chỗ còn lại trực tuyến)</small><select class="booking-date"${canBook ? "" : " disabled"}>${departureOptionsHtml}</select></label>
          <div class="passenger-box">
            <div class="passenger-row"><span>Người lớn <small style="display:block;font-size:11px;color:#64748b">Từ 12 tuổi (100%)</small></span><div class="passenger-controls"><button type="button" data-step="-1" data-target="adult" aria-label="Giảm người lớn">−</button><input data-role="adult" type="number" min="0" value="2" /><button type="button" data-step="1" data-target="adult" aria-label="Tăng người lớn">+</button></div></div>
            <div class="passenger-row"><span>Trẻ em <small style="display:block;font-size:11px;color:#64748b">2–11 tuổi (70%)</small></span><div class="passenger-controls"><button type="button" data-step="-1" data-target="child" aria-label="Giảm trẻ em">−</button><input data-role="child" type="number" min="0" value="0" /><button type="button" data-step="1" data-target="child" aria-label="Tăng trẻ em">+</button></div></div>
            <div class="passenger-row"><span>Em bé <small style="display:block;font-size:11px;color:#64748b">Dưới 2 tuổi (Miễn phí)</small></span><div class="passenger-controls"><button type="button" data-step="-1" data-target="infant" aria-label="Giảm em bé">−</button><input data-role="infant" type="number" min="0" value="0" /><button type="button" data-step="1" data-target="infant" aria-label="Tăng em bé">+</button></div></div>
          </div>
          <div class="booking-total"><span>Tạm tính</span><strong data-detail-total>${formatPrice(tour.price * 2)}</strong></div>
          <p class="availability-note is-muted" data-availability hidden></p>
          <p class="booking-error" data-booking-error role="alert" hidden></p>
          <button class="submit-button booking-submit" type="button" data-booking-continue${canBook ? "" : " disabled"}><span data-booking-label>Tiếp tục nhập thông tin hành khách</span> <span aria-hidden="true">↗</span></button>
          <a class="booking-help" href="/index.html#contact-form">Cần tư vấn thêm? Liên hệ chúng tôi</a>
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
    const sessionResponse = await fetch("/api/auth/session");
    const session = await sessionResponse.json();
    if (!sessionResponse.ok) throw new Error("Không thể kiểm tra đăng nhập.");
    if (!session.user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/index.html?auth=login&returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    const [response, allToursRes, availability] = await Promise.all([
      fetch(`/api/tours/${encodeURIComponent(tourId)}`),
      fetch("/api/tours").catch(() => null),
      fetchAvailability(tourId),
    ]);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể tải thông tin tour.");
    const tour = data.tour;
    const allToursData = allToursRes && allToursRes.ok ? await allToursRes.json() : { tours: [] };
    if (!tour) {
      showError(detailPage, "Tour này không tồn tại.");
      return;
    }

    detailPage.innerHTML = renderTourDetail(tour, availability, allToursData.tours || []);
    document.title = `${tour.name} | Traveller Team`;
    detailPage.querySelector("[data-back-to-list]").addEventListener("click", () => {
      window.location.href = "/tour-list.html";
    });

    initTourReviews(detailPage.querySelector("[data-reviews]"), tour, detailPage);

    const updateTotal = () => {
      const adults = Math.max(0, Number(detailPage.querySelector('[data-role="adult"]').value || 0));
      const children = Math.max(0, Number(detailPage.querySelector('[data-role="child"]').value || 0));
      const infants = Math.max(0, Number(detailPage.querySelector('[data-role="infant"]').value || 0));
      detailPage.querySelector("[data-detail-total]").textContent = formatPrice(adults * tour.price + children * tour.price * 0.7 + infants * 0);
    };
    detailPage.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = detailPage.querySelector(`[data-role="${button.dataset.target}"]`);
        input.value = Math.min(MAX_PER_TYPE, Math.max(0, Number(input.value || 0) + Number(button.dataset.step)));
        updateTotal();
      });
    });
    detailPage.querySelectorAll("input[data-role]").forEach((input) => {
      input.addEventListener("input", () => {
        input.value = Math.min(MAX_PER_TYPE, Math.max(0, Number(input.value || 0)));
        updateTotal();
      });
    });

    const bookingController = initBooking({ page: detailPage, tour, user: session.user, availability });

    // Lắng nghe cập nhật thông tin Tour theo thời gian thực từ Admin
    subscribeRealtime(["tour:changed", "availability:updated"], async (event) => {
      if (event.payload?.tourId && event.payload.tourId !== tour.id) return;

      if (event.type === "tour:changed") {
        if (event.payload?.action === "deleted" || event.payload?.status === "inactive") {
          showRealtimeToast({
            title: "Tour vừa tạm ngưng phục vụ",
            message: "Quản trị viên vừa tạm ngưng hoặc gỡ hành trình này.",
            tone: "warn",
          });
          return;
        }
        try {
          const freshRes = await fetch(`/api/tours/${encodeURIComponent(tour.id)}`);
          if (freshRes.ok) {
            const { tour: freshTour } = await freshRes.json();
            Object.assign(tour, freshTour);
            detailPage.querySelector("[data-tour-title]").textContent = tour.name;
            detailPage.querySelector("[data-tour-duration]").textContent = tour.duration;
            detailPage.querySelector("[data-tour-place]").textContent = `${tour.place}, ${tour.region}`;
            detailPage.querySelector("[data-tour-maxguests]").textContent = `Tối đa ${Number(tour.maxGuests) || 25} khách`;
            detailPage.querySelector("[data-tour-price]").innerHTML = `${formatPrice(tour.price)} <small>/ khách</small>`;
            detailPage.querySelector("[data-tour-itinerary]").innerHTML = renderItineraryHtml(tour.itinerary);
            detailPage.querySelector("[data-tour-seat-badge]").innerHTML = renderSeatBadge(tour);
            const mainImg = detailPage.querySelector("[data-tour-main-img]");
            if (mainImg) mainImg.src = resolveTourImageUrl(tour.image, 1200);
            updateTotal();
            bookingController?.refreshAvailability();
            showRealtimeToast({
              title: "Thông tin tour vừa được cập nhật",
              message: "Giá tour, lịch trình hoặc ngày khởi hành vừa được làm mới theo thời gian thực.",
              tone: "info",
            });
          }
        } catch {
          // ignore
        }
      }
    });
  } catch (error) {
    showError(detailPage, error.message || "Không thể tải thông tin tour.");
  }
}

function showError(container, message) {
  container.innerHTML = `<div class="detail-empty">${message} <a href="/tour-list.html">Quay lại danh sách tour</a></div>`;
}

initNavigation();
initHeaderAccount();
initTourDetailPage();
