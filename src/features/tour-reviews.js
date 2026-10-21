// Phần "Đánh giá và nhận xét" ở trang chi tiết tour.
import { escapeHtml, getJson } from "./booking-format.js";
import { openReviewDialog } from "./review-dialog.js";
import { bindReviewImages, formatRating, reviewCardHtml, starsHtml } from "./review-ui.js";

// Lời nhắn theo quyền đánh giá của người dùng (điều kiện: đã đặt VÀ hoàn thành tour)
function eligibilityHtml(mine) {
  switch (mine?.reason) {
    case "ok":
      return '<p>Bạn đã hoàn thành tour này. Hãy chia sẻ trải nghiệm để giúp những du khách khác!</p><button class="submit-button" type="button" data-review-action="write">Viết đánh giá</button>';
    case "reviewed":
      return "<p>Cảm ơn bạn đã đánh giá tour này. Bạn có thể sửa hoặc xóa đánh giá của mình trong danh sách bên dưới.</p>";
    case "not-completed":
      return '<p>Bạn đã đặt tour này. Bạn có thể gửi đánh giá sau khi hoàn thành chuyến đi.</p><a class="secondary-cta" href="/booking-history.html">Xem lịch sử đặt tour</a>';
    case "login": {
      const returnTo = `${window.location.pathname}${window.location.search}#reviews`;
      return `<p>Đăng nhập để viết đánh giá.</p><a class="submit-button" href="/index.html?auth=login&returnTo=${encodeURIComponent(returnTo)}">Đăng nhập</a>`;
    }
    default:
      return "<p>Chỉ khách đã đặt và hoàn thành tour mới có thể gửi đánh giá, để mọi nhận xét đều xác thực.</p>";
  }
}

/** Cập nhật điểm ở đầu trang chi tiết tour (thay cho số 4.8 cũ) theo dữ liệu thật. */
function applySummary(root, summary) {
  const meta = root.querySelector("[data-rating-meta]");
  const tile = root.querySelector("[data-rating-tile]");
  if (meta) {
    meta.innerHTML = summary.count
      ? `<a href="#reviews">${starsHtml(summary.average)} ${formatRating(summary.average)} · ${summary.count} đánh giá</a>`
      : '<a href="#reviews">Chưa có đánh giá</a>';
  }
  if (tile) tile.textContent = summary.count ? `${formatRating(summary.average)} / 5` : "Chưa có";
}

export function initTourReviews(container, tour, pageRoot = document) {
  let sort = "newest";
  let current = null;
  let firstLoad = true;

  const render = (data) => {
    const { summary, reviews, mine } = data;
    const bars = [5, 4, 3, 2, 1].map((star) => {
      const amount = summary.distribution[star] || 0;
      const percent = summary.count ? Math.round((amount / summary.count) * 100) : 0;
      return `<li><span>${star} ★</span><span class="reviews-bar" aria-hidden="true"><i style="width:${percent}%"></i></span><span>${amount}</span></li>`;
    }).join("");

    container.innerHTML = `
      <h2>Đánh giá và nhận xét</h2>
      <div class="reviews-summary">
        <div class="reviews-score">
          <strong>${summary.count ? formatRating(summary.average) : "—"}</strong>
          ${starsHtml(summary.average || 0)}
          <span>${summary.count ? `${summary.count} lượt đánh giá` : "Chưa có lượt đánh giá"}</span>
        </div>
        <ul class="reviews-bars" aria-label="Phân bố số sao">${bars}</ul>
        <div class="reviews-cta">${eligibilityHtml(mine)}</div>
      </div>
      <p class="review-inline-error" data-review-error role="alert" hidden></p>
      <div class="reviews-toolbar">
        <h3>Nhận xét của khách${summary.count ? ` <small>(${summary.count})</small>` : ""}</h3>
        ${summary.count > 1 ? `<label>Sắp xếp
          <select data-review-sort>
            <option value="newest"${sort === "newest" ? " selected" : ""}>Mới nhất</option>
            <option value="highest"${sort === "highest" ? " selected" : ""}>Điểm cao nhất</option>
            <option value="lowest"${sort === "lowest" ? " selected" : ""}>Điểm thấp nhất</option>
          </select></label>` : ""}
      </div>
      <div class="reviews-list">${reviews.length ? reviews.map((review) => reviewCardHtml(review, { actions: true })).join("") : '<p class="reviews-empty">Tour này chưa có nhận xét nào. Hãy là người đầu tiên chia sẻ trải nghiệm sau chuyến đi!</p>'}</div>`;
  };

  const showError = (message) => {
    const box = container.querySelector("[data-review-error]");
    if (!box) return;
    box.textContent = message;
    box.hidden = !message;
  };

  async function load() {
    container.setAttribute("aria-busy", "true");
    if (!current) container.innerHTML = '<h2>Đánh giá và nhận xét</h2><div class="reviews-loading" aria-hidden="true"><span></span><span></span><span class="is-short"></span></div>';
    try {
      current = await getJson(`/api/tours/${encodeURIComponent(tour.id)}/reviews?sort=${sort}`);
      render(current);
      applySummary(pageRoot, current.summary);
      if (firstLoad && window.location.hash === "#reviews") container.scrollIntoView({ block: "start" });
      firstLoad = false;
    } catch (error) {
      container.innerHTML = `<h2>Đánh giá và nhận xét</h2>
        <div class="bh-state is-error" role="alert"><strong>Không tải được đánh giá</strong><span>${escapeHtml(error.message)}</span>
        <div class="bh-state-actions"><button class="submit-button" type="button" data-review-action="retry">Thử lại</button></div></div>`;
    } finally {
      container.setAttribute("aria-busy", "false");
    }
  }

  async function deleteReview(reviewId) {
    if (!window.confirm("Bạn chắc chắn muốn xóa đánh giá này? Thao tác không thể hoàn tác.")) return;
    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Không thể xóa đánh giá. Vui lòng thử lại.");
      }
      await load();
    } catch (error) {
      showError(error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng thử lại." : error.message);
    }
  }

  container.addEventListener("click", (event) => {
    const action = event.target.closest("[data-review-action]")?.dataset.reviewAction;
    if (!action) return;
    const reviewId = event.target.closest("[data-review-id]")?.dataset.reviewId;
    if (action === "retry") load();
    if (action === "write") openReviewDialog({ tourName: tour.name, bookingId: current.mine.bookingId, onSaved: load });
    if (action === "edit") openReviewDialog({ tourName: tour.name, review: current.reviews.find((item) => item.id === reviewId), onSaved: load });
    if (action === "delete") deleteReview(reviewId);
  });
  container.addEventListener("change", (event) => {
    if (event.target.matches("[data-review-sort]")) {
      sort = event.target.value;
      load();
    }
  });
  bindReviewImages(container);

  return load();
}
