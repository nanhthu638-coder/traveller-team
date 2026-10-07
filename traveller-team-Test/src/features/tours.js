// Tìm kiếm + lọc tour trên trang chủ. Dữ liệu lấy từ API: GET /api/tours
const priceFormat = new Intl.NumberFormat("vi-VN");
const formatPrice = (value) => `${priceFormat.format(Math.round(value))}đ`;
const formatDate = (iso) => iso.split("-").reverse().join("/");
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function calculateTourTotal(price, adults, children, infants) {
  return adults * price + children * price * 0.7 + infants * 0;
}

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

function renderTourDetail(tour) {
  const reviewCount = 128;
  const rating = 4.9;
  const travelMode = "Xe du lịch đời mới";
  const destinations = [tour.place, tour.region, "Khách sạn 3 - 5 sao", "Ẩm thực địa phương"].filter(Boolean);
  const highlights = [
    "Check-in các địa danh nổi tiếng, điểm chụp ảnh đẹp và trải nghiệm độc quyền.",
    "Thưởng thức ẩm thực địa phương đặc sản, bữa tối at dining hotspots và món ăn truyền thống.",
    "Lưu trú khách sạn tiêu chuẩn 3 - 5 sao, phòng nghỉ tiện nghi và view đẹp.",
    "Dịch vụ trọn gói, hướng dẫn viên nhiệt tình, hỗ trợ suốt tuyến và bảo hiểm du lịch cao cấp.",
  ];
  const itinerary = [
    {
      title: "NGÀY 1: ĐÓN KHÁCH - KHỞI HÀNH",
      meals: "Bữa ăn: Trưa / Tối",
      summary: [
        "Sáng: Đón khách tại điểm hẹn, khởi hành đi từ Hà Nội và di chuyển đến trung tâm tour.",
        "Trưa: Dùng bữa trưa đặc sản địa phương, nhận phòng khách sạn và nghỉ ngơi.",
        "Chiều: Tham quan các địa điểm nổi bật của khu vực, chụp ảnh lưu niệm.",
        "Tối: thưởng thức bữa tối và nghỉ ngơi tại khách sạn cho đêm đầu tiên.",
      ],
    },
    {
      title: "NGÀY 2: TRẢI NGHIỆM ĐIỂM NỔI BẬT",
      meals: "Bữa ăn: Sáng / Trưa / Tối",
      summary: [
        "Sáng: Dùng điểm tâm sáng sạch sẽ, khởi hành để khám phá lịch trình chính của tour.",
        "Trưa: Dùng bữa trưa buffet hoặc set menu tại nhà hàng địa phương.",
        "Chiều: Tham gia trải nghiệm điển hình của điểm đến như trekking, tham quan, chụp hình.",
        "Tối: Ăn tối tại địa điểm đặc sản và nghỉ ngơi tại khách sạn.",
      ],
    },
    {
      title: "NGÀY 3: KẾT THÚC TOUR - HỒN THÀNH KỲ HẠN",
      meals: "Bữa ăn: Sáng / Trưa",
      summary: [
        "Sáng: Ăn sáng và tham quan thêm một địa điểm check-in cuối cùng.",
        "Trưa: Bữa trưa cuối và kết thúc hành trình lưu trú.",
        "Chiều: Xe đưa về điểm xuất phát thuận tiện cho việc trở về.",
      ],
    },
  ];
  const includes = [
    "Vé máy bay / xe đưa đón theo chương trình.",
    "Khách sạn tiêu chuẩn 3 - 5 sao, 2 khách/phòng.",
    "Các bữa ăn theo lịch trình chi tiết.",
    "Vé tham quan các điểm có trong tour.",
    "Hướng dẫn viên nhiệt tình, kinh nghiệm.",
    "Bảo hiểm du lịch cao cấp 50.000.000 VNĐ/vụ.",
    "Nước suối, khăn lạnh hàng ngày.",
  ];
  const excludes = [
    "Thuế VAT nếu phát sinh hóa đơn.",
    "Chi phí cá nhân: giặt ủi, điện thoại, đồ uống ngoài chương trình.",
    "Tiền tip cho tài xế và hướng dẫn viên.",
    "Phụ thu phòng đơn.",
    "Vé tham quan các điểm phát sinh ngoài lịch trình.",
  ];
  const policies = [
    "Dưới 2 tuổi: miễn phí hoặc theo quy định của công ty.",
    "Từ 2 đến 11 tuổi: 70% giá người lớn, có giường/không giường riêng tùy yêu cầu.",
    "Từ 12 tuổi trở lên: tính như giá người lớn.",
    "Hủy trước 15 ngày: phí 0% - 10%.",
    "Hủy từ 7 đến 14 ngày: phí 30% - 50%.",
    "Hủy trong vòng 3 ngày hoặc không đến: phạt 100% giá trị tour.",
  ];
  const reviewText = [
    "Dịch vụ rất tốt, không gian khách sạn đẹp, hướng dẫn viên nhiệt tình và chu đáo.",
    "Tour khá trọn gói, ăn uống ổn và thời gian đi hợp lý cho một chuyến ngắn ngày.",
    "Cảnh đẹp, quán ăn ngon, các điểm chụp ảnh rất phù hợp cho gia đình.",
  ];
  const relatedTours = [
    { id: "ha-long-3n2d", name: "Vịnh Hạ Long · 3 ngày 2 đêm", price: 3490000, image: "photo-1528127269322-539801943592" },
    { id: "da-lat-3n2d", name: "Đà Lạt · 3 ngày 2 đêm", price: 2790000, image: "photo-1531058020387-3be344556be6" },
    { id: "sa-pa-3n2d", name: "Sa Pa · 3 ngày 2 đêm", price: 3190000, image: "photo-1470770841072-f978cf4d019e" },
  ].filter((item) => item.id !== tour.id);
  const media = [
    imageUrl(tour.image),
    imageUrl("photo-1501785888041-af3ef285b470"),
    imageUrl("photo-1527631746610-bca00a040d60"),
    imageUrl("photo-1467269204594-9661b134dd2b"),
  ];
  const departureOptions = tour.departures.slice(0, 4).map((date) => `<option value="${date}">${formatDate(date)}</option>`).join("");
  const defaultAdults = 2;
  const defaultChildren = 0;
  const defaultInfants = 0;
  const total = formatPrice(calculateTourTotal(tour.price, defaultAdults, defaultChildren, defaultInfants));

  return `
    <div class="detail-shell">
      <button class="detail-back" type="button" data-back-to-list>← Quay lại danh sách</button>

      <header class="detail-header">
        <div>
          <p class="eyebrow eyebrow-dark"><span></span> Tour du lịch</p>
          <h2 class="font-display">${escapeHtml(tour.name)}</h2>
          <div class="detail-meta">
            <span>Mã tour: <strong>${escapeHtml(`${tour.id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)}-01`)}</strong></span>
            <span>Đánh giá: <strong>${rating}</strong> ★★★★★ (${reviewCount} nhận xét)</span>
          </div>
        </div>
      </header>

      <div class="detail-media">
        ${media.map((src, index) => `
          <div class="media-frame ${index === 0 ? "media-frame--wide" : ""}">
            <img src="${src}" alt="${escapeHtml(tour.name)} ${index + 1}" loading="lazy" />
          </div>
        `).join("")}
        <div class="media-video">
          <span>Video trailer</span>
          <button type="button">▶ Xem giới thiệu</button>
        </div>
      </div>

      <div class="detail-summary">
        <div><span>Thời gian</span><strong>${escapeHtml(tour.duration)}</strong></div>
        <div><span>Điểm khởi hành</span><strong>Hà Nội</strong></div>
        <div><span>Phương tiện</span><strong>${escapeHtml(travelMode)}</strong></div>
        <div><span>Điểm đến chính</span><strong>${escapeHtml(destinations.join(" • "))}</strong></div>
      </div>

      <div class="detail-layout">
        <div class="detail-content">
          <section class="detail-section">
            <h3>Điểm nổi bật của tour</h3>
            <ul class="highlight-list">
              ${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </section>

          <section class="detail-section">
            <h3>Lịch trình chi tiết</h3>
            ${itinerary.map((day) => `
              <article class="itinerary-item">
                <h4>${escapeHtml(day.title)} <span>${escapeHtml(day.meals)}</span></h4>
                <ul>
                  ${day.summary.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
                </ul>
              </article>
            `).join("")}
          </section>

          <section class="detail-section detail-section--split">
            <div>
              <h3>Giá bao gồm</h3>
              <ul>
                ${includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </div>
            <div>
              <h3>Giá không bao gồm</h3>
              <ul>
                ${excludes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </div>
          </section>

          <section class="detail-section">
            <h3>Chính sách & điều khoản</h3>
            <ul>
              ${policies.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </section>

          <section class="detail-section">
            <h3>Đánh giá & phản hồi</h3>
            <div class="review-overview"><strong>${rating}</strong> / 5 <span>(Dựa trên ${reviewCount} đánh giá thực tế)</span></div>
            <div class="review-list">
              ${reviewText.map((text) => `
                <article class="review-item">
                  <div class="review-header">
                    <span class="review-name">Khách hàng</span>
                    <span class="review-stars">★★★★★</span>
                  </div>
                  <p>${escapeHtml(text)}</p>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="detail-section">
            <h3>Các tour tương tự</h3>
            <div class="related-grid">
              ${relatedTours.map((item) => `
                <a class="related-card" href="#tour/${encodeURIComponent(item.id)}" data-tour-id="${escapeHtml(item.id)}" data-tour-name="${escapeHtml(item.name)}">
                  <img src="${imageUrl(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
                  <span>${escapeHtml(item.name)}</span>
                  <strong>${formatPrice(item.price)}</strong>
                </a>
              `).join("")}
            </div>
          </section>
        </div>

        <aside class="booking-panel">
          <div class="booking-box">
            <div class="booking-price">
              <span>Giá gốc</span>
              <del>${formatPrice(tour.price * 1.15)}</del>
              <strong>${formatPrice(tour.price)} <small>VNĐ / Khách</small></strong>
            </div>

            <label>Chọn ngày khởi hành
              <select class="booking-date">
                ${departureOptions}
              </select>
            </label>

            <div class="passenger-box">
              <div class="passenger-row">
                <div>
                  <span>Người lớn</span>
                  <small>(>12 tuổi)</small>
                </div>
                <div class="passenger-controls">
                  <button type="button" data-step="-1" data-target="adult">−</button>
                  <input data-role="adult" type="number" min="0" value="${defaultAdults}" inputmode="numeric" />
                  <button type="button" data-step="1" data-target="adult">+</button>
                </div>
              </div>

              <div class="passenger-row">
                <div>
                  <span>Trẻ em</span>
                  <small>(2 - 11 tuổi)</small>
                </div>
                <div class="passenger-controls">
                  <button type="button" data-step="-1" data-target="child">−</button>
                  <input data-role="child" type="number" min="0" value="${defaultChildren}" inputmode="numeric" />
                  <button type="button" data-step="1" data-target="child">+</button>
                </div>
              </div>

              <div class="passenger-row">
                <div>
                  <span>Em bé</span>
                  <small>(<2 tuổi)</small>
                </div>
                <div class="passenger-controls">
                  <button type="button" data-step="-1" data-target="infant">−</button>
                  <input data-role="infant" type="number" min="0" value="${defaultInfants}" inputmode="numeric" />
                  <button type="button" data-step="1" data-target="infant">+</button>
                </div>
              </div>
            </div>

            <div class="booking-total">
              <span>Tổng tiền tạm tính</span>
              <strong data-detail-total>${total}</strong>
            </div>

            <button class="submit-button booking-submit" type="button">ĐẶT TOUR NGAY <span aria-hidden="true">↗</span></button>
            <button class="secondary-cta" type="button">LIÊN HỆ TƯ VẤN TRỰC TIẾP / ZALO</button>
          </div>
        </aside>
      </div>
    </div>
  `;
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
  const detailPage = document.getElementById("tour-detail-page");
  const chips = Array.from(form.querySelectorAll(".chip"));
  let debounceTimer;
  let controller;
  let tours = [];

  const readFilters = () => ({
    q: form.elements.q.value.trim(),
    minPrice: form.elements.minPrice.value.trim(),
    maxPrice: form.elements.maxPrice.value.trim(),
    from: form.elements.from.value,
    to: form.elements.to.value,
    sort: form.elements.sort.value,
  });

  const isFiltering = (f) => Boolean(f.q || f.minPrice || f.maxPrice || f.from || f.to);

  function showResults(nextTours, filters) {
    tours = nextTours;
    list.innerHTML = nextTours.map((tour) => renderCard(tour, Boolean(filters.from || filters.to))).join("");
    list.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => img.closest(".tour-card-image").classList.add("is-broken"), { once: true });
    });
    empty.hidden = nextTours.length > 0;
    count.innerHTML = `Tìm thấy <strong>${nextTours.length}</strong> hành trình${isFiltering(filters) ? " phù hợp" : ""}`;
  }

  function showDetailPage(tourId) {
    const match = tours.find((tour) => tour.id === tourId) || null;
    if (!match) {
      notice.textContent = "Tour này không còn đang hiển thị. Vui lòng chọn một tour khác.";
      return;
    }
    detailPage.hidden = false;
    detailPage.innerHTML = renderTourDetail(match);
    detailPage.scrollIntoView({ behavior: "smooth", block: "start" });

    detailPage.querySelector("[data-back-to-list]").addEventListener("click", () => {
      detailPage.hidden = true;
      detailPage.innerHTML = "";
      history.replaceState(null, "", window.location.pathname + window.location.search);
      document.getElementById("tours").scrollIntoView({ behavior: "smooth" });
    });

    const price = Number(match.price);
    const totalHolder = detailPage.querySelector("[data-detail-total]");

    function updateTotal() {
      const adults = Math.max(0, Number(detailPage.querySelector('[data-role="adult"]').value || 0));
      const children = Math.max(0, Number(detailPage.querySelector('[data-role="child"]').value || 0));
      const infants = Math.max(0, Number(detailPage.querySelector('[data-role="infant"]').value || 0));
      totalHolder.textContent = formatPrice(calculateTourTotal(price, adults, children, infants));
    }

    detailPage.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.target;
        const input = detailPage.querySelector(`[data-role="${target}"]`);
        const current = Number(input.value || 0);
        input.value = Math.max(0, current + Number(button.dataset.step));
        updateTotal();
      });
    });

    detailPage.querySelectorAll("input[data-role]").forEach((input) => {
      input.addEventListener("input", () => {
        const value = Math.max(0, Number(input.value || 0));
        input.value = value;
        updateTotal();
      });
    });

    detailPage.querySelectorAll("[data-tour-id]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.dataset.tourId;
        if (!id) return;
        event.preventDefault();
        const nextHash = `#tour/${encodeURIComponent(id)}`;
        if (window.location.hash !== nextHash) {
          history.pushState(null, "", nextHash);
        }
        showDetailPage(id);
      });
    });
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

    controller?.abort();
    controller = new AbortController();
    list.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(`/api/tours?${params}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tải danh sách tour.");
      showResults(data.tours, filters);
      const hashTarget = window.location.hash.replace(/^#\/tour\//, "").replace(/^#tour\//, "");
      const tourId = decodeURIComponent(hashTarget || "");
      if (tourId) showDetailPage(tourId);
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
    detailPage.hidden = true;
    detailPage.innerHTML = "";
    history.replaceState(null, "", window.location.pathname + window.location.search);
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
  document.getElementById("tour-empty-reset").addEventListener("click", reset);

  heroForm.addEventListener("submit", (event) => {
    event.preventDefault();
    form.elements.q.value = heroForm.elements.q.value.trim();
    load();
    document.getElementById("tours").scrollIntoView({ behavior: "smooth" });
  });

  list.addEventListener("click", (event) => {
    const link = event.target.closest(".tour-card-link");
    if (!link) return;
    event.preventDefault();
    const tourId = link.dataset.tourId;
    const tourName = link.dataset.tourName;
    if (tourName) {
      document.title = `${tourName} | Traveller Team`;
    }
    window.location.href = `tour-detail.html?id=${encodeURIComponent(tourId)}`;
  });

  load();
}
