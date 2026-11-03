import { ratingBadge } from "./review-ui.js";
import { formatDate } from "./booking-format.js";
import { FALLBACK_TOUR_IMAGE, renderSeatBadge, resolveTourImageUrl, subscribeRealtime } from "./realtime.js";

const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(Math.round(value))}đ`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

export async function initFeaturedTours() {
  const container = document.getElementById("featured-list");
  if (!container) return;

  async function loadFeatured() {
    try {
      const response = await fetch("/api/tours");
      if (!response.ok) throw new Error("Không thể tải tour nổi bật.");
      const { tours = [] } = await response.json();

      container.innerHTML = tours.slice(0, 6).map((tour) => {
        const nextDep = tour.nextDeparture || tour.departures?.[0] || "";
        const depLabel = nextDep ? formatDate(nextDep) : "Hàng ngày";
        return `
          <article class="featured-card">
            <div class="featured-card-media">
              <img src="${resolveTourImageUrl(tour.image, 900)}" alt="${escapeHtml(tour.name)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_TOUR_IMAGE}';" />
              <div class="featured-card-badges">
                <span class="featured-duration-pill">${escapeHtml(tour.duration || "3 ngày 2 đêm")}</span>
                ${renderSeatBadge(tour)}
              </div>
            </div>
            <div class="featured-card-body">
              <p class="featured-card-place">📍 ${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</p>
              <h3 class="font-display">${escapeHtml(tour.name)}</h3>
              <div class="featured-meta">
                <span>🗓️ Khởi hành: <strong>${escapeHtml(depLabel)}</strong></span>
                ${ratingBadge(tour)}
              </div>
              <div class="featured-card-footer">
                <div class="featured-price-block">
                  <small>Giá trọn gói / khách</small>
                  <strong>${formatPrice(tour.price)}</strong>
                </div>
                <a class="featured-card-link" href="/tour-detail.html?id=${encodeURIComponent(tour.id)}">Xem chi tiết <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </article>
        `;
      }).join("");
    } catch {
      container.innerHTML = '<p class="form-status is-error">Chưa thể tải tour nổi bật. Vui lòng tải lại trang.</p>';
    }
  }

  await loadFeatured();

  // Tự động cập nhật theo thời gian thực khi Admin thêm/sửa/ẩn/xóa tour, khi chỗ trống thay đổi hoặc có đánh giá mới
  subscribeRealtime(["tour:changed", "availability:updated", "review:changed"], () => {
    loadFeatured();
  });
}
