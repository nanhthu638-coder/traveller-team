// Thành phần giao diện đánh giá dùng chung: sao, thẻ đánh giá, xem ảnh lớn.
import { escapeHtml, formatLocalDate } from "./booking-format.js";

export const formatRating = (value) => (value === null || value === undefined ? "—" : Number(value).toFixed(1));

/** Hiển thị số sao (hỗ trợ số lẻ, ví dụ 4.3 sao tô 86%). Màu sao nằm trong CSS `.stars`. */
export function starsHtml(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return `<span class="stars" style="--rate:${value}" role="img" aria-label="${value} trên 5 sao">★★★★★</span>`;
}

/** Dòng điểm nhỏ trên thẻ tour: ★★★★☆ 4.5 (12) hoặc "Chưa có đánh giá". */
export function ratingBadge(tour) {
  if (!tour.reviewCount) return '<span class="rating-inline is-empty">Chưa có đánh giá</span>';
  return `<span class="rating-inline">${starsHtml(tour.rating)} <b>${formatRating(tour.rating)}</b> <small>(${tour.reviewCount})</small></span>`;
}

const initialOf = (name) => String(name || "?").replace(/[^\p{L}]+$/u, "").trim().split(/\s+/).pop().charAt(0).toUpperCase() || "?";

/** Thẻ một đánh giá. `actions` = hiện nút Sửa/Xóa nếu là đánh giá của mình. */
export function reviewCardHtml(review, { actions = false } = {}) {
  const images = review.images?.length
    ? `<ul class="review-images">${review.images.map((url) => `<li><button type="button" class="review-image" data-image="${escapeHtml(url)}" aria-label="Xem ảnh lớn"><img src="${escapeHtml(url)}" alt="Ảnh đính kèm của khách" loading="lazy" /></button></li>`).join("")}</ul>`
    : "";
  const buttons = actions && review.isMine
    ? '<div class="review-actions"><button type="button" data-review-action="edit">Sửa</button><button type="button" data-review-action="delete" class="is-danger">Xóa</button></div>'
    : "";
  return `
    <article class="review-card" data-review-id="${escapeHtml(review.id)}">
      <header class="review-head">
        <span class="review-avatar" aria-hidden="true">${escapeHtml(initialOf(review.authorName))}</span>
        <div class="review-who">
          <strong>${escapeHtml(review.authorName)}${review.isMine ? ' <span class="review-me">Bạn</span>' : ""}</strong>
          <span class="review-meta">${starsHtml(review.rating)} <time datetime="${escapeHtml(review.createdAt)}">${formatLocalDate(review.createdAt)}</time>${review.edited ? " · Đã chỉnh sửa" : ""}</span>
        </div>
        <span class="review-verified" title="Khách đã đặt và hoàn thành tour này">✓ Đã hoàn thành tour</span>
      </header>
      <p class="review-comment">${escapeHtml(review.comment)}</p>
      ${images}
      ${buttons}
    </article>`;
}

/** Xem ảnh đính kèm kích thước lớn trong hộp thoại. */
export function openImageViewer(url) {
  const dialog = document.createElement("dialog");
  dialog.className = "image-viewer";
  dialog.setAttribute("aria-label", "Ảnh đính kèm");
  dialog.innerHTML = `<button type="button" class="image-viewer-close" aria-label="Đóng">×</button><img alt="Ảnh đính kèm của khách" />`;
  dialog.querySelector("img").src = url;
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.closest(".image-viewer-close")) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}

/** Gắn sự kiện bấm ảnh thu nhỏ → xem ảnh lớn cho một vùng chứa. */
export function bindReviewImages(container) {
  container.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-image]");
    if (trigger) openImageViewer(trigger.dataset.image);
  });
}
