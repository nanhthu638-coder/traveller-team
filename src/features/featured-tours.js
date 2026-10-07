const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(Math.round(value))}đ`;
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

export async function initFeaturedTours() {
  const container = document.getElementById("featured-list");
  if (!container) return;

  try {
    const response = await fetch("/api/tours");
    if (!response.ok) throw new Error("Không thể tải tour nổi bật.");
    const { tours = [] } = await response.json();
    container.innerHTML = tours.slice(0, 3).map((tour) => `
      <article class="featured-card">
        <img src="${imageUrl(tour.image)}" alt="${escapeHtml(tour.name)}" loading="lazy" />
        <div class="featured-card-body">
          <p class="featured-card-place">${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</p>
          <h3 class="font-display">${escapeHtml(tour.name)}</h3>
          <div class="featured-meta"><span>Khởi hành: ${escapeHtml(tour.departures[0] || "Hàng ngày")}</span><span>★★★★★ 4.8</span></div>
          <div class="featured-card-footer">
            <strong>${formatPrice(tour.price)}</strong>
            <a class="featured-card-link" href="/tour-detail.html?id=${encodeURIComponent(tour.id)}">Xem chi tiết <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </article>
    `).join("");
  } catch {
    container.innerHTML = '<p class="form-status is-error">Chưa thể tải tour nổi bật. Vui lòng tải lại trang.</p>';
  }
}
