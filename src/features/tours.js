// Tìm kiếm + lọc tour trên trang chủ. Dữ liệu lấy từ API: GET /api/tours
const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(value)}đ`;
const formatDate = (iso) => iso.split("-").reverse().join("/"); // 2026-10-18 -> 18/10/2026
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
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
  const dates = hasDateFilter ? tour.matchedDepartures : tour.departures;
  const shown = dates.slice(0, 3).map(formatDate).join(" · ");
  const rest = dates.length - 3;
  return `
    <article class="tour-card">
      <div class="tour-card-image">
        <img src="${imageUrl(tour.image)}" alt="${escapeHtml(tour.name)}" loading="lazy" />
        <span class="tour-card-duration">${escapeHtml(tour.duration)}</span>
      </div>
      <div class="tour-card-body">
        <p class="tour-card-place">${escapeHtml(tour.place)}, ${escapeHtml(tour.region)}</p>
        <h3 class="font-display">${escapeHtml(tour.name)}</h3>
        <p class="tour-card-dates">${hasDateFilter ? "Khởi hành phù hợp" : "Khởi hành"}: ${shown}${rest > 0 ? ` (+${rest})` : ""}</p>
        <div class="tour-card-footer">
          <p><small>Giá từ</small><strong class="font-display">${formatPrice(tour.price)}</strong></p>
          <a class="tour-card-link" href="#tour/${encodeURIComponent(tour.id)}" data-tour-id="${escapeHtml(tour.id)}" data-tour-name="${escapeHtml(tour.name)}">Xem chi tiết <span aria-hidden="true">↗</span></a>
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
    // Ảnh lỗi -> hiện nền màu thay thế
    list.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => img.closest(".tour-card-image").classList.add("is-broken"), { once: true });
    });
    empty.hidden = tours.length > 0;
    count.innerHTML = `Tìm thấy <strong>${tours.length}</strong> hành trình${isFiltering(filters) ? " phù hợp" : ""}`;
  }

  async function load() {
    const filters = readFilters();
    notice.textContent = "";
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

    controller?.abort(); // bỏ yêu cầu cũ nếu người dùng gõ tiếp
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
    heroForm.reset();
    load();
  }

  // Gõ từ khóa / nhập giá: chờ 250ms rồi mới gọi API
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
  document.getElementById("tour-empty-reset").addEventListener("click", reset);

  // Ô tìm nhanh ở hero: chép từ khóa xuống phần kết quả rồi cuộn tới đó
  heroForm.addEventListener("submit", (event) => {
    event.preventDefault();
    form.elements.q.value = heroForm.elements.q.value.trim();
    load();
    document.getElementById("tours").scrollIntoView({ behavior: "smooth" });
  });

  // "Xem chi tiết": trang chi tiết tour do thành viên khác phụ trách.
  // Phát sự kiện "tour:view" để trang đó bắt và xử lý; nếu chưa có ai xử lý thì báo tạm.
  list.addEventListener("click", (event) => {
    const link = event.target.closest(".tour-card-link");
    if (!link) return;
    const detail = { id: link.dataset.tourId, name: link.dataset.tourName };
    const handled = !document.dispatchEvent(new CustomEvent("tour:view", { detail, cancelable: true }));
    if (!handled) {
      event.preventDefault();
      notice.textContent = `Trang chi tiết "${detail.name}" đang được phát triển.`;
    }
  });

  load();
}
