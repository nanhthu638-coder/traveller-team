// ===== Thông tin hành khách (Story: Nhập thông tin hành khách) =====
// Mỗi hành khách: { type: adult|child|infant, fullName, gender: male|female|other, dob: "YYYY-MM-DD", idNumber? }
// Độ tuổi được tính tại NGÀY KHỞI HÀNH. Quy ước: em bé dưới 2 tuổi, trẻ em từ 2 đến dưới 12 tuổi, người lớn từ 12 tuổi.
export const AGE_RULES = {
  adult: { label: "Người lớn", min: 12, max: Infinity, text: "từ 12 tuổi trở lên" },
  child: { label: "Trẻ em", min: 2, max: 11, text: "từ 2 đến dưới 12 tuổi" },
  infant: { label: "Em bé", min: 0, max: 1, text: "dưới 2 tuổi" },
};
export const GENDERS = ["male", "female", "other"];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;
const ID_PATTERN = /^[A-Za-z0-9]{6,20}$/;

function isRealDate(value) {
  return DATE_PATTERN.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

/** Tuổi (số năm tròn) của người sinh ngày `dob` tại ngày `onDate` (cả hai dạng YYYY-MM-DD). */
export function ageOn(dob, onDate) {
  const [by, bm, bd] = dob.split("-").map(Number);
  const [y, m, d] = onDate.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

/**
 * Kiểm tra danh sách hành khách khớp với số lượng khách đã chọn.
 * Trả về { passengerDetails } (đã chuẩn hóa) hoặc { error } bằng tiếng Việt.
 */
export function parsePassengerDetails(raw, passengers, departureDate, today) {
  const total = passengers.adult + passengers.child + passengers.infant;
  if (!Array.isArray(raw) || raw.length !== total) return { error: `Vui lòng nhập đủ thông tin cho ${total} hành khách.` };

  const counts = { adult: 0, child: 0, infant: 0 };
  const passengerDetails = [];
  for (const [index, item] of raw.entries()) {
    const label = `Hành khách ${index + 1}`;
    const type = item?.type;
    if (!AGE_RULES[type]) return { error: `${label}: loại khách không hợp lệ.` };
    counts[type] += 1;

    const fullName = typeof item.fullName === "string" ? item.fullName.trim().replace(/\s+/g, " ") : "";
    if (fullName.length < 2 || fullName.length > 80 || !NAME_PATTERN.test(fullName)) {
      return { error: `${label}: vui lòng nhập họ và tên hợp lệ (2–80 ký tự, không chứa số hoặc ký tự đặc biệt).` };
    }
    if (!GENDERS.includes(item.gender)) return { error: `${label}: vui lòng chọn giới tính.` };

    const dob = typeof item.dob === "string" ? item.dob.trim() : "";
    if (!isRealDate(dob)) return { error: `${label}: ngày sinh không hợp lệ.` };
    if (dob > today) return { error: `${label}: ngày sinh không được ở tương lai.` };
    const age = ageOn(dob, departureDate);
    const rule = AGE_RULES[type];
    if (age < rule.min || age > rule.max) {
      return { error: `${label} (${rule.label}) phải ${rule.text} tính đến ngày khởi hành.` };
    }

    const idNumber = typeof item.idNumber === "string" ? item.idNumber.trim() : "";
    if (idNumber && !ID_PATTERN.test(idNumber)) return { error: `${label}: số CCCD/hộ chiếu chỉ gồm chữ và số (6–20 ký tự).` };

    passengerDetails.push({ type, fullName, gender: item.gender, dob, ...(idNumber ? { idNumber } : {}) });
  }
  for (const key of Object.keys(counts)) {
    if (counts[key] !== passengers[key]) return { error: "Danh sách hành khách không khớp với số lượng khách đã chọn." };
  }
  return { passengerDetails };
}
