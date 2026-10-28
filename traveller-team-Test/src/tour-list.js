const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(Math.round(value))}đ`;
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function renderFeaturedList(tours) {
  const featured = document.getElementById("featured-list");
  if (!featured) return;

  featured.innerHTML = tours.slice(0, 3).map((tour) => `
    <article class="featured-card">
      <img src="${imageUrl(tour.image)}" alt="${escapeHtml(tour.name)}" loading="lazy" />
      <div class="featured-card-body">
        <p class="featured-card-place">${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</p>
        <h3 class="font-display">${escapeHtml(tour.name)}</h3>
        <div class="featured-meta">
          <span>Khởi hành: ${tour.departures[0] || "Hàng ngày"}</span>
          <span>★★★★★ 4.8</span>
        </div>
        <div class="featured-card-footer">
          <strong>${formatPrice(tour.price)}</strong>
          <a class="featured-card-link" href="/tour-detail.html?id=${encodeURIComponent(tour.id)}">Xem chi tiết <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>
  `).join("");
}

function getTours() {
  return fetch("/api/tours")
    .then((response) => response.json())
    .then((data) => data.tours || [])
    .catch(() => []);
}

function renderListing(tours) {
  const grid = document.getElementById("listing-grid");
  const empty = document.getElementById("listing-empty");
  const count = document.getElementById("listing-count");

  if (!grid || !count) return;

  count.textContent = String(tours.length);

  if (!tours.length) {
    grid.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  grid.innerHTML = tours.map((tour) => `
    <article class="listing-card">
      <div class="listing-card-image">
        <img src="${imageUrl(tour.image)}" alt="${escapeHtml(tour.name)}" loading="lazy" />
        <span class="listing-badge">${escapeHtml(tour.duration)}</span>
      </div>
      <div class="listing-card-body">
        <p class="featured-card-place">${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</p>
        <h3 class="font-display">${escapeHtml(tour.name)}</h3>
        <div class="listing-card-info">
          <span>Khởi hành: ${tour.departures[0] ? tour.departures[0].slice(8, 10) + "/" + tour.departures[0].slice(5, 7) + "/" + tour.departures[0].slice(0, 4) : "Hàng ngày"}</span>
          <span>★★★★★ 4.8</span>
        </div>
        <div class="listing-card-price">
          <div>
            <del>${formatPrice(tour.price * 1.18)}</del>
            <br />
            <strong>${formatPrice(tour.price)}</strong>
          </div>
          <div class="listing-card-actions">
            <button type="button" aria-label="Yêu thích">♥</button>
            <a href="/tour-detail.html?id=${encodeURIComponent(tour.id)}">Xem chi tiết</a>
          </div>
        </div>
      </div>
    </article>
  `).join("");
}

function bindPriceFilter(tours) {
  const slider = document.getElementById("list-price");
  const label = document.getElementById("list-price-label");

  if (!slider || !label) return () => {};

  const updatePriceLabel = () => {
    const value = Number(slider.value || 0);
    label.textContent = `Tối đa ${formatPrice(value)}`;
    slider.style.setProperty("--fill", `${(value / Number(slider.max || 1)) * 100}%`);

    const filtered = tours.filter((tour) => Number(tour.price) <= value || value === 0);
    renderListing(filtered);
  };

  slider.addEventListener("input", updatePriceLabel);
  updatePriceLabel();

  return () => slider.removeEventListener("input", updatePriceLabel);
}

function initTourBanner() {
  const track = document.getElementById("tour-banner-track");
  const dots = Array.from(document.querySelectorAll(".tour-banner-dot"));
  if (!track || !dots.length) return;

  let activeIndex = 0;
  const totalSlides = dots.length;

  const updateBanner = (nextIndex) => {
    activeIndex = nextIndex;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => updateBanner(index));
  });

  setInterval(() => {
    updateBanner((activeIndex + 1) % totalSlides);
  }, 3500);
}

async function initHomeFeatured() {
  const tours = await getTours();
  renderFeaturedList(tours);
}

async function initTourList() {
  const tours = await getTours();
  renderListing(tours);
  bindPriceFilter(tours);
  initTourBanner();
}

if (document.getElementById("featured-list")) {
  initHomeFeatured();
}

if (document.getElementById("listing-grid")) {
  initTourList();
}
