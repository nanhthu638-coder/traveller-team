// Trang quản trị – "Quản lý Lịch trình chi tiết & Hình ảnh Tour".
// API: GET/PUT/DELETE /api/admin/tours/:id/itinerary, GET /api/admin/tours/:id/content,
//      POST/PUT(order)/DELETE /api/admin/tours/:id/images
import { escapeHtml } from "./booking-format.js";
import { fileToJpegDataUrl } from "./image-compress.js";

const MEALS = [["breakfast", "Sáng"], ["lunch", "Trưa"], ["dinner", "Tối"]];
const UPLOAD_BATCH = 4; // khớp MAX_UPLOAD_PER_REQUEST ở server

export function initTourContentAdmin({ tours, requestJson }) {
  const select = document.getElementById("admin-content-tour");
  const editor = document.getElementById("admin-content-editor");
  const message = document.getElementById("admin-content-message");
  let content = null;
  let dirty = false;
  let busy = false;

  select.insertAdjacentHTML("beforeend", tours.map((tour) => `<option value="${escapeHtml(tour.id)}">${escapeHtml(tour.name)}</option>`).join(""));

  const send = (url, method, body) => requestJson(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const base = () => `/api/admin/tours/${encodeURIComponent(content.tour.id)}`;

  function setMessage(text, isError = false) {
    message.textContent = text;
    message.className = `admin-inline-status${isError ? " is-error" : ""}`;
    message.hidden = !text;
  }
  const fail = (error) => setMessage(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);

  // Không đụng tới thuộc tính `disabled` của từng nút (một số nút cố ý bị vô hiệu, ví dụ "↑" của ngày đầu tiên);
  // trong lúc xử lý, CSS chặn thao tác chuột và các handler bên dưới bỏ qua nếu `busy`.
  function setBusy(value) {
    busy = value;
    editor.classList.toggle("is-busy", value);
    editor.setAttribute("aria-busy", String(value));
    select.disabled = value;
  }

  // ----- Lịch trình -----
  function dayFieldset(day, index, total) {
    return `
      <fieldset class="admin-day" data-day-index="${index}">
        <legend>Ngày ${index + 1}</legend>
        <div class="admin-day-tools">
          <button class="admin-secondary-button" type="button" data-day-action="up" ${index === 0 ? "disabled" : ""} aria-label="Chuyển ngày ${index + 1} lên trên">↑</button>
          <button class="admin-secondary-button" type="button" data-day-action="down" ${index === total - 1 ? "disabled" : ""} aria-label="Chuyển ngày ${index + 1} xuống dưới">↓</button>
          <button class="admin-danger-button" type="button" data-day-action="remove" ${total === 1 ? "disabled" : ""}>Xóa ngày</button>
        </div>
        <label>Tiêu đề<input data-field="title" maxlength="120" required value="${escapeHtml(day.title)}" /></label>
        <label>Mô tả hoạt động<textarea data-field="description" rows="4" maxlength="1500" required>${escapeHtml(day.description)}</textarea></label>
        <div class="admin-day-extra">
          <div class="admin-meals"><span>Bữa ăn bao gồm</span>${MEALS.map(([key, label]) => `<label class="admin-check"><input type="checkbox" data-meal="${key}" ${day.meals?.includes(key) ? "checked" : ""} />${label}</label>`).join("")}</div>
          <label>Lưu trú<input data-field="stay" maxlength="120" placeholder="Ví dụ: Khách sạn 4 sao tại trung tâm" value="${escapeHtml(day.stay || "")}" /></label>
        </div>
      </fieldset>`;
  }

  function renderItinerary(itinerary) {
    const list = editor.querySelector("[data-itinerary-list]");
    list.innerHTML = itinerary.map((day, index) => dayFieldset(day, index, itinerary.length)).join("");
    editor.querySelector("[data-add-day]").disabled = itinerary.length >= 14;
  }

  function collectItinerary() {
    return [...editor.querySelectorAll(".admin-day")].map((fieldset) => ({
      title: fieldset.querySelector('[data-field="title"]').value,
      description: fieldset.querySelector('[data-field="description"]').value,
      stay: fieldset.querySelector('[data-field="stay"]').value,
      meals: [...fieldset.querySelectorAll("[data-meal]:checked")].map((input) => input.dataset.meal),
    }));
  }

  // ----- Hình ảnh -----
  function renderImages(images) {
    const grid = editor.querySelector("[data-image-grid]");
    editor.querySelector("[data-image-count]").textContent = `${images.length} / ${content.maxImages} ảnh`;
    editor.querySelector("[data-image-input]").disabled = images.length >= content.maxImages;
    grid.innerHTML = images.length ? images.map((image, index) => `
      <figure class="admin-thumb" data-file="${escapeHtml(image.file)}">
        <img src="${escapeHtml(image.url)}" alt="Ảnh ${index + 1} của tour" loading="lazy" />
        ${index === 0 ? '<span class="admin-thumb-badge">Ảnh bìa</span>' : ""}
        <figcaption>
          ${index > 0 ? '<button class="admin-secondary-button" type="button" data-image-action="cover">Đặt làm ảnh bìa</button>' : ""}
          <button class="admin-secondary-button" type="button" data-image-action="left" ${index === 0 ? "disabled" : ""} aria-label="Dịch ảnh sang trái">←</button>
          <button class="admin-secondary-button" type="button" data-image-action="right" ${index === images.length - 1 ? "disabled" : ""} aria-label="Dịch ảnh sang phải">→</button>
          <button class="admin-danger-button" type="button" data-image-action="delete">Xóa</button>
        </figcaption>
      </figure>`).join("") : '<p class="admin-empty">Tour này chưa có ảnh tải lên — trang khách đang dùng ảnh mặc định.</p>';
  }

  function renderEditor() {
    editor.innerHTML = `
      <div class="admin-content-grid">
        <section class="admin-subpanel" aria-labelledby="admin-itinerary-title">
          <div class="admin-subhead">
            <div><h3 id="admin-itinerary-title">Lịch trình chi tiết</h3>
              <p>${content.isDefaultItinerary ? "Đang dùng lịch trình mặc định — chỉnh sửa rồi lưu để áp dụng cho khách." : "Lịch trình đã được tùy chỉnh và hiển thị ở trang chi tiết tour."}</p></div>
          </div>
          <div class="admin-day-list" data-itinerary-list></div>
          <div class="admin-card-actions">
            <button class="admin-secondary-button" type="button" data-add-day>+ Thêm ngày</button>
            <button class="admin-primary-button" type="button" data-save-itinerary>Lưu lịch trình</button>
            <button class="admin-danger-button" type="button" data-reset-itinerary ${content.isDefaultItinerary ? "disabled" : ""}>Khôi phục mặc định</button>
          </div>
        </section>
        <section class="admin-subpanel" aria-labelledby="admin-images-title">
          <div class="admin-subhead">
            <div><h3 id="admin-images-title">Hình ảnh tour</h3>
              <p>Ảnh đầu tiên là ảnh bìa ở trang chi tiết. Ảnh JPG, PNG hoặc WebP được tự động nén trước khi tải lên.</p></div>
            <span class="admin-badge" data-image-count></span>
          </div>
          <label class="admin-upload">
            <span>Chọn ảnh để tải lên</span>
            <input type="file" accept="image/*" multiple data-image-input />
          </label>
          <div class="admin-thumb-grid" data-image-grid></div>
        </section>
      </div>`;
    renderItinerary(content.itinerary);
    renderImages(content.images);
    dirty = false;
  }

  function applyContent(data, { keepDirtyItinerary = false } = {}) {
    const pending = keepDirtyItinerary && dirty ? collectItinerary() : null;
    content = data;
    renderEditor();
    if (pending) {
      renderItinerary(pending);
      dirty = true;
    }
  }

  async function loadTour(tourId) {
    if (!tourId) {
      content = null;
      editor.innerHTML = '<p class="admin-empty">Chọn một tour để quản lý lịch trình và hình ảnh.</p>';
      setMessage("");
      return;
    }
    select.disabled = true;
    try {
      applyContent(await requestJson(`/api/admin/tours/${encodeURIComponent(tourId)}/content`));
      setMessage("");
    } catch (error) {
      fail(error);
    } finally {
      select.disabled = false;
    }
  }

  // ----- Sự kiện -----
  let selectedTour = "";
  select.addEventListener("change", () => {
    if (dirty && !window.confirm("Lịch trình đang sửa chưa được lưu. Bạn vẫn muốn chuyển sang tour khác?")) {
      select.value = selectedTour;
      return;
    }
    selectedTour = select.value;
    loadTour(selectedTour);
  });

  editor.addEventListener("input", (event) => {
    if (event.target.closest(".admin-day")) dirty = true;
  });

  editor.addEventListener("click", async (event) => {
    if (busy || !content) return;

    const dayButton = event.target.closest("[data-day-action]");
    if (dayButton) {
      const items = collectItinerary();
      const index = Number(dayButton.closest(".admin-day").dataset.dayIndex);
      const action = dayButton.dataset.dayAction;
      if (action === "remove") {
        if (!window.confirm(`Xóa Ngày ${index + 1} khỏi lịch trình?`)) return;
        items.splice(index, 1);
      } else {
        const target = action === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= items.length) return;
        [items[index], items[target]] = [items[target], items[index]];
      }
      renderItinerary(items);
      dirty = true;
      return;
    }

    if (event.target.closest("[data-add-day]")) {
      const items = collectItinerary();
      items.push({ title: "", description: "", meals: [], stay: "" });
      renderItinerary(items);
      dirty = true;
      editor.querySelector(".admin-day:last-child [data-field=\"title\"]")?.focus();
      return;
    }

    if (event.target.closest("[data-save-itinerary]")) {
      setBusy(true);
      try {
        applyContent(await send(`${base()}/itinerary`, "PUT", { itinerary: collectItinerary() }));
        setMessage("Đã lưu lịch trình. Khách sẽ thấy lịch trình mới ở trang chi tiết tour.");
      } catch (error) {
        fail(error);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (event.target.closest("[data-reset-itinerary]")) {
      if (!window.confirm("Khôi phục lịch trình mặc định? Nội dung đã chỉnh sửa sẽ bị xóa.")) return;
      setBusy(true);
      try {
        applyContent(await send(`${base()}/itinerary`, "DELETE"));
        setMessage("Đã khôi phục lịch trình mặc định.");
      } catch (error) {
        fail(error);
      } finally {
        setBusy(false);
      }
      return;
    }

    const imageButton = event.target.closest("[data-image-action]");
    if (imageButton) {
      const file = imageButton.closest("[data-file]").dataset.file;
      const files = content.images.map((image) => image.file);
      const index = files.indexOf(file);
      const action = imageButton.dataset.imageAction;
      setBusy(true);
      try {
        if (action === "delete") {
          if (!window.confirm("Xóa ảnh này khỏi tour?")) return;
          applyContent(await send(`${base()}/images/${encodeURIComponent(file)}`, "DELETE"), { keepDirtyItinerary: true });
          setMessage("Đã xóa ảnh.");
        } else {
          const order = [...files];
          order.splice(index, 1);
          const target = action === "cover" ? 0 : action === "left" ? index - 1 : index + 1;
          order.splice(target, 0, file);
          applyContent(await send(`${base()}/images/order`, "PUT", { order }), { keepDirtyItinerary: true });
          setMessage(action === "cover" ? "Đã đặt làm ảnh bìa." : "Đã đổi thứ tự ảnh.");
        }
      } catch (error) {
        fail(error);
      } finally {
        setBusy(false);
      }
    }
  });

  editor.addEventListener("change", async (event) => {
    const input = event.target.closest("[data-image-input]");
    if (!input || !content || busy || !input.files.length) return;
    const files = [...input.files];
    const room = content.maxImages - content.images.length;
    if (files.length > room) {
      input.value = "";
      setMessage(`Chỉ còn chỗ cho ${room} ảnh nữa (tối đa ${content.maxImages} ảnh mỗi tour).`, true);
      return;
    }
    setBusy(true);
    try {
      setMessage("Đang nén và tải ảnh lên...");
      const dataUrls = [];
      for (const file of files) dataUrls.push(await fileToJpegDataUrl(file));
      let latest = content;
      for (let start = 0; start < dataUrls.length; start += UPLOAD_BATCH) {
        latest = await send(`${base()}/images`, "POST", { images: dataUrls.slice(start, start + UPLOAD_BATCH) });
      }
      applyContent(latest, { keepDirtyItinerary: true });
      setMessage(`Đã tải lên ${files.length} ảnh.`);
    } catch (error) {
      fail(error);
      input.value = "";
    } finally {
      setBusy(false);
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (dirty) event.preventDefault();
  });
}
