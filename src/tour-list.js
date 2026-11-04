import { initHeaderAccount } from "./features/account-menu.js";
import { initNavigation } from "./features/navigation.js";
import { formatDate } from "./features/booking-format.js";
import { formatRating, ratingBadge } from "./features/review-ui.js";
import { FALLBACK_TOUR_IMAGE, renderSeatBadge, resolveTourImageUrl, showRealtimeToast, subscribeRealtime } from "./features/realtime.js";

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

function renderListing(tours) {
  const grid = document.getElementById("listing-grid");
  const empty = document.getElementById("listing-empty");
  document.getElementById("listing-count").textContent = String(tours.length);
  empty.hidden = tours.length > 0;
  if (!tours.length) {
    grid.innerHTML = "";
    return;
  }

  grid.innerHTML = tours.map((tour) => {
    const upcoming = tour.upcomingDepartures?.length ? tour.upcomingDepartures : (tour.departures || []);
    const nextDep = tour.nextDeparture || upcoming[0] || "";
    const depText = nextDep ? formatDate(nextDep) : "Hàng ngày";
    const extraDates = upcoming.length > 1 ? ` (+${upcoming.length - 1} đợt)` : "";

    return `
      <article class="listing-card">
        <div class="listing-card-image">
          <img src="${resolveTourImageUrl(tour.image, 1000)}" alt="${escapeHtml(tour.name)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_TOUR_IMAGE}';" />
          <span class="listing-badge">${escapeHtml(tour.duration)}</span>
          <div class="listing-seat-overlay">${renderSeatBadge(tour)}</div>
        </div>
        <div class="listing-card-body">
          <p class="featured-card-place">📍 ${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</p>
          <h3 class="font-display">${escapeHtml(tour.name)}</h3>
          <div class="listing-card-info">
            <span>🗓️ Khởi hành: <strong>${escapeHtml(depText)}</strong><small>${escapeHtml(extraDates)}</small></span>
            ${ratingBadge(tour)}
          </div>
          <div class="listing-card-price">
            <div><del>${formatPrice(tour.price * 1.18)}</del><br /><strong>${formatPrice(tour.price)}</strong></div>
            <div class="listing-card-actions">
              <button type="button" aria-label="Yêu thích tour ${escapeHtml(tour.name)}" aria-pressed="false">♡</button>
              <a href="/tour-detail.html?id=${encodeURIComponent(tour.id)}">Xem chi tiết</a>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// Đồng bộ danh sách điểm đến động từ API Tours & Destinations + cập nhật thống kê đầu trang
async function syncStatsAndDestinations() {
  const targetRating = document.getElementById("hero-rating");
  const listStart = document.getElementById("list-start");
  const quickStart = document.getElementById("quick-start");
  try {
    const [toursRes, destRes] = await Promise.all([
      fetch("/api/tours"),
      fetch("/api/destinations").catch(() => null),
    ]);
    const { tours = [] } = toursRes.ok ? await toursRes.json() : { tours: [] };
    const { destinations = [] } = destRes && destRes.ok ? await destRes.json() : { destinations: [] };

    if (targetRating) {
      const rated = tours.filter((tour) => tour.reviewCount > 0);
      const count = rated.reduce((sum, tour) => sum + tour.reviewCount, 0);
      targetRating.textContent = count
        ? `${formatRating(rated.reduce((sum, tour) => sum + tour.rating * tour.reviewCount, 0) / count)}/5`
        : "—";
    }

    // Tự động nâng trần thanh trượt giá nếu có tour giá cao hơn 10.000.000đ
    const highestPrice = tours.reduce((max, t) => Math.max(max, Number(t.price) || 0), 10000000);
    const roundedMax = Math.ceil(highestPrice / 1000000) * 1000000;
    if (slider && roundedMax > Number(slider.max)) {
      const wasAtMax = Number(slider.value) === Number(slider.max);
      slider.max = String(roundedMax);
      if (wasAtMax) {
        slider.value = String(roundedMax);
        appliedMaxPrice = roundedMax;
        updatePriceLabel();
      }
    }

    // Cập nhật danh sách điểm đến trong bộ lọc mà vẫn giữ lựa chọn hiện tại
    const places = new Set();
    tours.forEach((t) => {
      if (t.place) places.add(t.place.trim());
    });
    destinations.forEach((d) => {
      if (d.region) places.add(d.region.trim());
    });
    const sortedPlaces = Array.from(places).filter(Boolean).sort((a, b) => a.localeCompare(b, "vi"));

    if (listStart && sortedPlaces.length) {
      const currentVal = listStart.value;
      listStart.innerHTML = `<option value="">Tất cả điểm đến</option>` +
        sortedPlaces.map((p) => `<option value="${escapeHtml(p)}"${p === currentVal ? " selected" : ""}>${escapeHtml(p)}</option>`).join("");
    }
    if (quickStart && sortedPlaces.length) {
      const currentVal = quickStart.value;
      quickStart.innerHTML = `<option value="">Mọi điểm đến</option>` +
        sortedPlaces.map((p) => `<option value="${escapeHtml(p)}"${p === currentVal ? " selected" : ""}>${escapeHtml(p)}</option>`).join("");
    }
  } catch {
    if (targetRating) targetRating.textContent = "—";
  }
}

function sortTours(tours, sort) {
  if (sort === "price-asc") return tours.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return tours.sort((a, b) => b.price - a.price);
  if (sort === "duration-short") return tours.sort((a, b) => Number.parseInt(a.duration, 10) - Number.parseInt(b.duration, 10));
  return tours;
}

async function loadTours() {
  const grid = document.getElementById("listing-grid");
  const empty = document.getElementById("listing-empty");
  const params = new URLSearchParams();
  const keyword = document.getElementById("quick-keyword").value.trim();
  const destination = document.getElementById("quick-start").value || document.getElementById("list-start").value;
  const date = document.getElementById("quick-date").value || document.getElementById("list-date").value;
  const maxPrice = appliedMaxPrice;
  const sort = document.getElementById("listing-sort").value;

  const query = [keyword, destination].filter(Boolean).join(" ");
  if (query) params.set("q", query);
  if (date) {
    params.set("from", date);
    params.set("to", date);
  }
  if (maxPrice !== null && maxPrice > 0 && maxPrice < Number(slider.max)) params.set("maxPrice", String(maxPrice));
  if (sort === "price-asc" || sort === "price-desc") params.set("sort", sort);

  grid.setAttribute("aria-busy", "true");
  try {
    const response = await fetch(`/api/tours?${params}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể tải danh sách tour.");
    const tours = sortTours(data.tours || [], sort);
    document.getElementById("listing-empty-title").textContent = "Không tìm thấy tour phù hợp";
    document.getElementById("listing-empty-message").textContent = "Thử thay đổi tiêu chí tìm kiếm.";
    renderListing(tours);
  } catch (error) {
    grid.innerHTML = "";
    document.getElementById("listing-count").textContent = "0";
    document.getElementById("listing-empty-title").textContent = "Không tải được danh sách tour";
    document.getElementById("listing-empty-message").textContent = error.message;
    empty.hidden = false;
  } finally {
    grid.setAttribute("aria-busy", "false");
  }
}

function initBanner() {
  const track = document.getElementById("tour-banner-track");
  const dots = Array.from(document.querySelectorAll(".tour-banner-dot"));
  if (!track || !dots.length) return;
  let activeIndex = 0;
  const showSlide = (index) => {
    activeIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
  };
  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
  window.setInterval(() => showSlide((activeIndex + 1) % dots.length), 3500);
}

const slider = document.getElementById("list-price");
const priceLabel = document.getElementById("list-price-label");
const applyFiltersButton = document.getElementById("apply-filters");
let appliedMaxPrice = Number(slider.value);
const syncDestination = (source, target) => {
  target.value = source.value;
};

function updatePriceLabel() {
  priceLabel.textContent = `Tối đa ${formatPrice(slider.value)}`;
  slider.style.setProperty("--fill", `${(Number(slider.value) / Number(slider.max)) * 100}%`);
  const hasUnappliedPrice = appliedMaxPrice === null || Number(slider.value) !== appliedMaxPrice;
  applyFiltersButton.disabled = !hasUnappliedPrice;
  applyFiltersButton.textContent = hasUnappliedPrice ? "Áp dụng" : "Đã áp dụng";
}

function resetFilters() {
  document.getElementById("quick-search").reset();
  document.getElementById("list-start").value = "";
  document.getElementById("list-date").value = "";
  document.getElementById("listing-sort").value = "default";
  slider.value = slider.min;
  appliedMaxPrice = null;
  updatePriceLabel();
  loadTours();
}

document.getElementById("quick-search").addEventListener("submit", (event) => {
  event.preventDefault();
  syncDestination(document.getElementById("quick-start"), document.getElementById("list-start"));
  document.getElementById("list-date").value = document.getElementById("quick-date").value;
  loadTours();
});

document.getElementById("quick-start").addEventListener("change", (event) => {
  syncDestination(event.currentTarget, document.getElementById("list-start"));
  loadTours();
});
document.getElementById("quick-date").addEventListener("change", (event) => {
  document.getElementById("list-date").value = event.currentTarget.value;
  loadTours();
});
document.getElementById("list-start").addEventListener("change", (event) => {
  syncDestination(event.currentTarget, document.getElementById("quick-start"));
  loadTours();
});
document.getElementById("list-date").addEventListener("change", (event) => {
  document.getElementById("quick-date").value = event.currentTarget.value;
  loadTours();
});
document.getElementById("quick-keyword").addEventListener("input", loadTours);
slider.addEventListener("input", () => {
  updatePriceLabel();
});
document.getElementById("listing-sort").addEventListener("change", loadTours);
applyFiltersButton.addEventListener("click", () => {
  appliedMaxPrice = Number(slider.value);
  updatePriceLabel();
  loadTours();
});
document.getElementById("empty-reset").addEventListener("click", resetFilters);
document.getElementById("reset-filters").addEventListener("click", resetFilters);
document.getElementById("listing-grid").addEventListener("click", (event) => {
  const button = event.target.closest(".listing-card-actions button");
  if (!button) return;
  const active = button.getAttribute("aria-pressed") === "true";
  button.setAttribute("aria-pressed", String(!active));
  button.textContent = active ? "♡" : "♥";
});

updatePriceLabel();
initBanner();
initNavigation();
initHeaderAccount();
syncStatsAndDestinations();
loadTours();

// Tự động cập nhật danh sách Tour & chỗ trống theo thời gian thực (SSE)
subscribeRealtime(["tour:changed", "availability:updated", "review:changed", "destination:changed"], (event) => {
  syncStatsAndDestinations();
  loadTours();
  if (event.type === "tour:changed" && event.payload?.action === "created" && event.payload?.status === "active") {
    showRealtimeToast({
      title: "Tour mới vừa ra mắt!",
      message: `"${event.payload.tourName}" đã sẵn sàng nhận đặt chỗ.`,
      tone: "success",
      actionLabel: "Xem ngay",
      actionHref: `/tour-detail.html?id=${encodeURIComponent(event.payload.tourId)}`,
    });
  }
});
