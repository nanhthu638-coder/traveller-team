// ===== Đặt tour: chọn số lượng khách → kiểm tra chỗ trống → nhập thông tin hành khách → tạo đơn =====
// Dùng ở trang chi tiết tour (src/tour-detail.js). Server luôn kiểm tra lại mọi thứ (server/availability.js, server/passengers.js);
// phần kiểm tra ở đây chỉ để báo lỗi sớm cho người dùng.
import { escapeHtml, formatDate, formatPrice, redirectToLogin } from "./booking-format.js";

const CHILD_RATE = 0.7; // cùng công thức với server/bookings.js
const TYPE_ORDER = ["adult", "child", "infant"];
// Quy ước độ tuổi tính tại ngày khởi hành (giống server/passengers.js)
const AGE_RULES = {
  adult: { label: "Người lớn", min: 12, max: Infinity, text: "từ 12 tuổi trở lên" },
  child: { label: "Trẻ em", min: 2, max: 11, text: "từ 2 đến dưới 12 tuổi" },
  infant: { label: "Em bé", min: 0, max: 1, text: "dưới 2 tuổi" },
};
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;
const ID_PATTERN = /^[A-Za-z0-9]{6,20}$/;

export const todayInVietnam = () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
/** Chỗ một đơn chiếm: người lớn + trẻ em (em bé không chiếm chỗ). */
export const seatsOf = (passengers) => passengers.adult + passengers.child;

function ageOn(dob, onDate) {
  const [by, bm, bd] = dob.split("-").map(Number);
  const [y, m, d] = onDate.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

/** Lấy tình trạng chỗ của tour từ API. Trả về Map(ngày → { capacity, booked, remaining }) hoặc null nếu lỗi. */
export async function fetchAvailability(tourId) {
  try {
    const response = await fetch(`/api/tours/${encodeURIComponent(tourId)}/availability`, { cache: "no-store" });
    if (!response.ok) return null;
    const { departures = [] } = await response.json();
    return new Map(departures.map((slot) => [slot.date, slot]));
  } catch {
    return null;
  }
}

/** HTML các <option> ngày khởi hành kèm số chỗ còn lại; ngày hết chỗ bị vô hiệu hóa. */
export function departureOptions(tour, availability, selected = "") {
  const dates = tour.departures.filter((date) => date >= todayInVietnam());
  if (!dates.length) return { html: '<option value="">Hiện chưa có ngày khởi hành</option>', canBook: false, selected: "" };
  const isOpen = (date) => !availability?.get(date) || availability.get(date).remaining > 0;
  const chosen = isOpen(selected) && dates.includes(selected) ? selected : dates.find(isOpen) || "";
  const html = dates.map((date) => {
    const slot = availability?.get(date);
    const label = slot ? (slot.remaining === 0 ? " · Hết chỗ" : ` · còn ${slot.remaining} chỗ`) : "";
    return `<option value="${date}"${isOpen(date) ? "" : " disabled"}${date === chosen ? " selected" : ""}>${formatDate(date)}${label}</option>`;
  }).join("");
  return { html, canBook: Boolean(chosen), selected: chosen };
}

export function initBooking({ page, tour, user, availability: initialAvailability }) {
  let availability = initialAvailability;
  const state = { passengers: [], phone: "", note: "" }; // giữ dữ liệu đã nhập khi đóng/mở lại hộp thoại

  const $ = (selector) => page.querySelector(selector);
  const dateSelect = $(".booking-date");
  const continueButton = $("[data-booking-continue]");
  const continueLabel = $("[data-booking-label]");
  const errorBox = $("[data-booking-error]");
  const availabilityNote = $("[data-availability]");
  const countOf = (role) => Math.max(0, Math.floor(Number($(`[data-role="${role}"]`).value || 0)));
  const guests = () => ({ adult: countOf("adult"), child: countOf("child"), infant: countOf("infant") });
  const totalOf = (passengers) => passengers.adult * tour.price + passengers.child * tour.price * CHILD_RATE;
  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  // ----- Chỗ trống -----
  function shortageMessage(slot, seats) {
    return slot.remaining === 0
      ? "Ngày khởi hành này đã hết chỗ. Vui lòng chọn ngày khác."
      : `Chỉ còn ${slot.remaining} chỗ, bạn đang chọn ${seats} chỗ. Vui lòng giảm số khách hoặc chọn ngày khác.`;
  }

  function updateAvailabilityNote() {
    const slot = availability?.get(dateSelect.value);
    const seats = seatsOf(guests());
    let tone = "is-muted";
    let text = "";
    if (!dateSelect.value) {
      text = tour.departures.some((date) => date >= todayInVietnam()) ? "Tất cả ngày khởi hành hiện đều đã hết chỗ." : "";
      tone = "is-warn";
    } else if (!slot) {
      text = "Hệ thống sẽ kiểm tra chỗ trống khi bạn bấm tiếp tục.";
    } else if (seats > slot.remaining) {
      text = shortageMessage(slot, seats);
      tone = "is-warn";
    } else {
      text = `Còn ${slot.remaining}/${slot.capacity} chỗ · bạn chọn ${seats} chỗ (em bé không chiếm chỗ).`;
      tone = "is-ok";
    }
    availabilityNote.textContent = text;
    availabilityNote.className = `availability-note ${tone}`;
    availabilityNote.hidden = !text;
    continueButton.disabled = !dateSelect.value || Boolean(slot && seats > slot.remaining);
  }

  /** Hỏi lại server số chỗ mới nhất, cập nhật danh sách ngày + ghi chú. */
  async function refreshAvailability() {
    const fresh = await fetchAvailability(tour.id);
    if (!fresh) return false;
    availability = fresh;
    const picker = departureOptions(tour, availability, dateSelect.value);
    dateSelect.innerHTML = picker.html;
    dateSelect.value = picker.selected;
    updateAvailabilityNote();
    return true;
  }

  dateSelect.addEventListener("change", () => {
    showError("");
    updateAvailabilityNote();
  });
  // Các ô số lượng khách đã được tour-detail.js cập nhật trước (đăng ký trước), ở đây chỉ cập nhật ghi chú chỗ trống
  page.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => { showError(""); updateAvailabilityNote(); }));
  page.querySelectorAll("input[data-role]").forEach((input) => input.addEventListener("input", () => { showError(""); updateAvailabilityNote(); }));
  updateAvailabilityNote();

  // ----- Hộp thoại nhập thông tin hành khách -----
  const dialog = document.createElement("dialog");
  dialog.className = "pax-dialog";
  dialog.setAttribute("aria-labelledby", "pax-title");
  page.append(dialog);

  const typeList = (passengers) => TYPE_ORDER.flatMap((type) => Array.from({ length: passengers[type] }, () => type));

  function passengerCard(type, index, saved) {
    const rule = AGE_RULES[type];
    const value = (key) => escapeHtml(saved?.[key] ?? "");
    const genderOptions = [["", "Chọn giới tính"], ["male", "Nam"], ["female", "Nữ"], ["other", "Khác"]]
      .map(([key, label]) => `<option value="${key}"${saved?.gender === key ? " selected" : ""}>${label}</option>`).join("");
    return `
      <fieldset class="pax-card" data-pax data-type="${type}">
        <legend>Hành khách ${index + 1} · ${rule.label} <small>(${rule.text})</small></legend>
        <div class="pax-grid">
          <label class="pax-wide">Họ và tên<input class="booking-input" data-pax-field="fullName" type="text" maxlength="80" autocomplete="off" placeholder="Nhập đúng như trên giấy tờ tùy thân" value="${value("fullName")}" /></label>
          <label>Giới tính<select class="booking-input" data-pax-field="gender">${genderOptions}</select></label>
          <label>Ngày sinh<input class="booking-input" data-pax-field="dob" type="date" min="1900-01-01" max="${todayInVietnam()}" value="${value("dob")}" /></label>
          <label class="pax-wide">Số CCCD / hộ chiếu <small>(không bắt buộc)</small><input class="booking-input" data-pax-field="idNumber" type="text" maxlength="20" autocomplete="off" value="${value("idNumber")}" /></label>
        </div>
      </fieldset>`;
  }

  function buildDialog(passengers, departureDate) {
    const types = typeList(passengers);
    const guestText = [["adult", "người lớn"], ["child", "trẻ em"], ["infant", "em bé"]]
      .filter(([key]) => passengers[key]).map(([key, label]) => `${passengers[key]} ${label}`).join(" · ");
    const cards = types.map((type, index) => {
      const saved = state.passengers[index]?.type === type ? state.passengers[index] : index === 0 && !state.passengers[0] ? { fullName: user?.name || "" } : null;
      return passengerCard(type, index, saved);
    }).join("");
    dialog.innerHTML = `
      <form class="pax-form" novalidate>
        <header class="pax-head">
          <div>
            <h2 id="pax-title" class="font-display">Thông tin hành khách</h2>
            <p>${escapeHtml(tour.name)}<br />Khởi hành ${formatDate(departureDate)} · ${guestText} · <strong>${formatPrice(totalOf(passengers))}</strong></p>
          </div>
          <button class="pax-close" type="button" data-pax-close aria-label="Đóng">×</button>
        </header>
        <div class="pax-body">
          ${cards}
          <fieldset class="pax-card">
            <legend>Liên hệ</legend>
            <div class="pax-grid">
              <label class="pax-wide">Số điện thoại liên hệ <small>(không bắt buộc)</small><input class="booking-input" data-field="phone" type="tel" inputmode="tel" maxlength="20" placeholder="Ví dụ: 0901 234 567" autocomplete="tel" value="${escapeHtml(state.phone)}" /></label>
              <label class="pax-wide">Ghi chú<textarea class="booking-input" data-field="note" rows="3" maxlength="500" placeholder="Yêu cầu đặc biệt: ăn chay, xếp phòng gần nhau...">${escapeHtml(state.note)}</textarea></label>
            </div>
          </fieldset>
        </div>
        <footer class="pax-foot">
          <p class="booking-error" data-pax-error role="alert" hidden></p>
          <div class="pax-actions">
            <button class="secondary-cta" type="button" data-pax-close>Quay lại</button>
            <button class="submit-button" type="submit" data-pax-submit><span data-pax-submit-label>Xác nhận đặt tour</span> <span aria-hidden="true">↗</span></button>
          </div>
        </footer>
      </form>`;
  }

  function captureForm() {
    state.passengers = Array.from(dialog.querySelectorAll("[data-pax]")).map((card) => {
      const read = (key) => card.querySelector(`[data-pax-field="${key}"]`).value.trim();
      return { type: card.dataset.type, fullName: read("fullName"), gender: read("gender"), dob: read("dob"), idNumber: read("idNumber") };
    });
    state.phone = dialog.querySelector('[data-field="phone"]')?.value.trim() ?? state.phone;
    state.note = dialog.querySelector('[data-field="note"]')?.value.trim() ?? state.note;
  }

  /** Trả về { message, field } cho lỗi đầu tiên, hoặc null nếu hợp lệ. */
  function validatePassengers(departureDate) {
    const cards = Array.from(dialog.querySelectorAll("[data-pax]"));
    for (const [index, card] of cards.entries()) {
      const item = state.passengers[index];
      const label = `Hành khách ${index + 1}`;
      const field = (key) => card.querySelector(`[data-pax-field="${key}"]`);
      const rule = AGE_RULES[item.type];
      if (item.fullName.length < 2 || item.fullName.length > 80 || !NAME_PATTERN.test(item.fullName)) {
        return { message: `${label}: vui lòng nhập họ và tên hợp lệ (không chứa số hoặc ký tự đặc biệt).`, field: field("fullName") };
      }
      if (!item.gender) return { message: `${label}: vui lòng chọn giới tính.`, field: field("gender") };
      if (!item.dob) return { message: `${label}: vui lòng nhập ngày sinh.`, field: field("dob") };
      if (item.dob > todayInVietnam()) return { message: `${label}: ngày sinh không được ở tương lai.`, field: field("dob") };
      const age = ageOn(item.dob, departureDate);
      if (age < rule.min || age > rule.max) {
        return { message: `${label} (${rule.label}) phải ${rule.text} tính đến ngày khởi hành ${formatDate(departureDate)}.`, field: field("dob") };
      }
      if (item.idNumber && !ID_PATTERN.test(item.idNumber)) return { message: `${label}: số CCCD/hộ chiếu chỉ gồm chữ và số (6–20 ký tự).`, field: field("idNumber") };
    }
    if (state.phone && !/^[0-9+\s().-]{8,20}$/.test(state.phone)) {
      return { message: "Số điện thoại không hợp lệ.", field: dialog.querySelector('[data-field="phone"]') };
    }
    return null;
  }

  dialog.addEventListener("input", captureForm);
  dialog.addEventListener("change", captureForm);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.closest("[data-pax-close]")) dialog.close();
  });
  dialog.addEventListener("submit", async (event) => {
    event.preventDefault();
    const paxError = dialog.querySelector("[data-pax-error]");
    const submit = dialog.querySelector("[data-pax-submit]");
    const submitLabel = dialog.querySelector("[data-pax-submit-label]");
    const setError = (message) => {
      paxError.textContent = message;
      paxError.hidden = !message;
    };
    setError("");
    captureForm();
    const departureDate = dateSelect.value;
    const problem = validatePassengers(departureDate);
    if (problem) {
      setError(problem.message);
      problem.field?.focus();
      return;
    }

    submit.disabled = true; // tránh bấm đúp tạo 2 đơn
    submitLabel.textContent = "Đang đặt tour...";
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: tour.id,
          departureDate,
          passengers: guests(),
          passengerDetails: state.passengers.map(({ type, fullName, gender, dob, idNumber }) => ({ type, fullName, gender, dob, idNumber })),
          phone: state.phone,
          note: state.note,
        }),
      });
      if (response.status === 401) return redirectToLogin();
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409) refreshAvailability(); // hết chỗ trong lúc nhập → cập nhật số chỗ mới nhất
        throw new Error(data.error || "Không thể đặt tour. Vui lòng thử lại.");
      }
      window.location.assign(`/booking-detail.html?id=${encodeURIComponent(data.booking.id)}&created=1`);
    } catch (error) {
      setError(error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error.message);
      submit.disabled = false;
      submitLabel.textContent = "Xác nhận đặt tour";
    }
  });

  // ----- Bước 1: kiểm tra chỗ trống rồi mở hộp thoại -----
  continueButton.addEventListener("click", async () => {
    showError("");
    const passengers = guests();
    if (!dateSelect.value) return showError("Vui lòng chọn ngày khởi hành.");
    if (passengers.adult < 1) return showError("Cần ít nhất 1 người lớn để đặt tour.");

    continueButton.disabled = true;
    continueLabel.textContent = "Đang kiểm tra chỗ trống...";
    try {
      await refreshAvailability(); // luôn lấy số chỗ mới nhất từ server trước khi cho nhập thông tin
      const slot = availability?.get(dateSelect.value);
      const seats = seatsOf(passengers);
      if (!dateSelect.value) return showError("Tất cả ngày khởi hành hiện đều đã hết chỗ.");
      if (slot && seats > slot.remaining) return showError(shortageMessage(slot, seats));
      buildDialog(passengers, dateSelect.value);
      dialog.showModal();
    } finally {
      continueLabel.textContent = "Tiếp tục nhập thông tin hành khách";
      updateAvailabilityNote(); // bật/tắt lại nút theo số chỗ mới nhất
    }
  });
}
