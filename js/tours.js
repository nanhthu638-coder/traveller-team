// Xử lý: Xem trang chủ (khối Tour), Tìm kiếm Tour theo từ khóa, Lọc theo khoảng giá và ngày khởi hành.

const tourGrid = document.getElementById('tour-grid');
const tourEmpty = document.getElementById('tour-empty');
const tourResultCount = document.getElementById('tour-result-count');

const searchInput = document.getElementById('tour-search');
const priceMinInput = document.getElementById('tour-price-min');
const priceMaxInput = document.getElementById('tour-price-max');
const dateInput = document.getElementById('tour-date');
const resetButton = document.getElementById('tour-reset');

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu/hoa-thường.
const normalize = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();

const renderTourCard = (tour) => `
  <article class="tour-card" data-tour-id="${tour.id}">
    <div class="tour-card-media"><span>${tour.tag}</span></div>
    <div class="tour-card-body">
      <h4>${tour.name}</h4>
      <p class="tour-card-meta">📍 ${tour.location} · ${tour.duration}</p>
      <p class="tour-card-meta">🗓️ Khởi hành: ${dateFormatter.format(new Date(tour.departureDate))}</p>
      <p class="tour-card-price">${currencyFormatter.format(tour.price)}</p>
    </div>
  </article>
`;

const getFilters = () => ({
  keyword: normalize(searchInput.value),
  priceMin: priceMinInput.value ? Number(priceMinInput.value) : null,
  priceMax: priceMaxInput.value ? Number(priceMaxInput.value) : null,
  fromDate: dateInput.value || null,
});

const matchesFilters = (tour, filters) => {
  if (filters.keyword) {
    const haystack = normalize(`${tour.name} ${tour.location}`);
    if (!haystack.includes(filters.keyword)) return false;
  }
  if (filters.priceMin !== null && tour.price < filters.priceMin) return false;
  if (filters.priceMax !== null && tour.price > filters.priceMax) return false;
  if (filters.fromDate && tour.departureDate < filters.fromDate) return false;
  return true;
};

const applyFilters = () => {
  const filters = getFilters();
  const results = TOURS.filter((tour) => matchesFilters(tour, filters));

  tourGrid.innerHTML = results.map(renderTourCard).join('');
  tourGrid.hidden = results.length === 0;
  tourEmpty.hidden = results.length !== 0;
  tourResultCount.textContent = results.length
    ? `Tìm thấy ${results.length} tour phù hợp`
    : '';
};

[searchInput, priceMinInput, priceMaxInput, dateInput].forEach((input) => {
  input.addEventListener('input', applyFilters);
});

resetButton.addEventListener('click', () => {
  searchInput.value = '';
  priceMinInput.value = '';
  priceMaxInput.value = '';
  dateInput.value = '';
  applyFilters();
});

applyFilters();
