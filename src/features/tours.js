// Tìm kiếm + lọc tour trên trang chủ. Dữ liệu lấy từ API: GET /api/tours + cập nhật Real-time qua SSE
import { ratingBadge } from "./review-ui.js";
import { FALLBACK_TOUR_IMAGE, renderSeatBadge, resolveTourImageUrl, showRealtimeToast, subscribeRealtime } from "./realtime.js";

const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(value)}đ`;
const formatDate = (iso) => String(iso || "").split("-").reverse().join("/"); // 2026-10-18 -> 18/10/2026

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

// Kiểm tra nhanh ở client để báo lỗi ngay, server vẫn kiểm tra lại
function validate({ minPrice, maxPrice, from, to }) {
  if (minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice)) {
    return "Giá tối thiểu không được lớn hơn giá tối đa.";
  }
  if (from && to && from > to) return "Ngày bắt đầu không được sau ngày kết thúc.";
  return "";
}

function renderCard(tour, hasDateFilter) {
  const dates = hasDateFilter ? (tour.matchedDepartures || []) : (tour.upcomingDepartures?.length ? tour.upcomingDepartures : (tour.departures || []));
  const shown = dates.slice(0, 3).map(formatDate).join(" · ") || "Liên hệ";
  const rest = dates.length - 3;
  return `
    <article class="tour-card">
      <div class="tour-card-image">
        <img src="${resolveTourImageUrl(tour.image, 700)}" alt="${escapeHtml(tour.name)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_TOUR_IMAGE}';" />
        <span class="tour-card-duration">${escapeHtml(tour.duration)}</span>
        <div class="tour-card-seat-wrap">${renderSeatBadge(tour)}</div>
      </div>
      <div class="tour-card-body">
        <div class="tour-card-top-meta">
          <p class="tour-card-place">📍 ${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</p>
          ${ratingBadge(tour)}
        </div>
        <h3 class="font-display">${escapeHtml(tour.name)}</h3>
        <p class="tour-card-dates">🗓️ ${hasDateFilter ? "Khởi hành phù hợp" : "Khởi hành"}: <strong>${shown}</strong>${rest > 0 ? ` <small>(+${rest} đợt)</small>` : ""}</p>
        <div class="tour-card-footer">
          <p><small>Giá trọn gói từ</small><strong class="font-display">${formatPrice(tour.price)}</strong></p>
          <a class="tour-card-link" href="/tour-detail.html?id=${encodeURIComponent(tour.id)}">Xem chi tiết <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>`;
}

export function initTours() {
  const form = document.getElementById("tour-filter");
  const heroForm = document.getElementById("hero-search");
  const list = document.getElementById("tour-list");
  const empty = document.getElementById("tour-empty");
  const count = document.getElementById("tour-count");
  const errorBox = document.getElementById("tour-filter-error");
  const notice = document.getElementById("tour-notice");
  const resetButton = document.getElementById("tour-reset");
  if (!form || !list) return;
  const chips = Array.from(form.querySelectorAll(".chip"));
  let debounceTimer;
  let controller;

  const readFilters = () => ({
    q: form.elements.q.value.trim(),
    minPrice: form.elements.minPrice.value.trim(),
    maxPrice: form.elements.maxPrice.value.trim(),
    from: form.elements.from.value,
    to: form.elements.to.value,
    sort: form.elements.sort.value,
  });

  const isFiltering = (f) => Boolean(f.q || f.minPrice || f.maxPrice || f.from || f.to);

  function showResults(tours, filters) {
    list.innerHTML = tours.map((tour) => renderCard(tour, Boolean(filters.from || filters.to))).join("");
    list.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => img.closest(".tour-card-image")?.classList.add("is-broken"), { once: true });
    });
    empty.hidden = tours.length > 0;
    count.innerHTML = `Tìm thấy <strong>${tours.length}</strong> hành trình${isFiltering(filters) ? " phù hợp" : ""}`;
  }

  async function load() {
    const filters = readFilters();
    if (notice) notice.textContent = "";
    resetButton.hidden = !isFiltering(filters);
    chips.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.min === filters.minPrice && chip.dataset.max === filters.maxPrice));

    const problem = validate(filters);
    errorBox.textContent = problem;
    if (problem) {
      list.innerHTML = "";
      empty.hidden = true;
      count.textContent = "Vui lòng chỉnh lại bộ lọc.";
      return;
    }

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && !(key === "sort" && value === "default")) params.set(key, value);
    });

    controller?.abort();
    controller = new AbortController();
    list.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(`/api/tours?${params}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tải danh sách tour.");
      showResults(data.tours, filters);
    } catch (error) {
      if (error.name === "AbortError") return;
      list.innerHTML = "";
      empty.hidden = true;
      count.textContent = "";
      errorBox.textContent = error.message || "Không thể kết nối máy chủ. Vui lòng thử lại.";
    } finally {
      list.setAttribute("aria-busy", "false");
    }
  }

  const loadSoon = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(load, 250);
  };

  function reset() {
    form.reset();
    heroForm?.reset();
    load();
  }

  form.addEventListener("input", (event) => {
    if (event.target.type === "search" || event.target.type === "number") loadSoon();
    else load();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    load();
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const isActive = chip.classList.contains("is-active");
      form.elements.minPrice.value = isActive ? "" : chip.dataset.min;
      form.elements.maxPrice.value = isActive ? "" : chip.dataset.max;
      load();
    });
  });

  resetButton.addEventListener("click", reset);
  document.getElementById("tour-empty-reset")?.addEventListener("click", reset);

  heroForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    form.elements.q.value = heroForm.elements.q.value.trim();
    load();
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  });

  load();

  // Lắng nghe sự kiện Real-time từ máy chủ
  subscribeRealtime(["tour:changed", "availability:updated", "review:changed"], (event) => {
    loadSoon();
    if (event.type === "tour:changed" && event.payload?.action === "created" && event.payload?.status === "active") {
      showRealtimeToast({
        title: "Hành trình mới vừa mở bán!",
        message: `Tour "${event.payload.tourName}" vừa được cập nhật lên hệ thống.`,
        tone: "success",
        actionLabel: "Khám phá ngay",
        actionHref: `/tour-detail.html?id=${encodeURIComponent(event.payload.tourId)}`,
      });
    }
  });
}
