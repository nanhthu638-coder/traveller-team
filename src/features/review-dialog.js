// Hộp thoại viết / sửa đánh giá tour. Dùng chung cho trang chi tiết tour và trang chi tiết đơn đặt tour.
import { escapeHtml } from "./booking-format.js";

const MAX_IMAGES = 3;
const MAX_SIDE = 1280; // cạnh dài tối đa sau khi nén (px)
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 1_300_000; // ~ 0,95 MB ảnh, dưới giới hạn 1 MB của server
const COMMENT_MIN = 10;
const COMMENT_MAX = 1000;
const RATING_TEXT = ["Chọn số sao", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

/** Nén ảnh về JPEG (thu nhỏ + giảm chất lượng dần) để gửi lên server nhẹ và đúng định dạng. */
async function fileToJpegDataUrl(file) {
  if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" không phải là ảnh.`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" quá lớn (tối đa 15 MB).`);

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`Không đọc được ảnh "${file.name}". Hãy chọn ảnh JPG, PNG hoặc WebP.`);
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff"; // nền trắng cho ảnh PNG trong suốt
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) throw new Error(`Ảnh "${file.name}" vẫn quá nặng sau khi nén. Vui lòng chọn ảnh khác.`);
  return dataUrl;
}

/**
 * Mở hộp thoại đánh giá.
 *  - Viết mới: { tourName, bookingId, onSaved }
 *  - Sửa:      { tourName, review, onSaved }
 */
export function openReviewDialog({ tourName, bookingId, review = null, onSaved }) {
  const isEdit = Boolean(review);
  const submitText = isEdit ? "Lưu thay đổi" : "Gửi đánh giá";
  const images = (review?.images || []).map((url) => ({ url })); // url ảnh cũ hoặc data URL ảnh mới
  let processing = 0;

  const dialog = document.createElement("dialog");
  dialog.className = "review-dialog";
  dialog.setAttribute("aria-labelledby", "review-dialog-title");
  dialog.innerHTML = `
    <form class="review-form" novalidate>
      <header class="review-form-head">
        <div>
          <p class="eyebrow eyebrow-dark"><span></span> ${isEdit ? "Chỉnh sửa đánh giá" : "Đánh giá tour"}</p>
          <h2 id="review-dialog-title" class="font-display">${escapeHtml(tourName)}</h2>
        </div>
        <button type="button" class="review-close" data-close aria-label="Đóng">×</button>
      </header>

      <fieldset class="star-input">
        <legend>Bạn chấm tour này mấy sao? <span class="required" aria-hidden="true">*</span></legend>
        <div class="star-row">
          ${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="review-star-${n}" value="${n}" /><label for="review-star-${n}" title="${n} sao"><span class="sr-only">${n} sao</span>★</label>`).join("")}
        </div>
        <p class="star-text" data-star-text aria-live="polite">${RATING_TEXT[0]}</p>
      </fieldset>

      <label class="review-field">
        <span class="review-field-label">Nhận xét của bạn <span class="required" aria-hidden="true">*</span></span>
        <textarea name="comment" rows="5" maxlength="${COMMENT_MAX}" placeholder="Chia sẻ trải nghiệm của bạn: lịch trình, hướng dẫn viên, ăn ở, điều bạn thích nhất..."></textarea>
        <small data-counter>0/${COMMENT_MAX} · tối thiểu ${COMMENT_MIN} ký tự</small>
      </label>

      <div class="review-field">
        <span class="review-field-label">Hình ảnh <small>(không bắt buộc, tối đa ${MAX_IMAGES} ảnh)</small></span>
        <div class="review-previews" data-previews></div>
        <label class="review-add-image" data-add>+ Thêm ảnh<input type="file" accept="image/*" multiple hidden data-file /></label>
      </div>

      <p class="review-error" role="alert" data-error hidden></p>
      <footer class="review-form-foot">
        <button type="button" class="secondary-cta" data-close>Hủy</button>
        <button type="submit" class="submit-button" data-submit>${submitText}</button>
      </footer>
    </form>`;

  const form = dialog.querySelector("form");
  const errorBox = dialog.querySelector("[data-error]");
  const submitButton = dialog.querySelector("[data-submit]");
  const starText = dialog.querySelector("[data-star-text]");
  const counter = dialog.querySelector("[data-counter]");
  const previews = dialog.querySelector("[data-previews]");
  const addButton = dialog.querySelector("[data-add]");
  const fileInput = dialog.querySelector("[data-file]");
  const commentField = form.elements.comment;

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  const renderPreviews = () => {
    previews.innerHTML = images.map((image, index) => `
      <div class="review-preview">
        <img src="${escapeHtml(image.url)}" alt="Ảnh đính kèm ${index + 1}" />
        <button type="button" data-remove="${index}" aria-label="Xóa ảnh ${index + 1}">×</button>
      </div>`).join("");
    addButton.hidden = images.length >= MAX_IMAGES;
  };

  const updateCounter = () => {
    counter.textContent = `${commentField.value.length}/${COMMENT_MAX} · tối thiểu ${COMMENT_MIN} ký tự`;
  };

  form.addEventListener("change", (event) => {
    if (event.target.name === "rating") starText.textContent = RATING_TEXT[Number(event.target.value)];
  });
  commentField.addEventListener("input", updateCounter);

  previews.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    images.splice(Number(button.dataset.remove), 1);
    renderPreviews();
  });

  fileInput.addEventListener("change", async () => {
    showError("");
    const files = Array.from(fileInput.files);
    fileInput.value = ""; // cho phép chọn lại cùng một ảnh
    const room = MAX_IMAGES - images.length;
    if (files.length > room) showError(`Chỉ thêm được tối đa ${MAX_IMAGES} ảnh, đã bỏ qua ${files.length - room} ảnh.`);

    processing += 1;
    submitButton.disabled = true;
    for (const file of files.slice(0, Math.max(0, room))) {
      try {
        images.push({ url: await fileToJpegDataUrl(file) });
        renderPreviews();
      } catch (error) {
        showError(error.message);
      }
    }
    processing -= 1;
    if (!processing) submitButton.disabled = false;
  });

  dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");

    const rating = Number(form.elements.rating.value);
    const comment = commentField.value.trim();
    if (!rating) {
      showError("Vui lòng chọn số sao.");
      dialog.querySelector(".star-row input").focus();
      return;
    }
    if (comment.length < COMMENT_MIN) {
      showError(`Vui lòng nhập nhận xét (ít nhất ${COMMENT_MIN} ký tự).`);
      commentField.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Đang gửi...";
    try {
      const response = await fetch(isEdit ? `/api/reviews/${encodeURIComponent(review.id)}` : `/api/bookings/${encodeURIComponent(bookingId)}/review`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, images: images.map((image) => image.url) }),
      });
      if (response.status === 401) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/index.html?auth=login&returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Không thể gửi đánh giá. Vui lòng thử lại.");
      dialog.close();
      onSaved?.(data.review);
    } catch (error) {
      showError(error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error.message);
      submitButton.disabled = false;
      submitButton.textContent = submitText;
    }
  });

  if (isEdit) {
    form.elements.rating.value = String(review.rating);
    starText.textContent = RATING_TEXT[review.rating];
    commentField.value = review.comment;
  }
  updateCounter();
  renderPreviews();
  document.body.append(dialog);
  dialog.showModal();
}
