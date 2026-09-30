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

function getTourById(id) {
  return fetch(`/api/tours`)
    .then((response) => response.json())
    .then((data) => data.tours.find((tour) => tour.id === id))
    .catch(() => null);
}

function renderTourDetail(tour) {
  const reviewCount = 128;
  const rating = 4.9;
  const destinations = [tour.place, tour.region, "Khách sạn 3 - 5 sao", "Ẩm thực địa phương"].filter(Boolean);
  const highlights = [
    "Check-in các địa danh nổi tiếng, điểm chụp ảnh đẹp và trải nghiệm độc quyền.",
    "Thưởng thức ẩm thực địa phương đặc sản, bữa tối tại các địa điểm nổi tiếng.",
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
        "Tối: Thưởng thức bữa tối và nghỉ ngơi tại khách sạn cho đêm đầu tiên.",
      ],
    },
    {
      title: "NGÀY 2: TRẢI NGHIỆM ĐIỂM NỔI BẬT",
      meals: "Bữa ăn: Sáng / Trưa / Tối",
      summary: [
        "Sáng: Dùng điểm tâm sáng, khởi hành để khám phá lịch trình chính của tour.",
        "Trưa: Dùng bữa trưa buffet hoặc set menu tại nhà hàng địa phương.",
        "Chiều: Tham gia trải nghiệm điển hình của điểm đến như trekking, tham quan và chụp hình.",
        "Tối: Ăn tối tại địa điểm đặc sản và nghỉ ngơi tại khách sạn.",
      ],
    },
    {
      title: "NGÀY 3: KẾT THÚC TOUR",
      meals: "Bữa ăn: Sáng / Trưa",
      summary: [
        "Sáng: Ăn sáng và tham quan thêm một địa điểm check-in cuối cùng.",
        "Trưa: Bữa trưa cuối cùng và kết thúc hành trình lưu trú.",
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
        <div><span>Phương tiện</span><strong>Xe du lịch đời mới</strong></div>
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
                <a class="related-card" href="/tour-detail.html?id=${encodeURIComponent(item.id)}">
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

async function initTourDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const tourId = params.get("id");
  const detailPage = document.getElementById("tour-detail-page");

  if (!tourId) {
    detailPage.innerHTML = '<div class="detail-empty">Không tìm thấy tour. <a href="/tour-list.html">Quay lại danh sách tour</a></div>';
    return;
  }

  const tour = await getTourById(tourId);
  if (!tour) {
    detailPage.innerHTML = '<div class="detail-empty">Tour này không tồn tại. <a href="/tour-list.html">Quay lại danh sách tour</a></div>';
    return;
  }

  detailPage.innerHTML = renderTourDetail(tour);
  document.title = `${tour.name} | Traveller Team`;

  detailPage.querySelector("[data-back-to-list]")?.addEventListener("click", () => {
    window.location.href = "/tour-list.html";
  });

  const totalHolder = detailPage.querySelector("[data-detail-total]");

  function updateTotal() {
    const adults = Number(detailPage.querySelector('[data-role="adult"]').value || 0);
    const children = Number(detailPage.querySelector('[data-role="child"]').value || 0);
    const infants = Number(detailPage.querySelector('[data-role="infant"]').value || 0);
    totalHolder.textContent = formatPrice(calculateTourTotal(tour.price, adults, children, infants));
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
}

initTourDetailPage();
