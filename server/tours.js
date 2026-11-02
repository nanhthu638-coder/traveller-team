// ===== Dữ liệu tour + tìm kiếm/lọc (Story: Xem trang chủ, Tìm kiếm, Lọc tour, Quản lý Tour) =====
// - price: số nguyên (VND)
// - departures: ngày khởi hành dạng ISO "YYYY-MM-DD"
// - maxGuests: số lượng khách tối đa
// - itinerary: lịch trình chi tiết theo ngày
// - status: "active" | "inactive"

export const DEFAULT_TOURS = [
  {
    id: "ha-long-3n2d",
    name: "Vịnh Hạ Long · 3 ngày 2 đêm",
    place: "Hạ Long",
    region: "Quảng Ninh",
    duration: "3 ngày 2 đêm",
    price: 3490000,
    image: "photo-1528127269322-539801943592",
    departures: ["2026-10-18", "2026-11-01", "2026-11-15"],
    maxGuests: 30,
    itinerary: "Ngày 1: Hà Nội - Vịnh Hạ Long - Thăm hang Sửng Sốt\nNgày 2: Đảo Ti Tốp - Chèo thuyền Kayak vịnh Lan Hạ\nNgày 3: Làng chài Ba Hang - Mua sắm đặc sản - Trở về Hà Nội",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "hoi-an-2n1d",
    name: "Phố cổ Hội An · 2 ngày 1 đêm",
    place: "Hội An",
    region: "Quảng Nam",
    duration: "2 ngày 1 đêm",
    price: 2150000,
    image: "photo-1531058020387-3be344556be6",
    departures: ["2026-10-22", "2026-11-05", "2026-11-19"],
    maxGuests: 25,
    itinerary: "Ngày 1: Khám phá Phố cổ Hội An - Chùa Cầu - Thả đèn hoa đăng sông Hoài\nNgày 2: Rừng dừa Bảy Mẫu - Trải nghiệm chèo thuyền thúng - Kết thúc tour",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "ta-xua-2n1d",
    name: "Tà Xùa săn mây · 2 ngày 1 đêm",
    place: "Bắc Yên",
    region: "Sơn La",
    duration: "2 ngày 1 đêm",
    price: 1890000,
    image: "photo-1470770841072-f978cf4d019e",
    departures: ["2026-10-25", "2026-11-08", "2026-12-06"],
    maxGuests: 20,
    itinerary: "Ngày 1: Khởi hành lên Tà Xùa - Check-in sống lưng Khủng Long Háng Đồng\nNgày 2: Săn mây đỉnh Gió - Thưởng thức cafe mây - Trở về",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "ha-giang-4n3d",
    name: "Hà Giang · Mã Pí Lèng · 4 ngày 3 đêm",
    place: "Hà Giang",
    region: "Hà Giang",
    duration: "4 ngày 3 đêm",
    price: 4290000,
    image: "photo-1519681393784-d120267933ba",
    departures: ["2026-10-30", "2026-11-13", "2026-11-27"],
    maxGuests: 20,
    itinerary: "Ngày 1: Hà Nội - Hà Giang - Cột mốc số 0 - Quản Bạ Núi Đôi\nNgày 2: Rừng thông Yên Minh - Nhà của Pao - Dinh họ Vương - Đồng Văn\nNgày 3: Đèo Mã Pí Lèng - Du thuyền sông Nho Quế - Hẻm Tu Sản - Mèo Vạc\nNgày 4: Mèo Vạc - TP Hà Giang - Trở về Hà Nội",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "phu-quoc-4n3d",
    name: "Phú Quốc · Đảo ngọc nghỉ dưỡng · 4 ngày 3 đêm",
    place: "Phú Quốc",
    region: "Kiên Giang",
    duration: "4 ngày 3 đêm",
    price: 6890000,
    image: "photo-1500375592092-40eb2168fd21",
    departures: ["2026-11-10", "2026-12-01", "2026-12-20"],
    maxGuests: 35,
    itinerary: "Ngày 1: Đáp sân bay Phú Quốc - Check-in resort - Dạo Chợ đêm Grand World\nNgày 2: Tour 4 đảo cáp treo Hòn Thơm - Lặn ngắm san hô - Sunset Sanato\nNgày 3: VinWonders & Safari Phú Quốc - Trình diễn nhạc nước\nNgày 4: Cơ sở ngọc trai - Vườn tiêu - Mua đặc sản - Tiễn sân bay",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "da-lat-3n2d",
    name: "Đà Lạt · Thành phố ngàn hoa · 3 ngày 2 đêm",
    place: "Đà Lạt",
    region: "Lâm Đồng",
    duration: "3 ngày 2 đêm",
    price: 2790000,
    image: "photo-1500530855697-b586d89ba3ee",
    departures: ["2026-10-17", "2026-11-07", "2026-12-12"],
    maxGuests: 30,
    itinerary: "Ngày 1: Đón khách tại Đà Lạt - Quảng trường Lâm Viên - Ga Đà Lạt - Chợ đêm\nNgày 2: Đồi chè Cầu Đất săn mây - Puppy Farm - Thác Datanla máng trượt\nNgày 3: Thiền viện Trúc Lâm - Hồ Tuyền Lâm - Tiễn đoàn",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "sa-pa-3n2d",
    name: "Sa Pa · Fansipan & bản làng · 3 ngày 2 đêm",
    place: "Sa Pa",
    region: "Lào Cai",
    duration: "3 ngày 2 đêm",
    price: 3190000,
    image: "photo-1501785888041-af3ef285b470",
    departures: ["2026-10-24", "2026-11-14", "2026-12-05"],
    maxGuests: 25,
    itinerary: "Ngày 1: Hà Nội - Sa Pa - Bản Cát Cát - Thác Tiên Sa\nNgày 2: Chinh phục đỉnh Fansipan Nóc nhà Đông Dương - Moana Sa Pa\nNgày 3: Nhà thờ đá Sa Pa - Chợ phiên - Trở về Hà Nội",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "con-dao-3n2d",
    name: "Côn Đảo · Hành trình tâm linh · 3 ngày 2 đêm",
    place: "Côn Đảo",
    region: "Bà Rịa - Vũng Tàu",
    duration: "3 ngày 2 đêm",
    price: 5490000,
    image: "photo-1519046904884-53103b34b206",
    departures: ["2026-11-20", "2026-12-10", "2026-12-27"],
    maxGuests: 20,
    itinerary: "Ngày 1: Bay đến Côn Đảo - Miếu Bà Phi Yến - Bãi Nhát - Đỉnh Tình Yêu\nNgày 2: Viếng Nghĩa trang Hàng Dương mộ Cô Sáu - Trại giam Phú Hải - Chuồng Cọp\nNgày 3: Bãi biển Đầm Trầu - Chùa Núi Một - Tiễn sân bay",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "hue-da-nang-4n3d",
    name: "Huế – Đà Nẵng · Di sản miền Trung · 4 ngày 3 đêm",
    place: "Huế",
    region: "Thừa Thiên Huế",
    duration: "4 ngày 3 đêm",
    price: 4650000,
    image: "photo-1523906834658-6e24ef2386f9",
    departures: ["2026-10-28", "2026-11-25", "2026-12-15"],
    maxGuests: 25,
    itinerary: "Ngày 1: Huế - Đại Nội Kinh thành Huế - Chùa Thiên Mụ - Ca Huế sông Hương\nNgày 2: Lăng Khải Định - Đèo Hải Vân - Đà Nẵng - Biển Mỹ Khê\nNgày 3: Bà Nà Hills - Cầu Vàng Bàn tay Phật - Phố cổ Hội An\nNgày 4: Bán đảo Sơn Trà - Chùa Linh Ứng - Chợ Cồn - Tiễn sân bay",
    status: "active",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
];

export const tours = DEFAULT_TOURS;

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
 * query: { q, minPrice, maxPrice, from, to, sort }
 * sourceTours: danh sách tours truyền vào (mặc định là DEFAULT_TOURS)
 */
export function searchTours(query = {}, sourceTours = DEFAULT_TOURS) {
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

  const results = (sourceTours || DEFAULT_TOURS)
    .map((tour) => ({
      ...tour,
      matchedDepartures: (tour.departures || []).filter(
        (date) => (!from.value || date >= from.value) && (!to.value || date <= to.value),
      ),
    }))
    .filter((tour) => {
      // Mọi từ khóa đều phải xuất hiện trong tên / địa điểm / tỉnh
      const haystack = normalizeText(`${tour.name || ""} ${tour.place || ""} ${tour.region || ""}`);
      if (!tokens.every((token) => haystack.includes(token))) return false;
      if (min.value !== null && tour.price < min.value) return false;
      if (max.value !== null && tour.price > max.value) return false;
      if (hasDateFilter && tour.matchedDepartures.length === 0) return false;
      return true;
    });

  if (sort === "price-asc") results.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") results.sort((a, b) => b.price - a.price);
  if (sort === "date-asc") results.sort((a, b) => (a.matchedDepartures[0] || "").localeCompare(b.matchedDepartures[0] || ""));

  return { tours: results };
}
