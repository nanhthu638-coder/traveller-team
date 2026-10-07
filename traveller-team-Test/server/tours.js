// ===== Dữ liệu tour + tìm kiếm/lọc (Story: Xem trang chủ, Tìm kiếm, Lọc tour) =====
// Dữ liệu mẫu. Khi có cơ sở dữ liệu thật, chỉ cần thay `tours` bằng dữ liệu đọc từ DB.
// - price: số nguyên (VND)
// - departures: ngày khởi hành dạng ISO "YYYY-MM-DD" (so sánh chuỗi được)
export const tours = [
  { id: "ha-long-3n2d", name: "Vịnh Hạ Long · 3 ngày 2 đêm", place: "Hạ Long", region: "Quảng Ninh", duration: "3 ngày 2 đêm", price: 3490000, image: "photo-1528127269322-539801943592", departures: ["2026-10-18", "2026-11-01", "2026-11-15"] },
  { id: "hoi-an-2n1d", name: "Phố cổ Hội An · 2 ngày 1 đêm", place: "Hội An", region: "Quảng Nam", duration: "2 ngày 1 đêm", price: 2150000, image: "photo-1531058020387-3be344556be6", departures: ["2026-10-22", "2026-11-05", "2026-11-19"] },
  { id: "ta-xua-2n1d", name: "Tà Xùa săn mây · 2 ngày 1 đêm", place: "Bắc Yên", region: "Sơn La", duration: "2 ngày 1 đêm", price: 1890000, image: "photo-1470770841072-f978cf4d019e", departures: ["2026-10-25", "2026-11-08", "2026-12-06"] },
  { id: "ha-giang-4n3d", name: "Hà Giang · Mã Pí Lèng · 4 ngày 3 đêm", place: "Hà Giang", region: "Hà Giang", duration: "4 ngày 3 đêm", price: 4290000, image: "photo-1470770841072-f978cf4d019e", departures: ["2026-10-30", "2026-11-13", "2026-11-27"] },
  { id: "phu-quoc-4n3d", name: "Phú Quốc · Đảo ngọc nghỉ dưỡng · 4 ngày 3 đêm", place: "Phú Quốc", region: "Kiên Giang", duration: "4 ngày 3 đêm", price: 6890000, image: "photo-1528127269322-539801943592", departures: ["2026-11-10", "2026-12-01", "2026-12-20"] },
  { id: "da-lat-3n2d", name: "Đà Lạt · Thành phố ngàn hoa · 3 ngày 2 đêm", place: "Đà Lạt", region: "Lâm Đồng", duration: "3 ngày 2 đêm", price: 2790000, image: "photo-1531058020387-3be344556be6", departures: ["2026-10-17", "2026-11-07", "2026-12-12"] },
  { id: "sa-pa-3n2d", name: "Sa Pa · Fansipan & bản làng · 3 ngày 2 đêm", place: "Sa Pa", region: "Lào Cai", duration: "3 ngày 2 đêm", price: 3190000, image: "photo-1470770841072-f978cf4d019e", departures: ["2026-10-24", "2026-11-14", "2026-12-05"] },
  { id: "con-dao-3n2d", name: "Côn Đảo · Hành trình tâm linh · 3 ngày 2 đêm", place: "Côn Đảo", region: "Bà Rịa - Vũng Tàu", duration: "3 ngày 2 đêm", price: 5490000, image: "photo-1528127269322-539801943592", departures: ["2026-11-20", "2026-12-10", "2026-12-27"] },
  { id: "hue-da-nang-4n3d", name: "Huế – Đà Nẵng · Di sản miền Trung · 4 ngày 3 đêm", place: "Huế", region: "Thừa Thiên Huế", duration: "4 ngày 3 đêm", price: 4650000, image: "photo-1531058020387-3be344556be6", departures: ["2026-10-28", "2026-11-25", "2026-12-15"] },
];

const SORTS = new Set(["default", "price-asc", "price-desc", "date-asc"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Bỏ dấu tiếng Việt + chữ thường: "ha long" khớp "Hạ Long"
export function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const asString = (value) => (typeof value === "string" ? value.trim() : "");

function parsePrice(raw, label) {
  const text = asString(raw);
  if (!text) return { value: null };
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0) return { error: `${label} không hợp lệ.` };
  return { value };
}

function parseDate(raw, label) {
  const text = asString(raw);
  if (!text) return { value: "" };
  if (!DATE_PATTERN.test(text) || Number.isNaN(Date.parse(text))) return { error: `${label} không hợp lệ.` };
  return { value: text };
}

/**
 * Tìm kiếm theo từ khóa (tên, địa điểm, tỉnh) + lọc khoảng giá + lọc ngày khởi hành.
 * query: { q, minPrice, maxPrice, from, to, sort } (đều là chuỗi, có thể bỏ trống)
 * Trả về { error } nếu tham số sai, hoặc { tours } nếu hợp lệ.
 */
export function searchTours(query = {}) {
  const keyword = asString(query.q);
  if (keyword.length > 100) return { error: "Từ khóa quá dài (tối đa 100 ký tự)." };

  const min = parsePrice(query.minPrice, "Giá tối thiểu");
  const max = parsePrice(query.maxPrice, "Giá tối đa");
  const from = parseDate(query.from, "Ngày bắt đầu");
  const to = parseDate(query.to, "Ngày kết thúc");
  const failure = min.error || max.error || from.error || to.error;
  if (failure) return { error: failure };
  if (min.value !== null && max.value !== null && min.value > max.value) {
    return { error: "Giá tối thiểu không được lớn hơn giá tối đa." };
  }
  if (from.value && to.value && from.value > to.value) {
    return { error: "Ngày bắt đầu không được sau ngày kết thúc." };
  }

  const sort = SORTS.has(asString(query.sort)) ? asString(query.sort) : "default";
  const tokens = normalizeText(keyword).split(/\s+/).filter(Boolean);
  const hasDateFilter = Boolean(from.value || to.value);

  const results = tours
    .map((tour) => ({
      ...tour,
      matchedDepartures: tour.departures.filter(
        (date) => (!from.value || date >= from.value) && (!to.value || date <= to.value),
      ),
    }))
    .filter((tour) => {
      // Mọi từ khóa đều phải xuất hiện trong tên / địa điểm / tỉnh
      const haystack = normalizeText(`${tour.name} ${tour.place} ${tour.region}`);
      if (!tokens.every((token) => haystack.includes(token))) return false;
      if (min.value !== null && tour.price < min.value) return false;
      if (max.value !== null && tour.price > max.value) return false;
      if (hasDateFilter && tour.matchedDepartures.length === 0) return false;
      return true;
    });

  if (sort === "price-asc") results.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") results.sort((a, b) => b.price - a.price);
  if (sort === "date-asc") results.sort((a, b) => a.matchedDepartures[0].localeCompare(b.matchedDepartures[0]));

  return { tours: results };
}
