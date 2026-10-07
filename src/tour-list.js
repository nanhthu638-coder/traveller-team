import { initNavigation } from "./features/navigation.js";

const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(Math.round(value))}đ`;
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
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

  grid.innerHTML = tours.map((tour) => `
    <article class="listing-card">
      <div class="listing-card-image">
        <img src="${imageUrl(tour.image)}" alt="${escapeHtml(tour.name)}" loading="lazy" />
        <span class="listing-badge">${escapeHtml(tour.duration)}</span>
      </div>
      <div class="listing-card-body">
        <p class="featured-card-place">${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</p>
        <h3 class="font-display">${escapeHtml(tour.name)}</h3>
        <div class="listing-card-info"><span>Khởi hành: ${escapeHtml(tour.departures[0] || "Hàng ngày")}</span><span>★★★★★ 4.8</span></div>
        <div class="listing-card-price">
          <div><del>${formatPrice(tour.price * 1.18)}</del><br /><strong>${formatPrice(tour.price)}</strong></div>
          <div class="listing-card-actions">
            <button type="button" aria-label="Yêu thích tour ${escapeHtml(tour.name)}" aria-pressed="false">♡</button>
            <a href="/tour-detail.html?id=${encodeURIComponent(tour.id)}">Xem chi tiết</a>
          </div>
        </div>
      </div>
    </article>
  `).join("");
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
  const maxPrice = Number(document.getElementById("list-price").value);
  const sort = document.getElementById("listing-sort").value;

  const query = [keyword, destination].filter(Boolean).join(" ");
  if (query) params.set("q", query);
  if (date) {
    params.set("from", date);
    params.set("to", date);
  }
  if (maxPrice > 0 && maxPrice < Number(document.getElementById("list-price").max)) params.set("maxPrice", String(maxPrice));
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
const syncDestination = (source, target) => {
  target.value = source.value;
};

function updatePriceLabel() {
  priceLabel.textContent = `Tối đa ${formatPrice(slider.value)}`;
  slider.style.setProperty("--fill", `${(Number(slider.value) / Number(slider.max)) * 100}%`);
}

function resetFilters() {
  document.getElementById("quick-search").reset();
  document.getElementById("list-start").value = "";
  document.getElementById("list-date").value = "";
  document.getElementById("listing-sort").value = "default";
  slider.value = slider.max;
  updatePriceLabel();
  loadTours();
}

document.getElementById("quick-search").addEventListener("submit", (event) => {
  event.preventDefault();
  syncDestination(document.getElementById("quick-start"), document.getElementById("list-start"));
  document.getElementById("list-date").value = document.getElementById("quick-date").value;
  loadTours();
});

document.getElementById("quick-start").addEventListener("change", loadTours);
document.getElementById("quick-date").addEventListener("change", loadTours);
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
  loadTours();
});
document.getElementById("listing-sort").addEventListener("change", loadTours);
document.getElementById("apply-filters").addEventListener("click", loadTours);
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
loadTours();
