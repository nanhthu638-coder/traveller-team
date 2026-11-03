// ========================================================
// TRANG QUẢN TRỊ ADMIN - TRAVELLER TEAM
// Chức năng: Quản lý đặt Tour → Đơn đặt Tour mới
// ========================================================

import { onRealtimeStatus, subscribeRealtime } from "./features/realtime.js";

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const statusClasses = {
  pending: "is-pending",
  confirmed: "is-confirmed",
  completed: "is-completed",
  cancelled: "is-cancelled",
};

const paymentStatusLabels = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
};

const passengerTypeLabels = {
  adult: "Người lớn",
  child: "Trẻ em",
  infant: "Em bé",
};

const genderLabels = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

// DOM Elements
const adminMain = document.getElementById("admin-main");
const adminInitialState = document.getElementById("admin-initial-state");
const adminForbiddenBox = document.getElementById("admin-forbidden-box");
const adminContent = document.getElementById("admin-content");
const adminName = document.getElementById("admin-name");
const adminAvatarInitial = document.getElementById("admin-avatar-initial");
const adminLogoutBtn = document.getElementById("admin-logout");
const toast = document.getElementById("admin-toast");

// Navigation & Breadcrumbs
const bcParent = document.getElementById("bc-parent");
const bcChild = document.getElementById("bc-child");
const viewTitle = document.getElementById("admin-view-title");
const viewSubtitle = document.getElementById("admin-view-subtitle");
const tabButtons = document.querySelectorAll(".admin-tab-btn");
const panelBookingsTitle = document.getElementById("admin-panel-bookings-title");
const panelBookingsDesc = document.getElementById("admin-panel-bookings-desc");

// Badges
const badgePendingCount = document.getElementById("badge-pending-count");
const badgeAllCount = document.getElementById("badge-all-count");

// Panels
const panelBookings = document.getElementById("panel-bookings");
const panelInquiries = document.getElementById("panel-inquiries");
const panelCustomers = document.getElementById("panel-customers");
const panelDestinations = document.getElementById("panel-destinations");

// Destinations DOM Elements
const badgeDestinationsCount = document.getElementById("badge-destinations-count");
const destinationsLoading = document.getElementById("destinations-loading");
const destinationsError = document.getElementById("destinations-error");
const destinationsErrorMsg = document.getElementById("destinations-error-msg");
const btnRetryDestinations = document.getElementById("btn-retry-destinations");
const destinationsEmpty = document.getElementById("destinations-empty");
const destinationsTableWrapper = document.getElementById("destinations-table-wrapper");
const destinationsTbody = document.getElementById("admin-destinations-tbody");
const destinationFilters = document.getElementById("admin-destination-filters");
const filterDestQ = document.getElementById("filter-dest-q");
const filterDestRegion = document.getElementById("filter-dest-region");
const filterDestUsage = document.getElementById("filter-dest-usage");
const adminRefreshDestinations = document.getElementById("admin-refresh-destinations");
const adminBtnAddDestination = document.getElementById("admin-btn-add-destination");
const adminDestFilterReset = document.getElementById("admin-dest-filter-reset");

// Destination Form Modal
const destFormModal = document.getElementById("destination-form-modal");
const destFormModalClose = document.getElementById("dest-form-modal-close");
const destFormModalCancel = document.getElementById("dest-form-modal-cancel");
const destFormModalTitle = document.getElementById("dest-form-modal-title");
const destFormModalEyebrow = document.getElementById("dest-form-modal-eyebrow");
const destFormSubmitText = document.getElementById("dest-form-submit-text");
const destinationForm = document.getElementById("destination-form");
const destFormError = document.getElementById("dest-form-error");
const destFormErrorText = document.getElementById("dest-form-error-text");
const destInputId = document.getElementById("dest-input-id");
const destInputName = document.getElementById("dest-input-name");
const destInputRegion = document.getElementById("dest-input-region");
const destInputImage = document.getElementById("dest-input-image");
const btnPreviewDestImage = document.getElementById("btn-preview-dest-image");
const destImagePreviewBox = document.getElementById("dest-image-preview-box");
const destImagePreviewImg = document.getElementById("dest-image-preview-img");
const destInputDescription = document.getElementById("dest-input-description");
const destDescCounter = document.getElementById("dest-desc-counter");

// Destination Detail Modal
const destDetailModal = document.getElementById("destination-detail-modal");
const destDetailModalClose = document.getElementById("dest-detail-modal-close");
const destDetailModalCloseBtn = document.getElementById("dest-detail-modal-close-btn");
const destDetailBtnEdit = document.getElementById("dest-detail-btn-edit");
const destDetailModalTitle = document.getElementById("dest-detail-modal-title");
const destDetailRegionBadge = document.getElementById("dest-detail-region-badge");
const destDetailImage = document.getElementById("dest-detail-image");
const destDetailName = document.getElementById("dest-detail-name");
const destDetailRegion = document.getElementById("dest-detail-region");
const destDetailCreated = document.getElementById("dest-detail-created");
const destDetailUpdated = document.getElementById("dest-detail-updated");
const destDetailDescription = document.getElementById("dest-detail-description");
const destDetailToursCount = document.getElementById("dest-detail-tours-count");
const destDetailToursList = document.getElementById("dest-detail-tours-list");

// Destination Delete Modal
const destDeleteModal = document.getElementById("destination-delete-modal");
const destDeleteModalClose = document.getElementById("dest-delete-modal-close");
const destDeleteModalCancel = document.getElementById("dest-delete-modal-cancel");
const destDeleteModalSubmit = document.getElementById("dest-delete-modal-submit");
const destDeleteBlockedBox = document.getElementById("dest-delete-blocked-box");
const destDeleteBlockedMsg = document.getElementById("dest-delete-blocked-msg");
const destDeleteConfirmBox = document.getElementById("dest-delete-confirm-box");
const destDeleteName = document.getElementById("dest-delete-name");

// Reviews DOM Elements (Quản lý Tour → Đánh giá và chấm điểm Tour)
const panelReviews = document.getElementById("panel-reviews");
const badgeReviewsCount = document.getElementById("badge-reviews-count");
const adminRefreshReviews = document.getElementById("admin-refresh-reviews");
const revStatAvg = document.getElementById("rev-stat-avg");
const revStatTotal = document.getElementById("rev-stat-total");
const revStatWithImages = document.getElementById("rev-stat-with-images");
const revStatVisible = document.getElementById("rev-stat-visible");
const revStatHidden = document.getElementById("rev-stat-hidden");
const revStatSuspect = document.getElementById("rev-stat-suspect");
const revTourSummariesGrid = document.getElementById("rev-tour-summaries-grid");

const reviewFilters = document.getElementById("admin-review-filters");
const filterRevQ = document.getElementById("filter-rev-q");
const filterRevTourSelect = document.getElementById("filter-rev-tourId");
const filterRevRating = document.getElementById("filter-rev-rating");
const filterRevVisibility = document.getElementById("filter-rev-visibility");
const filterRevHasImages = document.getElementById("filter-rev-hasImages");
const filterRevSort = document.getElementById("filter-rev-sort");
const adminRevFilterReset = document.getElementById("admin-rev-filter-reset");

const reviewsLoading = document.getElementById("reviews-loading");
const reviewsError = document.getElementById("reviews-error");
const reviewsErrorMsg = document.getElementById("reviews-error-msg");
const btnRetryReviews = document.getElementById("btn-retry-reviews");
const reviewsEmpty = document.getElementById("reviews-empty");
const reviewsTableWrapper = document.getElementById("reviews-table-wrapper");
const reviewsTbody = document.getElementById("admin-reviews-tbody");

// Review Detail Modal
const revDetailModal = document.getElementById("review-detail-modal");
const revDetailModalClose = document.getElementById("rev-detail-modal-close");
const revDetailBtnClose = document.getElementById("rev-detail-btn-close");
const revDetailBtnToggle = document.getElementById("rev-detail-btn-toggle");
const revDetailBtnDelete = document.getElementById("rev-detail-btn-delete");
const revDetailStatusBadge = document.getElementById("rev-detail-status-badge");
const revDetailAlert = document.getElementById("rev-detail-alert");
const revDetailAlertText = document.getElementById("rev-detail-alert-text");
const revDetailAuthor = document.getElementById("rev-detail-author");
const revDetailBooking = document.getElementById("rev-detail-booking");
const revDetailCreated = document.getElementById("rev-detail-created");
const revDetailUpdated = document.getElementById("rev-detail-updated");
const revDetailTourName = document.getElementById("rev-detail-tour-name");
const revDetailTourPlace = document.getElementById("rev-detail-tour-place");
const revDetailTourAvg = document.getElementById("rev-detail-tour-avg");
const revDetailTourCount = document.getElementById("rev-detail-tour-count");
const revDetailRatingBox = document.getElementById("rev-detail-rating-box");
const revDetailComment = document.getElementById("rev-detail-comment");
const revDetailImagesCount = document.getElementById("rev-detail-images-count");
const revDetailImagesGrid = document.getElementById("rev-detail-images-grid");

// Review Delete Modal
const revDeleteModal = document.getElementById("review-delete-modal");
const revDeleteModalClose = document.getElementById("rev-delete-modal-close");
const revDeleteModalCancel = document.getElementById("rev-delete-modal-cancel");
const revDeleteModalSubmit = document.getElementById("rev-delete-modal-submit");
const revDeleteAuthor = document.getElementById("rev-delete-author");
const revDeleteTour = document.getElementById("rev-delete-tour");
const revDeletePreview = document.getElementById("rev-delete-preview");

// Booking Filters & Table
const bookingFilters = document.getElementById("admin-booking-filters");
const filterStatusWrapper = document.getElementById("filter-status-wrapper");
const filterStatusSelect = document.getElementById("filter-status");
const filterTourSelect = document.getElementById("filter-tourId");
const filterResetBtn = document.getElementById("admin-filter-reset");
const refreshBookingsBtn = document.getElementById("admin-refresh-bookings");
const bookingsLoading = document.getElementById("bookings-loading");
const bookingsError = document.getElementById("bookings-error");
const bookingsErrorMsg = document.getElementById("bookings-error-msg");
const btnRetryBookings = document.getElementById("btn-retry-bookings");
const bookingsEmpty = document.getElementById("bookings-empty");
const emptyTitle = document.getElementById("empty-title");
const emptyDesc = document.getElementById("empty-desc");
const bookingsTableWrapper = document.getElementById("bookings-table-wrapper");
const bookingsTbody = document.getElementById("admin-bookings-tbody");

// Modals
const bookingDetailModal = document.getElementById("booking-detail-modal");
const modalDetailClose = document.getElementById("modal-detail-close");
const modalBtnClose = document.getElementById("modal-btn-close");
const modalBtnConfirm = document.getElementById("modal-btn-confirm");
const modalBtnReject = document.getElementById("modal-btn-reject");
const modalBtnComplete = document.getElementById("modal-btn-complete");
const modalProcessedAlert = document.getElementById("modal-processed-alert");
const modalProcessedText = document.getElementById("modal-processed-text");
const modalFooterHint = document.getElementById("modal-footer-status-hint");
const adminRealtimeBadge = document.getElementById("admin-realtime-badge");
const adminRealtimeText = document.getElementById("admin-realtime-text");

// Reject Modal
const rejectModal = document.getElementById("reject-modal");
const rejectModalForm = document.getElementById("reject-modal-form");
const rejectModalClose = document.getElementById("reject-modal-close");
const rejectModalCancel = document.getElementById("reject-modal-cancel");
const rejectCodeLabel = document.getElementById("reject-code-label");
const rejectReasonInput = document.getElementById("reject-reason-input");

// Inquiries & Customers
const inquiryList = document.getElementById("admin-inquiries");
const customerList = document.getElementById("admin-customers");
const createCustomerForm = document.getElementById("admin-customer-create");
const printArea = document.getElementById("admin-print-area");
const exportPdfBtn = document.getElementById("admin-export-pdf");

// State
let currentTab = "new-bookings"; // "new-bookings" | "all-bookings" | "inquiries" | "customers"
let currentBookings = [];
let selectedBooking = null;
let pendingRejectBookingId = null;
let toursList = [];
let destinationsList = [];
let selectedDestination = null;
let reviewsList = [];
let tourSummariesList = [];
let selectedReview = null;
let toastTimeout = null;

// ========================================================
// UTILITY FUNCTIONS
// ========================================================

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function showToast(message, type = "success") {
  if (!toast) return;
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.className = `admin-toast is-${type}`;
  toast.hidden = false;
  toastTimeout = window.setTimeout(() => {
    toast.hidden = true;
  }, 4000);
}

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
}
const formatCurrency = formatPrice;

function guestCountSummary(passengers = {}) {
  const adult = Number(passengers.adult || 0);
  const child = Number(passengers.child || 0);
  const infant = Number(passengers.infant || 0);
  const total = adult + child + infant;
  const parts = [];
  if (adult) parts.push(`${adult} người lớn`);
  if (child) parts.push(`${child} trẻ em`);
  if (infant) parts.push(`${infant} em bé`);
  return {
    total,
    text: `${total} khách (${parts.join(", ") || "0"})`,
  };
}

async function requestJson(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.");
  }
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const error = new Error(data?.error || "Máy chủ không thể xử lý yêu cầu.");
    error.status = response.status;
    throw error;
  }
  return data;
}

// ========================================================
// TAB NAVIGATION
// ========================================================

function switchTab(tab) {
  currentTab = tab;

  // Update tab buttons
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  // Switch panels
  if (tab === "new-bookings" || tab === "all-bookings") {
    panelBookings.hidden = false;
    panelInquiries.hidden = true;
    panelCustomers.hidden = true;
    if (panelDestinations) panelDestinations.hidden = true;
    if (panelReviews) panelReviews.hidden = true;
    if (panelTours) panelTours.hidden = true;

    if (tab === "new-bookings") {
      bcParent.textContent = "Quản lý đặt Tour";
      bcChild.textContent = "Đơn đặt Tour mới";
      viewTitle.textContent = "Quản lý đặt Tour";
      viewSubtitle.textContent = "Xác nhận hoặc từ chối các đơn đặt tour mới gửi lên từ khách hàng.";
      panelBookingsTitle.textContent = "Đơn đặt Tour mới";
      panelBookingsDesc.textContent = "Danh sách các đơn đặt tour mới đang chờ xác nhận từ ban quản trị.";

      // Khóa bộ lọc trạng thái về "pending"
      filterStatusWrapper.hidden = true;
      filterStatusSelect.value = "pending";
    } else {
      bcParent.textContent = "Quản lý đặt Tour";
      bcChild.textContent = "Tất cả đơn đặt Tour";
      viewTitle.textContent = "Quản lý đặt Tour";
      viewSubtitle.textContent = "Theo dõi toàn bộ đơn đặt tour, tìm kiếm và lọc theo trạng thái & khoảng thời gian.";
      panelBookingsTitle.textContent = "Tất cả đơn đặt tour";
      panelBookingsDesc.textContent = "Xem toàn bộ đơn đặt tour, bao gồm đơn chờ xác nhận, đã xác nhận và đã hủy.";

      // Mở bộ lọc trạng thái
      filterStatusWrapper.hidden = false;
      filterStatusSelect.value = "";
    }

    loadBookings();
  } else if (tab === "inquiries") {
    panelBookings.hidden = true;
    panelInquiries.hidden = false;
    panelCustomers.hidden = true;
    if (panelDestinations) panelDestinations.hidden = true;
    if (panelReviews) panelReviews.hidden = true;
    if (panelTours) panelTours.hidden = true;

    bcParent.textContent = "Tiện ích quản trị";
    bcChild.textContent = "Biểu mẫu liên hệ";
    viewTitle.textContent = "Biểu mẫu liên hệ";
    viewSubtitle.textContent = "Xử lý thắc mắc và yêu cầu tư vấn gửi từ trang liên hệ của khách hàng.";
    loadInquiries();
  } else if (tab === "customers") {
    panelBookings.hidden = true;
    panelInquiries.hidden = true;
    panelCustomers.hidden = false;
    if (panelDestinations) panelDestinations.hidden = true;
    if (panelReviews) panelReviews.hidden = true;
    if (panelTours) panelTours.hidden = true;

    bcParent.textContent = "Tiện ích quản trị";
    bcChild.textContent = "Quản lý khách hàng";
    viewTitle.textContent = "Quản lý khách hàng";
    viewSubtitle.textContent = "Danh sách tài khoản khách hàng, thêm mới hoặc điều chỉnh thông tin.";
    loadCustomers();
  } else if (tab === "destinations") {
    panelBookings.hidden = true;
    panelInquiries.hidden = true;
    panelCustomers.hidden = true;
    if (panelDestinations) panelDestinations.hidden = false;
    if (panelReviews) panelReviews.hidden = true;
    if (panelTours) panelTours.hidden = true;

    bcParent.textContent = "Quản lý địa điểm";
    bcChild.textContent = "Danh mục địa điểm";
    viewTitle.textContent = "Quản lý địa điểm";
    viewSubtitle.textContent = "Quản lý danh mục địa điểm du lịch, thông tin mô tả, khu vực và các tour liên kết.";

    loadDestinations();
  } else if (tab === "tours") {
    panelBookings.hidden = true;
    panelInquiries.hidden = true;
    panelCustomers.hidden = true;
    if (panelDestinations) panelDestinations.hidden = true;
    if (panelReviews) panelReviews.hidden = true;
    if (panelTours) panelTours.hidden = false;

    bcParent.textContent = "Quản lý Tour";
    bcChild.textContent = "Danh sách Tour du lịch";
    viewTitle.textContent = "Quản lý Tour du lịch";
    viewSubtitle.textContent = "Quản lý các tour du lịch hiện có, giá tour, thời gian, lịch trình, sức chứa và trạng thái hoạt động.";

    loadTours();
  } else if (tab === "reviews") {
    panelBookings.hidden = true;
    panelInquiries.hidden = true;
    panelCustomers.hidden = true;
    if (panelDestinations) panelDestinations.hidden = true;
    if (panelReviews) panelReviews.hidden = false;
    if (panelTours) panelTours.hidden = true;

    bcParent.textContent = "Quản lý Tour";
    bcChild.textContent = "Đánh giá và chấm điểm Tour";
    viewTitle.textContent = "Quản lý Tour";
    viewSubtitle.textContent = "Theo dõi điểm đánh giá trung bình từng Tour, kiểm duyệt nhận xét của khách hàng và ẩn/xóa các đánh giá vi phạm.";

    loadReviews();
  }
}

// ========================================================
// LOAD & RENDER BOOKINGS
// ========================================================

async function loadBookings() {
  bookingsLoading.hidden = false;
  bookingsError.hidden = true;
  bookingsEmpty.hidden = true;
  bookingsTableWrapper.hidden = true;

  const params = new URLSearchParams(new FormData(bookingFilters));
  for (const [key, value] of [...params.entries()]) {
    if (!value || !value.trim()) params.delete(key);
  }

  // Nếu đang ở tab "Đơn đặt Tour mới", luôn ép status = "pending"
  if (currentTab === "new-bookings") {
    params.set("status", "pending");
  }

  try {
    const data = await requestJson(`/api/admin/bookings?${params.toString()}`);
    currentBookings = Array.isArray(data.bookings) ? data.bookings : [];
    const counts = data.counts || {};

    // Cập nhật số đếm badge
    if (badgePendingCount) {
      badgePendingCount.textContent = counts.pending ?? 0;
      badgePendingCount.classList.toggle("has-new", (counts.pending || 0) > 0);
    }
    if (badgeAllCount) {
      badgeAllCount.textContent = counts.all ?? 0;
    }

    renderBookingsTable(currentBookings);
  } catch (error) {
    // Luồng ngoại lệ 3: Lỗi tải dữ liệu
    bookingsLoading.hidden = true;
    bookingsTableWrapper.hidden = true;
    bookingsEmpty.hidden = true;
    bookingsError.hidden = false;
    bookingsErrorMsg.textContent = error.message || "Lỗi tải dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại.";
  } finally {
    bookingsLoading.hidden = true;
  }
}

function renderBookingsTable(bookings) {
  // Luồng ngoại lệ 1: Chưa có đơn mới / Không có đơn phù hợp
  if (!bookings || bookings.length === 0) {
    bookingsTableWrapper.hidden = true;
    bookingsEmpty.hidden = false;
    if (currentTab === "new-bookings") {
      emptyTitle.textContent = "Chưa có đơn đặt tour mới";
      emptyDesc.textContent = "Hiện tại không có đơn đặt tour nào đang chờ duyệt. Tất cả đơn đã được xử lý.";
    } else {
      emptyTitle.textContent = "Không tìm thấy đơn đặt tour";
      emptyDesc.textContent = "Không có đơn nào khớp với bộ lọc và từ khóa tìm kiếm hiện tại. Vui lòng thử lại.";
    }
    return;
  }

  bookingsEmpty.hidden = true;
  bookingsTableWrapper.hidden = false;

  bookingsTbody.innerHTML = bookings.map((booking) => {
    const isPending = booking.status === "pending";
    const isConfirmed = booking.status === "confirmed";
    const hasPendingCancelReq = booking.cancellationRequest?.status === "pending" && booking.status !== "cancelled";
    const statusLabelText = statusLabels[booking.status] || booking.status;
    const statusClass = statusClasses[booking.status] || "is-pending";
    const paymentText = paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus;
    const guests = guestCountSummary(booking.passengers);

    const contactName = escapeHtml(booking.contact?.name || "Khách hàng");
    const contactEmail = escapeHtml(booking.contact?.email || "—");
    const contactPhone = escapeHtml(booking.contact?.phone || "Chưa có SĐT");
    const tourName = escapeHtml(booking.tour?.name || "Tour du lịch");
    const tourPlace = escapeHtml(booking.tour?.place || "");

    // Ngoại lệ 2 & Các hành động thực tế theo trạng thái đơn
    let actionsHtml = "";
    if (hasPendingCancelReq) {
      actionsHtml = `
        <div class="table-actions">
          <button type="button" class="btn-action btn-view-detail" data-action="view" data-id="${escapeHtml(booking.id)}" title="Xem thông tin chi tiết đơn">
            Xem chi tiết
          </button>
          <button type="button" class="btn-action btn-reject" data-action="approve-cancel" data-id="${escapeHtml(booking.id)}" title="Duyệt yêu cầu hủy tour của khách hàng">
            Duyệt hủy
          </button>
          <button type="button" class="btn-action btn-confirm" data-action="reject-cancel" data-id="${escapeHtml(booking.id)}" title="Từ chối yêu cầu hủy tour và giữ nguyên đơn">
            Giữ đơn
          </button>
        </div>`;
    } else if (isPending) {
      actionsHtml = `
        <div class="table-actions">
          <button type="button" class="btn-action btn-view-detail" data-action="view" data-id="${escapeHtml(booking.id)}" title="Xem thông tin chi tiết đơn">
            Xem chi tiết
          </button>
          <button type="button" class="btn-action btn-confirm" data-action="confirm" data-id="${escapeHtml(booking.id)}" title="Xác nhận đơn đặt tour">
            Xác nhận
          </button>
          <button type="button" class="btn-action btn-reject" data-action="reject" data-id="${escapeHtml(booking.id)}" title="Từ chối đơn đặt tour">
            Từ chối
          </button>
        </div>`;
    } else if (isConfirmed) {
      actionsHtml = `
        <div class="table-actions">
          <button type="button" class="btn-action btn-view-detail" data-action="view" data-id="${escapeHtml(booking.id)}" title="Xem thông tin chi tiết đơn">
            Xem chi tiết
          </button>
          <button type="button" class="btn-action btn-complete" data-action="complete" data-id="${escapeHtml(booking.id)}" title="Đánh dấu chuyến đi đã hoàn thành">
            ✓ Hoàn thành
          </button>
          <button type="button" class="btn-action btn-disabled" disabled title="Đơn đã xác nhận">
            Từ chối
          </button>
        </div>`;
    } else {
      actionsHtml = `
        <div class="table-actions">
          <button type="button" class="btn-action btn-view-detail" data-action="view" data-id="${escapeHtml(booking.id)}" title="Xem thông tin chi tiết đơn">
            Xem chi tiết
          </button>
          <button type="button" class="btn-action btn-disabled" disabled title="Đơn đã được xử lý, không thể xác nhận lại">
            Xác nhận
          </button>
          <button type="button" class="btn-action btn-disabled" disabled title="Đơn đã được xử lý, không thể từ chối lại">
            Từ chối
          </button>
        </div>`;
    }

    const cancelAlertPill = hasPendingCancelReq
      ? `<div class="mt-1"><span class="payment-badge is-unpaid" title="Lý do: ${escapeHtml(booking.cancellationRequest?.reason || "")}">⚠️ Khách xin hủy</span></div>`
      : "";

    return `
      <tr class="booking-row ${isPending ? "is-new-booking" : ""}" data-id="${escapeHtml(booking.id)}">
        <!-- 1. Mã đơn & Ngày đặt -->
        <td class="cell-code">
          <span class="booking-code">${escapeHtml(booking.code)}</span>
          <span class="booking-date-sub">Ngày đặt: ${escapeHtml(formatDateTime(booking.createdAt))}</span>
        </td>

        <!-- 2. Khách hàng & Liên hệ -->
        <td class="cell-customer">
          <strong class="customer-name">${contactName}</strong>
          <span class="customer-contact">
            <a href="tel:${contactPhone}" class="contact-link" title="Gọi điện">📞 ${contactPhone}</a>
            <a href="mailto:${contactEmail}" class="contact-link" title="Gửi email">✉️ ${contactEmail}</a>
          </span>
        </td>

        <!-- 3. Tên tour, ngày đặt, ngày khởi hành -->
        <td class="cell-tour">
          <strong class="tour-name" title="${tourName}">${tourName}</strong>
          <span class="tour-meta">${tourPlace ? `${tourPlace} · ` : ""}Khởi hành: <strong class="departure-highlight">${escapeHtml(formatDate(booking.departureDate))}</strong></span>
        </td>

        <!-- 4. Số lượng khách và tổng tiền -->
        <td class="cell-price">
          <span class="pax-count-badge">${escapeHtml(guests.text)}</span>
          <strong class="total-amount">${escapeHtml(formatPrice(booking.total))}</strong>
          <span class="payment-badge is-${booking.paymentStatus || "unpaid"}">${escapeHtml(paymentText)}</span>
        </td>

        <!-- 5. Trạng thái đơn: Chờ xác nhận, Đã xác nhận, Đã hủy -->
        <td class="cell-status">
          <span class="admin-badge ${statusClass}">
            <span class="badge-dot" aria-hidden="true"></span>
            ${escapeHtml(statusLabelText)}
          </span>
          ${cancelAlertPill}
        </td>

        <!-- 6. Nút Xem chi tiết, Xác nhận hoặc Từ chối đơn đặt tour -->
        <td class="cell-actions text-center">
          ${actionsHtml}
        </td>
      </tr>`;
  }).join("");
}

// ========================================================
// MODAL: XEM CHI TIẾT ĐƠN ĐẶT TOUR
// ========================================================

async function openBookingDetail(bookingId) {
  let booking = currentBookings.find((b) => b.id === bookingId);
  if (!booking) {
    try {
      const data = await requestJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}`);
      booking = data.booking;
    } catch (err) {
      showToast(err.message || "Không thể tải chi tiết đơn đặt tour.", "error");
      return;
    }
  }

  selectedBooking = booking;
  const isPending = booking.status === "pending";
  const guests = guestCountSummary(booking.passengers);

  // Fill Header & Code
  document.getElementById("modal-code").textContent = booking.code;
  const statusBadge = document.getElementById("modal-status-badge");
  statusBadge.className = `admin-badge ${statusClasses[booking.status] || "is-pending"}`;
  statusBadge.innerHTML = `<span class="badge-dot" aria-hidden="true"></span> ${escapeHtml(statusLabels[booking.status] || booking.status)}`;

  // Luồng ngoại lệ 2: Đơn đã được xử lý: Không cho phép xác nhận lại
  if (!isPending) {
    modalProcessedAlert.hidden = false;
    if (booking.status === "confirmed") {
      modalProcessedText.textContent = "Đơn đặt tour này đã được xác nhận. Sau khi đoàn kết thúc hành trình, bạn có thể nhấn Đánh dấu Hoàn thành để mở khóa quyền đánh giá cho khách hàng.";
      if (modalBtnComplete) {
        modalBtnComplete.hidden = false;
        modalBtnComplete.disabled = false;
      }
      modalFooterHint.textContent = "Đơn đang trong trạng thái Đã xác nhận.";
    } else {
      modalProcessedText.textContent = `Đơn đặt tour này đã được xử lý (${statusLabels[booking.status] || booking.status}). Không cho phép xác nhận hoặc từ chối lại.`;
      if (modalBtnComplete) {
        modalBtnComplete.hidden = true;
      }
      modalFooterHint.textContent = "Đơn đã kết thúc xử lý.";
    }
    modalBtnConfirm.disabled = true;
    modalBtnConfirm.classList.add("btn-disabled");
    modalBtnConfirm.hidden = true;
    modalBtnReject.disabled = true;
    modalBtnReject.classList.add("btn-disabled");
    modalBtnReject.hidden = true;
  } else {
    modalProcessedAlert.hidden = true;
    if (modalBtnComplete) {
      modalBtnComplete.hidden = true;
    }
    modalBtnConfirm.disabled = false;
    modalBtnConfirm.classList.remove("btn-disabled");
    modalBtnConfirm.hidden = false;
    modalBtnReject.disabled = false;
    modalBtnReject.classList.remove("btn-disabled");
    modalBtnReject.hidden = false;
    modalFooterHint.textContent = "Vui lòng kiểm tra thông tin hành khách trước khi xác nhận.";
  }

  // Khách hàng & Liên hệ
  document.getElementById("modal-customer-name").textContent = booking.contact?.name || "Khách hàng";
  document.getElementById("modal-customer-phone").textContent = booking.contact?.phone || "Chưa cung cấp";
  document.getElementById("modal-customer-email").textContent = booking.contact?.email || "Chưa cung cấp";
  document.getElementById("modal-created-at").textContent = formatDateTime(booking.createdAt);

  const noteBox = document.getElementById("modal-note-box");
  const noteEl = document.getElementById("modal-customer-note");
  if (booking.note && booking.note.trim()) {
    noteBox.hidden = false;
    noteEl.textContent = booking.note;
  } else {
    noteBox.hidden = true;
  }

  // Tour
  document.getElementById("modal-tour-name").textContent = booking.tour?.name || "Tour du lịch";
  document.getElementById("modal-tour-place").textContent = `${booking.tour?.place || "—"}${booking.tour?.region ? ` (${booking.tour.region})` : ""}`;
  document.getElementById("modal-tour-duration").textContent = booking.tour?.duration || "—";
  document.getElementById("modal-departure-date").textContent = formatDate(booking.departureDate);
  document.getElementById("modal-tour-price").textContent = formatPrice(booking.tour?.price || 0);

  // Danh sách hành khách chi tiết
  const paxList = Array.isArray(booking.passengerDetails) ? booking.passengerDetails : [];
  document.getElementById("modal-pax-count").textContent = guests.total;
  const paxTbody = document.getElementById("modal-pax-tbody");

  if (paxList.length > 0) {
    paxTbody.innerHTML = paxList.map((pax, index) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td><strong>${escapeHtml(pax.fullName)}</strong></td>
        <td><span class="pax-type-tag is-${pax.type}">${escapeHtml(passengerTypeLabels[pax.type] || pax.type)}</span></td>
        <td>${escapeHtml(genderLabels[pax.gender] || pax.gender || "—")}</td>
        <td>${escapeHtml(formatDate(pax.dob))}</td>
        <td>${pax.idNumber ? `<code class="id-tag">${escapeHtml(pax.idNumber)}</code>` : "—"}</td>
      </tr>
    `).join("");
  } else {
    paxTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Đơn đặt tour chưa lưu chi tiết từng hành khách (đặt theo số lượng tổng quan).</td></tr>`;
  }

  // Chi tiết thanh toán
  const breakdownEl = document.getElementById("modal-price-breakdown");
  const price = Number(booking.tour?.price || 0);
  const p = booking.passengers || {};
  const breakdownItems = [];

  if (p.adult) {
    breakdownItems.push(`<li><span>Người lớn: <strong>${p.adult} × ${formatPrice(price)}</strong></span><span>${formatPrice(p.adult * price)}</span></li>`);
  }
  if (p.child) {
    const childPrice = price * 0.7;
    breakdownItems.push(`<li><span>Trẻ em (70%): <strong>${p.child} × ${formatPrice(childPrice)}</strong></span><span>${formatPrice(p.child * childPrice)}</span></li>`);
  }
  if (p.infant) {
    breakdownItems.push(`<li><span>Em bé: <strong>${p.infant} em bé</strong></span><span class="text-free">Miễn phí</span></li>`);
  }
  if (booking.voucher && booking.discount) {
    breakdownItems.push(`<li class="discount-line"><span>Mã giảm giá (${escapeHtml(booking.voucher.code)}):</span><span class="text-discount">-${formatPrice(booking.discount)}</span></li>`);
  }

  breakdownEl.innerHTML = breakdownItems.join("");
  document.getElementById("modal-total-price").textContent = formatPrice(booking.total);

  const paymentEl = document.getElementById("modal-payment-status");
  paymentEl.textContent = paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus || "—";
  paymentEl.className = `payment-badge is-${booking.paymentStatus || "unpaid"}`;

  bookingDetailModal.showModal();
}

// ========================================================
// ACTIONS: XÁC NHẬN HOẶC TỪ CHỐI ĐƠN
// ========================================================

async function handleConfirmBooking(bookingId) {
  const booking = currentBookings.find((b) => b.id === bookingId) || selectedBooking;
  const code = booking?.code || bookingId;

  // Kiểm tra đơn đã xử lý chưa
  if (booking && booking.status !== "pending") {
    showToast("Đơn đặt tour đã được xử lý trước đó, không thể xác nhận lại.", "error");
    return;
  }

  const ok = window.confirm(`Bạn có chắc chắn muốn XÁC NHẬN đơn đặt tour #${code}?`);
  if (!ok) return;

  try {
    const data = await requestJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });

    showToast(`Đã xác nhận đơn đặt tour #${code} thành công!`, "success");

    if (bookingDetailModal.open) {
      bookingDetailModal.close();
    }

    await loadBookings();
  } catch (error) {
    // Luồng ngoại lệ 2: Đơn đã xử lý
    showToast(error.message || "Không thể xác nhận đơn đặt tour.", "error");
    await loadBookings();
  }
}

async function handleCompleteBooking(bookingId) {
  const booking = currentBookings.find((b) => b.id === bookingId) || selectedBooking;
  const code = booking?.code || bookingId;

  if (booking && booking.status !== "confirmed") {
    showToast("Chỉ có thể đánh dấu hoàn thành cho các đơn đã được xác nhận.", "error");
    return;
  }

  const ok = window.confirm(`Đánh dấu đơn đặt tour #${code} là ĐÃ HOÀN THÀNH chuyến đi? Khách hàng sẽ được mở khóa chức năng đánh giá tour.`);
  if (!ok) return;

  try {
    await requestJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });

    showToast(`Đã đánh dấu hoàn thành chuyến đi cho đơn #${code}!`, "success");
    if (bookingDetailModal.open) {
      bookingDetailModal.close();
    }
    await loadBookings();
  } catch (error) {
    showToast(error.message || "Không thể cập nhật trạng thái hoàn thành.", "error");
    await loadBookings();
  }
}

async function handleCancellationDecision(bookingId, decision) {
  const booking = currentBookings.find((b) => b.id === bookingId) || selectedBooking;
  const code = booking?.code || bookingId;
  const isApprove = decision === "approved";
  const confirmMsg = isApprove
    ? `Bạn có chắc chắn muốn DUYỆT yêu cầu hủy đơn #${code}? Đơn sẽ chuyển sang trạng thái Đã hủy và hoàn trả chỗ trống.`
    : `Từ chối yêu cầu hủy đơn #${code} và giữ nguyên trạng thái đơn hiện tại?`;

  if (!window.confirm(confirmMsg)) return;

  try {
    await requestJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}/cancellation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });

    showToast(
      isApprove ? `Đã duyệt yêu cầu hủy đơn #${code}.` : `Đã từ chối yêu cầu hủy đơn #${code}.`,
      isApprove ? "info" : "success"
    );
    await loadBookings();
  } catch (error) {
    showToast(error.message || "Không thể xử lý yêu cầu hủy đơn.", "error");
    await loadBookings();
  }
}

function openRejectDialog(bookingId) {
  const booking = currentBookings.find((b) => b.id === bookingId) || selectedBooking;
  if (!booking) return;

  // Luồng ngoại lệ 2
  if (booking.status !== "pending") {
    showToast("Đơn đặt tour đã được xử lý trước đó, không thể từ chối lại.", "error");
    return;
  }

  pendingRejectBookingId = bookingId;
  rejectCodeLabel.textContent = `#${booking.code}`;
  rejectReasonInput.value = "";
  rejectModal.showModal();
}

async function handleRejectSubmit(event) {
  event.preventDefault();
  if (!pendingRejectBookingId) return;

  const reason = rejectReasonInput.value.trim();
  const bookingId = pendingRejectBookingId;
  const booking = currentBookings.find((b) => b.id === bookingId) || selectedBooking;
  const code = booking?.code || bookingId;

  const submitBtn = document.getElementById("reject-modal-submit");
  submitBtn.disabled = true;

  try {
    await requestJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled", reason }),
    });

    showToast(`Đã từ chối đơn đặt tour #${code}.`, "info");
    rejectModal.close();
    if (bookingDetailModal.open) {
      bookingDetailModal.close();
    }
    await loadBookings();
  } catch (error) {
    showToast(error.message || "Không thể từ chối đơn đặt tour.", "error");
  } finally {
    submitBtn.disabled = false;
    pendingRejectBookingId = null;
  }
}

// ========================================================
// INQUIRIES & CUSTOMERS MODULES
// ========================================================

function renderInquiries(inquiries) {
  if (!inquiries.length) {
    inquiryList.innerHTML = '<div class="admin-state-box is-empty"><div class="state-icon">📭</div><h3>Chưa có biểu mẫu liên hệ</h3><p>Chưa có câu hỏi hoặc thắc mắc nào gửi từ khách hàng.</p></div>';
    return;
  }
  inquiryList.innerHTML = inquiries.map((inquiry) => `
    <article class="admin-card">
      <div class="admin-card-heading">
        <div>
          <h3>${escapeHtml(inquiry.topic)}</h3>
          <p>${escapeHtml(inquiry.name)} · <a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></p>
        </div>
        <span class="admin-badge ${inquiry.status === "resolved" ? "is-confirmed" : "is-pending"}">
          ${inquiry.status === "resolved" ? "Đã xử lý" : "Chờ xử lý"}
        </span>
      </div>
      <p class="admin-inquiry-message">${escapeHtml(inquiry.message)}</p>
      <p class="admin-card-date">Gửi lúc: ${escapeHtml(formatDateTime(inquiry.createdAt))}</p>
      ${inquiry.status === "resolved"
        ? `<p class="admin-card-date text-success">✓ Đã xử lý lúc ${escapeHtml(formatDateTime(inquiry.resolvedAt))}</p>`
        : `<button class="admin-primary-button mt-3" type="button" data-resolve-inquiry="${escapeHtml(inquiry.id)}">Đánh dấu đã xử lý</button>`}
    </article>
  `).join("");
}

async function loadInquiries() {
  try {
    const { inquiries } = await requestJson("/api/admin/inquiries");
    renderInquiries(inquiries || []);
  } catch (error) {
    showToast(error.message || "Lỗi tải biểu mẫu liên hệ.", "error");
  }
}

function renderCustomers(customers) {
  if (!customers.length) {
    customerList.innerHTML = '<div class="admin-state-box is-empty"><div class="state-icon">👥</div><h3>Chưa có tài khoản khách hàng</h3><p>Hiện chưa có khách hàng nào đăng ký tài khoản.</p></div>';
    return;
  }
  customerList.innerHTML = customers.map((customer) => `
    <article class="admin-card">
      <form class="admin-customer-edit" data-customer-id="${escapeHtml(customer.id)}">
        <div class="admin-card-heading">
          <h3>${escapeHtml(customer.name)}</h3>
          <span class="admin-badge is-confirmed">Khách hàng</span>
        </div>
        <div class="admin-customer-fields">
          <label>Họ tên<input name="name" maxlength="80" required value="${escapeHtml(customer.name)}" /></label>
          <label>Email<input name="email" type="email" maxlength="120" required value="${escapeHtml(customer.email)}" /></label>
          <label>Số điện thoại<input name="phone" maxlength="20" value="${escapeHtml(customer.phone)}" /></label>
          <label>Địa chỉ<input name="address" maxlength="250" value="${escapeHtml(customer.address)}" /></label>
          <label>Mật khẩu mới (để trống nếu không đổi)<input name="password" type="password" minlength="8" maxlength="256" autocomplete="new-password" /></label>
        </div>
        <div class="admin-card-actions">
          <button class="admin-secondary-button" type="submit">Lưu thay đổi</button>
          <button class="admin-danger-button" type="button" data-delete-customer="${escapeHtml(customer.id)}">Xóa tài khoản</button>
        </div>
      </form>
    </article>
  `).join("");
}

async function loadCustomers() {
  try {
    const { customers } = await requestJson("/api/admin/customers");
    renderCustomers(customers || []);
  } catch (error) {
    showToast(error.message || "Lỗi tải danh sách khách hàng.", "error");
  }
}

// ========================================================
// PRINT TOUR PASSENGERS
// ========================================================

async function printTourPassengers() {
  const tourId = filterTourSelect.value;
  if (!tourId) {
    showToast("Vui lòng chọn một Tour cụ thể từ bộ lọc trước khi xuất danh sách khách.", "error");
    filterTourSelect.focus();
    return;
  }
  exportPdfBtn.disabled = true;
  try {
    const { bookings } = await requestJson(`/api/admin/bookings?tourId=${encodeURIComponent(tourId)}`);
    const tour = toursList.find((item) => item.id === tourId);
    const activeBookings = (bookings || []).filter((b) => b.status !== "cancelled");

    printArea.innerHTML = `
      <div class="print-doc">
        <h1>DANH SÁCH KHÁCH HÀNG THEO TOUR</h1>
        <h2>${escapeHtml(tour?.name || "Tour du lịch")}</h2>
        <p><strong>Ngày xuất:</strong> ${escapeHtml(new Date().toLocaleString("vi-VN"))} · <strong>Tổng số đơn hợp lệ:</strong> ${activeBookings.length}</p>
        <hr />
        ${activeBookings.length > 0
          ? activeBookings.map((b) => `
            <div class="print-item">
              <h3>Đơn #${escapeHtml(b.code)} - ${escapeHtml(statusLabels[b.status] || b.status)}</h3>
              <p>Khách đặt: <strong>${escapeHtml(b.contact?.name)}</strong> · SĐT: ${escapeHtml(b.contact?.phone || "—")} · Email: ${escapeHtml(b.contact?.email)}</p>
              <p>Khởi hành: ${escapeHtml(formatDate(b.departureDate))} · Số khách: ${guestCountSummary(b.passengers).total}</p>
              ${Array.isArray(b.passengerDetails) && b.passengerDetails.length > 0
                ? `<table class="print-table">
                    <thead><tr><th>STT</th><th>Họ tên</th><th>Loại khách</th><th>Giới tính</th><th>Ngày sinh</th><th>CCCD</th></tr></thead>
                    <tbody>${b.passengerDetails.map((p, idx) => `
                      <tr>
                        <td>${idx + 1}</td>
                        <td>${escapeHtml(p.fullName)}</td>
                        <td>${escapeHtml(passengerTypeLabels[p.type] || p.type)}</td>
                        <td>${escapeHtml(genderLabels[p.gender] || p.gender || "—")}</td>
                        <td>${escapeHtml(formatDate(p.dob))}</td>
                        <td>${escapeHtml(p.idNumber || "—")}</td>
                      </tr>`).join("")}
                    </tbody>
                   </table>`
                : "<p><em>Chưa có chi tiết danh sách từng hành khách.</em></p>"}
            </div>
          `).join("")
          : "<p>Tour này chưa có khách đặt.</p>"}
      </div>`;

    printArea.hidden = false;
    window.print();
  } catch (error) {
    showToast(error.message || "Không thể xuất danh sách khách hàng.", "error");
  } finally {
    exportPdfBtn.disabled = false;
  }
}

// ========================================================
// QUẢN LÝ DANH MỤC ĐỊA ĐIỂM (DESTINATIONS)
// ========================================================

function resolveImageUrl(image) {
  if (!image) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
    return image;
  }
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1200&q=85`;
}

async function loadDestinations() {
  destinationsLoading.hidden = false;
  destinationsError.hidden = true;
  destinationsEmpty.hidden = true;
  destinationsTableWrapper.hidden = true;

  try {
    const params = new URLSearchParams();
    if (filterDestQ.value.trim()) params.set("q", filterDestQ.value.trim());
    if (filterDestRegion.value) params.set("region", filterDestRegion.value);
    if (filterDestUsage.value && filterDestUsage.value !== "all") params.set("usage", filterDestUsage.value);

    const data = await requestJson(`/api/admin/destinations?${params.toString()}`);
    destinationsList = data.destinations || [];

    // Cập nhật danh sách khu vực vào dropdown
    const currentRegionVal = filterDestRegion.value;
    if (Array.isArray(data.regions)) {
      filterDestRegion.innerHTML = '<option value="">Tất cả khu vực</option>' +
        data.regions.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("");
      filterDestRegion.value = currentRegionVal;
    }

    if (badgeDestinationsCount) {
      badgeDestinationsCount.textContent = data.counts?.all ?? destinationsList.length;
    }

    destinationsLoading.hidden = true;

    if (destinationsList.length === 0) {
      destinationsEmpty.hidden = false;
      return;
    }

    renderDestinationsTable(destinationsList);
    destinationsTableWrapper.hidden = false;
  } catch (error) {
    destinationsLoading.hidden = true;
    destinationsError.hidden = false;
    destinationsErrorMsg.textContent = error.message || "Không thể kết nối máy chủ để tải danh mục địa điểm. Vui lòng thử lại.";
  }
}

function renderDestinationsTable(list) {
  destinationsTbody.innerHTML = list.map((dest) => {
    const imgUrl = resolveImageUrl(dest.image);
    const hasTours = dest.toursCount > 0;
    const tourBadgeClass = hasTours ? "dest-tours-pill is-in-use" : "dest-tours-pill is-unused";
    const tourBadgeText = hasTours ? `${dest.toursCount} tour liên kết` : "Chưa có tour";

    return `
      <tr class="destination-row" data-id="${escapeHtml(dest.id)}">
        <td>
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(dest.name)}" class="dest-thumb" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80'" />
        </td>
        <td>
          <div class="dest-name-cell">${escapeHtml(dest.name)}</div>
          <small class="text-secondary" style="font-size: 11px;">Mã: ${escapeHtml(dest.id.slice(0, 8))}</small>
        </td>
        <td>
          <span class="dest-region-pill">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${escapeHtml(dest.region)}
          </span>
        </td>
        <td>
          <div class="dest-desc-cell" title="${escapeHtml(dest.description)}">
            ${escapeHtml(dest.description)}
          </div>
        </td>
        <td>
          <span class="${tourBadgeClass}">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg>
            ${escapeHtml(tourBadgeText)}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-action btn-view-detail" data-action="view-dest" data-id="${escapeHtml(dest.id)}" title="Xem thông tin chi tiết địa điểm">
              Xem chi tiết
            </button>
            <button type="button" class="btn-action btn-edit" data-action="edit-dest" data-id="${escapeHtml(dest.id)}" title="Chỉnh sửa thông tin địa điểm">
              Sửa
            </button>
            <button type="button" class="btn-action btn-delete" data-action="delete-dest" data-id="${escapeHtml(dest.id)}" title="${hasTours ? 'Địa điểm đang có Tour sử dụng' : 'Xóa địa điểm này'}">
              Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function openCreateDestinationModal() {
  destinationForm.reset();
  destInputId.value = "";
  destFormError.hidden = true;
  destImagePreviewBox.hidden = true;
  destDescCounter.textContent = "0/1000";
  destFormModalTitle.textContent = "Thêm địa điểm du lịch";
  destFormModalEyebrow.textContent = "Thêm mới danh mục";
  destFormSubmitText.textContent = "Lưu địa điểm";
  destFormModal.showModal();
}

function openEditDestinationModal(id) {
  const dest = destinationsList.find((d) => d.id === id);
  if (!dest) return;
  selectedDestination = dest;

  destinationForm.reset();
  destInputId.value = dest.id;
  destInputName.value = dest.name;
  destInputRegion.value = dest.region;
  destInputImage.value = dest.image;
  destInputDescription.value = dest.description;
  destDescCounter.textContent = `${dest.description.length}/1000`;

  // Hiển thị ảnh xem trước
  destImagePreviewImg.src = resolveImageUrl(dest.image);
  destImagePreviewBox.hidden = false;

  destFormError.hidden = true;
  destFormModalTitle.textContent = "Chỉnh sửa địa điểm du lịch";
  destFormModalEyebrow.textContent = "Cập nhật danh mục";
  destFormSubmitText.textContent = "Lưu thay đổi";
  destFormModal.showModal();
}

async function handleDestinationFormSubmit(event) {
  event.preventDefault();
  destFormError.hidden = true;

  const id = destInputId.value.trim();
  const name = destInputName.value.trim();
  const region = destInputRegion.value.trim();
  const image = destInputImage.value.trim();
  const description = destInputDescription.value.trim();

  // Luồng ngoại lệ 1: Thiếu thông tin bắt buộc
  if (!name || !region || !image || !description) {
    destFormErrorText.textContent = "Thiếu thông tin bắt buộc: Vui lòng nhập đầy đủ tên địa điểm, khu vực/tỉnh thành, hình ảnh và mô tả.";
    destFormError.hidden = false;
    return;
  }
  if (name.length < 2) {
    destFormErrorText.textContent = "Tên địa điểm phải có ít nhất 2 ký tự.";
    destFormError.hidden = false;
    return;
  }
  if (description.length < 10) {
    destFormErrorText.textContent = "Mô tả địa điểm phải có ít nhất 10 ký tự.";
    destFormError.hidden = false;
    return;
  }

  const isEdit = Boolean(id);
  const url = isEdit ? `/api/admin/destinations/${encodeURIComponent(id)}` : "/api/admin/destinations";
  const method = isEdit ? "PUT" : "POST";

  const submitBtn = document.getElementById("dest-form-modal-submit");
  submitBtn.disabled = true;

  try {
    const data = await requestJson(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, region, image, description }),
    });

    destFormModal.close();
    showToast(data.message || (isEdit ? "Cập nhật địa điểm thành công." : "Thêm địa điểm thành công."), "success");
    await loadDestinations();
  } catch (error) {
    destFormErrorText.textContent = error.message || "Không thể lưu thông tin địa điểm. Vui lòng thử lại.";
    destFormError.hidden = false;
  } finally {
    submitBtn.disabled = false;
  }
}

async function openDestinationDetail(id) {
  try {
    const data = await requestJson(`/api/admin/destinations/${encodeURIComponent(id)}`);
    const dest = data.destination;
    selectedDestination = dest;

    destDetailModalTitle.textContent = dest.name;
    destDetailRegionBadge.textContent = dest.region;
    destDetailImage.src = resolveImageUrl(dest.image);
    destDetailName.textContent = dest.name;
    destDetailRegion.textContent = dest.region;
    destDetailCreated.textContent = formatDateTime(dest.createdAt);
    destDetailUpdated.textContent = formatDateTime(dest.updatedAt);
    destDetailDescription.textContent = dest.description;

    const tours = dest.tours || [];
    destDetailToursCount.textContent = tours.length;

    if (tours.length === 0) {
      destDetailToursList.innerHTML = `
        <div class="dest-empty-tours">
          Địa điểm này hiện chưa có tour du lịch nào liên kết. Có thể an toàn xóa hoặc tạo tour mới gắn với địa điểm này.
        </div>
      `;
    } else {
      destDetailToursList.innerHTML = tours.map((tour) => `
        <a href="/tour-detail.html?id=${encodeURIComponent(tour.id)}" target="_blank" class="dest-tour-card" title="Xem trang chi tiết tour">
          <div>
            <div class="dest-tour-card-title">${escapeHtml(tour.name)}</div>
            <div class="dest-tour-card-meta">${escapeHtml(tour.duration)} · Khởi hành từ ${escapeHtml(tour.place)} (${escapeHtml(tour.region)})</div>
          </div>
          <div class="dest-tour-card-price">${formatPrice(tour.price)}</div>
        </a>
      `).join("");
    }

    destDetailModal.showModal();
  } catch (error) {
    showToast(error.message || "Không thể tải chi tiết địa điểm.", "error");
  }
}

function openDeleteDestinationModal(id) {
  const dest = destinationsList.find((d) => d.id === id);
  if (!dest) return;
  selectedDestination = dest;

  const hasTours = dest.toursCount > 0;
  if (hasTours) {
    // Luồng ngoại lệ 2: Địa điểm đang được sử dụng trong Tour -> Không cho phép xóa
    destDeleteBlockedBox.hidden = false;
    destDeleteConfirmBox.hidden = true;
    destDeleteModalSubmit.hidden = true;

    const tourNames = (dest.tours || []).map((t) => `"${t.name}"`).join(", ");
    destDeleteBlockedMsg.textContent = `Địa điểm "${dest.name}" đang được sử dụng trong ${dest.toursCount} tour du lịch (${tourNames}). Vui lòng xử lý hoặc chuyển liên kết tour trước khi xóa.`;
  } else {
    // Luồng ngoại lệ 3: Hộp thoại xác nhận trước khi xóa
    destDeleteBlockedBox.hidden = true;
    destDeleteConfirmBox.hidden = false;
    destDeleteModalSubmit.hidden = false;
    destDeleteName.textContent = `"${dest.name}" (${dest.region})`;
  }

  destDeleteModal.showModal();
}

async function handleDeleteDestinationSubmit() {
  if (!selectedDestination) return;
  destDeleteModalSubmit.disabled = true;

  try {
    const data = await requestJson(`/api/admin/destinations/${encodeURIComponent(selectedDestination.id)}`, {
      method: "DELETE",
    });

    destDeleteModal.close();
    showToast(data.message || "Đã xóa địa điểm du lịch thành công.", "success");
    await loadDestinations();
  } catch (error) {
    showToast(error.message || "Không thể xóa địa điểm này.", "error");
    if (error.status === 409) {
      destDeleteBlockedBox.hidden = false;
      destDeleteConfirmBox.hidden = true;
      destDeleteModalSubmit.hidden = true;
      destDeleteBlockedMsg.textContent = error.message;
    }
  } finally {
    destDeleteModalSubmit.disabled = false;
  }
}

// ========================================================
// QUẢN LÝ TOUR → ĐÁNH GIÁ VÀ CHẤM ĐIỂM TOUR (REVIEWS)
// ========================================================

const ratingTextLabels = {
  5: "Tuyệt vời (5/5)",
  4: "Tốt (4/5)",
  3: "Bình thường (3/5)",
  2: "Tệ (2/5)",
  1: "Rất tệ (1/5)",
};

function renderStarsHtml(rating) {
  const r = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= r) {
      stars += '<span class="rev-star is-filled" aria-hidden="true">★</span>';
    } else {
      stars += '<span class="rev-star is-empty" aria-hidden="true">★</span>';
    }
  }
  return `<span class="rev-stars-display" aria-label="${r} trên 5 sao">${stars}</span>`;
}

async function loadReviews() {
  if (!reviewsLoading) return;
  reviewsLoading.hidden = false;
  reviewsError.hidden = true;
  reviewsEmpty.hidden = true;
  reviewsTableWrapper.hidden = true;

  try {
    const params = new URLSearchParams();
    if (filterRevQ && filterRevQ.value.trim()) params.set("q", filterRevQ.value.trim());
    if (filterRevTourSelect && filterRevTourSelect.value) params.set("tourId", filterRevTourSelect.value);
    if (filterRevRating && filterRevRating.value) params.set("rating", filterRevRating.value);
    if (filterRevVisibility && filterRevVisibility.value !== "all") params.set("visibility", filterRevVisibility.value);
    if (filterRevHasImages && filterRevHasImages.value !== "all") params.set("hasImages", filterRevHasImages.value);
    if (filterRevSort && filterRevSort.value) params.set("sort", filterRevSort.value);

    const data = await requestJson(`/api/admin/reviews?${params.toString()}`);
    reviewsList = data.reviews || [];
    tourSummariesList = data.tourSummaries || [];

    // Cập nhật thống kê tổng quan
    if (data.counts) {
      if (badgeReviewsCount) badgeReviewsCount.textContent = data.counts.all ?? reviewsList.length;
      if (revStatAvg) revStatAvg.textContent = data.counts.averageRating ? Number(data.counts.averageRating).toFixed(1) : "0.0";
      if (revStatTotal) revStatTotal.textContent = data.counts.all ?? 0;
      if (revStatWithImages) revStatWithImages.textContent = data.counts.withImages ?? 0;
      if (revStatVisible) revStatVisible.textContent = data.counts.visible ?? 0;
      if (revStatHidden) revStatHidden.textContent = data.counts.hidden ?? 0;
      if (revStatSuspect) revStatSuspect.textContent = data.counts.violationSuspects ?? 0;
    }

    // Render thống kê điểm trung bình & tổng lượt đánh giá của từng Tour
    renderTourReviewSummaries(tourSummariesList);

    reviewsLoading.hidden = true;

    if (reviewsList.length === 0) {
      reviewsEmpty.hidden = false;
      return;
    }

    renderReviewsTable(reviewsList);
    reviewsTableWrapper.hidden = false;
  } catch (error) {
    reviewsLoading.hidden = true;
    reviewsError.hidden = false;
    reviewsErrorMsg.textContent = error.message || "Không thể kết nối máy chủ để tải dữ liệu đánh giá. Vui lòng thử lại.";
  }
}

function renderTourReviewSummaries(summaries) {
  if (!revTourSummariesGrid) return;
  const activeTourId = filterRevTourSelect ? filterRevTourSelect.value : "";

  revTourSummariesGrid.innerHTML = summaries.map((item) => {
    const isSelected = activeTourId === item.tourId;
    const hasRating = item.averageRating !== null && item.averageRating !== undefined && item.visibleReviews > 0;
    const avgBadge = hasRating
      ? `<span class="rev-tour-avg-badge"><span class="badge-star-icon">★</span>${Number(item.averageRating).toFixed(1)}</span>`
      : `<span class="rev-tour-avg-badge is-none">Chưa có đánh giá</span>`;

    return `
      <button type="button" class="rev-tour-summary-card ${isSelected ? "is-active" : ""}" data-filter-tour="${escapeHtml(item.tourId)}" title="Nhấp để lọc đánh giá của ${escapeHtml(item.tourName)}">
        <div class="rev-tour-card-top">
          <div>
            <div class="rev-tour-card-name">${escapeHtml(item.tourName)}</div>
            <div class="rev-tour-card-region">📍 ${escapeHtml(item.place)} · ${escapeHtml(item.region)}</div>
          </div>
          ${avgBadge}
        </div>
        <div class="rev-tour-card-bottom">
          <span class="rev-tour-count-text">${item.totalReviews} lượt đánh giá</span>
          <span class="text-secondary">${item.hiddenReviews > 0 ? `(${item.hiddenReviews} đã ẩn)` : `${item.visibleReviews} hiển thị`}</span>
        </div>
      </button>
    `;
  }).join("");
}

function renderReviewsTable(list) {
  if (!reviewsTbody) return;

  reviewsTbody.innerHTML = list.map((rev) => {
    const rowClasses = [
      "review-row",
      rev.hidden ? "is-hidden-review" : "",
      !rev.hidden && rev.isViolationSuspect ? "is-violation-suspect" : "",
    ].filter(Boolean).join(" ");

    const statusBadge = rev.hidden
      ? `<span class="admin-badge is-cancelled" title="${escapeHtml(rev.hiddenReason || "Đã ẩn bởi Admin")}"><span class="badge-dot"></span>Đã ẩn</span>`
      : `<span class="admin-badge is-confirmed"><span class="badge-dot"></span>Đang hiển thị</span>`;

    const violationTag = rev.isViolationSuspect
      ? `<div><span class="rev-violation-badge">⚠️ Nghi vấn vi phạm / Spam</span></div>`
      : "";

    const thumbsHtml = Array.isArray(rev.images) && rev.images.length > 0
      ? `<div class="rev-thumbs-row">
          ${rev.images.map((url, idx) => `
            <img src="${escapeHtml(resolveImageUrl(url))}" alt="Ảnh đính kèm ${idx + 1}" class="rev-thumb-img" data-action="view-rev" data-id="${escapeHtml(rev.id)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80'" />
          `).join("")}
        </div>`
      : "";

    const toggleBtnClass = rev.hidden ? "btn-action btn-toggle-show" : "btn-action btn-toggle-hide";
    const toggleBtnText = rev.hidden ? "Hiện lại" : "Ẩn";
    const toggleBtnTitle = rev.hidden ? "Hiển thị lại đánh giá này trên trang công khai" : "Ẩn đánh giá vi phạm khỏi trang công khai";

    return `
      <tr class="${rowClasses}" data-id="${escapeHtml(rev.id)}">
        <td>
          <div class="customer-name">${escapeHtml(rev.authorName)}</div>
          <span class="booking-date-sub">Đơn: <code>${escapeHtml(rev.bookingId)}</code></span>
          <span class="booking-date-sub">${escapeHtml(formatDateTime(rev.createdAt))}</span>
          ${violationTag}
        </td>
        <td>
          <div class="tour-name-cell">${escapeHtml(rev.tourName)}</div>
          <span class="booking-date-sub">📍 ${escapeHtml(rev.tourPlace || rev.tourRegion)}</span>
        </td>
        <td>
          ${renderStarsHtml(rev.rating)}
          <span class="rev-rating-num">${escapeHtml(ratingTextLabels[rev.rating] || `${rev.rating}/5 sao`)}</span>
        </td>
        <td>
          <div class="rev-comment-text" title="${escapeHtml(rev.comment)}">${escapeHtml(rev.comment)}</div>
          ${thumbsHtml}
        </td>
        <td>
          ${statusBadge}
          ${rev.hidden && rev.hiddenReason ? `<small class="booking-date-sub" style="margin-top:4px;max-width:140px;">${escapeHtml(rev.hiddenReason)}</small>` : ""}
        </td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-action btn-view-detail" data-action="view-rev" data-id="${escapeHtml(rev.id)}" title="Xem chi tiết đánh giá & hình ảnh">
              Xem chi tiết
            </button>
            <button type="button" class="${toggleBtnClass}" data-action="toggle-rev" data-id="${escapeHtml(rev.id)}" title="${toggleBtnTitle}">
              ${toggleBtnText}
            </button>
            <button type="button" class="btn-action btn-delete" data-action="delete-rev" data-id="${escapeHtml(rev.id)}" title="Xóa vĩnh viễn đánh giá vi phạm">
              Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function openReviewDetailModal(id) {
  try {
    const data = await requestJson(`/api/admin/reviews/${encodeURIComponent(id)}`);
    const rev = data.review;
    const tourSum = data.tourSummary;
    selectedReview = rev;

    revDetailAuthor.textContent = rev.authorName;
    revDetailBooking.textContent = rev.bookingId;
    revDetailCreated.textContent = formatDateTime(rev.createdAt);
    revDetailUpdated.textContent = rev.edited ? `${formatDateTime(rev.updatedAt)} (Đã chỉnh sửa)` : formatDateTime(rev.updatedAt);

    revDetailTourName.textContent = rev.tourName;
    revDetailTourPlace.textContent = [rev.tourPlace, rev.tourRegion].filter(Boolean).join(" · ") || "—";
    revDetailTourAvg.textContent = tourSum?.averageRating ? `${Number(tourSum.averageRating).toFixed(1)} ★ / 5.0` : "Chưa có điểm TB";
    revDetailTourCount.textContent = tourSum ? `${tourSum.totalReviews} lượt đánh giá (${tourSum.visibleReviews} đang hiển thị)` : "—";

    // Trạng thái badge & cảnh báo
    if (rev.hidden) {
      revDetailStatusBadge.className = "admin-badge is-cancelled";
      revDetailStatusBadge.innerHTML = '<span class="badge-dot"></span>Đã ẩn (Vi phạm)';
      revDetailAlert.className = "admin-alert-banner admin-alert-danger";
      revDetailAlert.hidden = false;
      revDetailAlertText.innerHTML = `<strong>Đánh giá này đang bị ẩn khỏi trang công khai:</strong> ${escapeHtml(rev.hiddenReason || "Nội dung vi phạm quy chuẩn cộng đồng")}.`;
    } else if (rev.isViolationSuspect) {
      revDetailStatusBadge.className = "admin-badge is-pending";
      revDetailStatusBadge.innerHTML = '<span class="badge-dot"></span>Cần kiểm duyệt';
      revDetailAlert.className = "admin-alert-banner admin-alert-danger";
      revDetailAlert.hidden = false;
      revDetailAlertText.innerHTML = "<strong>Cảnh báo kiểm duyệt:</strong> Hệ thống phát hiện nội dung nhận xét có dấu hiệu quảng cáo/spam hoặc từ khóa vi phạm. Admin có thể Ẩn hoặc Xóa đánh giá này.";
    } else {
      revDetailStatusBadge.className = "admin-badge is-confirmed";
      revDetailStatusBadge.innerHTML = '<span class="badge-dot"></span>Đang hiển thị';
      revDetailAlert.hidden = true;
    }

    // Điểm chấm & nội dung nhận xét
    revDetailRatingBox.innerHTML = `
      <div class="rev-detail-stars-big">${renderStarsHtml(rev.rating)}</div>
      <span class="rev-detail-rating-label">${escapeHtml(ratingTextLabels[rev.rating] || `${rev.rating}/5 sao`)}</span>
    `;
    revDetailComment.textContent = rev.comment;

    // Hình ảnh đính kèm
    const imgs = Array.isArray(rev.images) ? rev.images : [];
    revDetailImagesCount.textContent = imgs.length;
    if (imgs.length === 0) {
      revDetailImagesGrid.innerHTML = '<div class="dest-empty-tours" style="grid-column: 1 / -1;">Khách hàng không đính kèm hình ảnh trong đánh giá này.</div>';
    } else {
      revDetailImagesGrid.innerHTML = imgs.map((url, idx) => `
        <a href="${escapeHtml(resolveImageUrl(url))}" target="_blank" rel="noopener" class="rev-detail-img-card" title="Mở ảnh kích thước đầy đủ">
          <img src="${escapeHtml(resolveImageUrl(url))}" alt="Hình ảnh đánh giá ${idx + 1}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'" />
        </a>
      `).join("");
    }

    // Nút Ẩn / Hiện trong modal
    revDetailBtnToggle.textContent = rev.hidden ? "Hiển thị lại đánh giá" : "Ẩn đánh giá vi phạm";
    revDetailModal.showModal();
  } catch (error) {
    showToast(error.message || "Không thể tải chi tiết đánh giá.", "error");
  }
}

async function handleToggleReviewVisibility(id) {
  const rev = reviewsList.find((r) => r.id === id) || (selectedReview?.id === id ? selectedReview : null);
  if (!rev) return;

  const nextHidden = !rev.hidden;
  try {
    const data = await requestJson(`/api/admin/reviews/${encodeURIComponent(id)}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hidden: nextHidden,
        reason: nextHidden ? "Nội dung đánh giá vi phạm quy chuẩn cộng đồng" : "",
      }),
    });

    showToast(data.message || (nextHidden ? "Đã ẩn đánh giá." : "Đã hiển thị lại đánh giá."), "success");
    if (revDetailModal && revDetailModal.open && selectedReview?.id === id) {
      await openReviewDetailModal(id);
    }
    await loadReviews();
  } catch (error) {
    showToast(error.message || "Không thể thay đổi trạng thái hiển thị của đánh giá.", "error");
  }
}

function openDeleteReviewModal(id) {
  const rev = reviewsList.find((r) => r.id === id) || (selectedReview?.id === id ? selectedReview : null);
  if (!rev) return;
  selectedReview = rev;

  revDeleteAuthor.textContent = rev.authorName;
  revDeleteTour.textContent = rev.tourName;
  revDeletePreview.textContent = `"${rev.comment}" (${rev.rating} ★)`;

  revDeleteModal.showModal();
}

async function handleDeleteReviewSubmit() {
  if (!selectedReview) return;
  revDeleteModalSubmit.disabled = true;

  try {
    const data = await requestJson(`/api/admin/reviews/${encodeURIComponent(selectedReview.id)}`, {
      method: "DELETE",
    });

    revDeleteModal.close();
    if (revDetailModal && revDetailModal.open) {
      revDetailModal.close();
    }
    showToast(data.message || "Đã xóa vĩnh viễn đánh giá vi phạm.", "success");
    await loadReviews();
  } catch (error) {
    showToast(error.message || "Không thể xóa đánh giá này.", "error");
  } finally {
    revDeleteModalSubmit.disabled = false;
  }
}

// ========================================================
// INITIALIZATION & EVENT LISTENERS
// ========================================================

async function initialize() {
  try {
    // 5. Điều kiện: Admin phải đăng nhập và có quyền quản lý đặt Tour
    const response = await fetch("/api/auth/session");
    const data = await response.json();

    if (!response.ok || !data.user) {
      // Chưa đăng nhập -> chuyển sang trang đăng nhập admin
      window.location.replace(`/admin-login.html?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (data.user.role !== "admin") {
      // Đã đăng nhập nhưng không phải admin
      adminInitialState.hidden = true;
      adminForbiddenBox.hidden = false;
      document.getElementById("admin-forbidden-msg").textContent = `Tài khoản "${data.user.email}" không có quyền quản lý đặt Tour. Vui lòng đăng nhập với tài khoản quản trị viên.`;
      return;
    }

    // Đã xác thực admin thành công
    adminInitialState.hidden = true;
    adminForbiddenBox.hidden = true;
    adminContent.hidden = false;

    adminName.textContent = data.user.name || "Quản trị viên";
    const initials = (data.user.name || "A").trim().split(/\s+/).pop().charAt(0).toUpperCase();
    adminAvatarInitial.textContent = initials;

    // Load tours dropdown
    try {
      const tourData = await requestJson("/api/admin/tours");
      toursList = tourData.tours || [];
      filterTourSelect.innerHTML = '<option value="">Tất cả tour</option>' + toursList.map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join("");
      if (filterRevTourSelect) {
        filterRevTourSelect.innerHTML = '<option value="">Tất cả các Tour</option>' + toursList.map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join("");
      }
    } catch {
      // Bỏ qua lỗi load tour options
    }

    // Preload destination badge count
    try {
      const destSummary = await requestJson("/api/admin/destinations");
      if (badgeDestinationsCount) {
        badgeDestinationsCount.textContent = destSummary.counts?.all ?? (destSummary.destinations || []).length;
      }
    } catch {
      // Bỏ qua lỗi preload badge
    }

    // Preload reviews badge count
    try {
      const revSummary = await requestJson("/api/admin/reviews");
      if (badgeReviewsCount) {
        badgeReviewsCount.textContent = revSummary.counts?.all ?? (revSummary.reviews || []).length;
      }
    } catch {
      // Bỏ qua lỗi preload badge
    }

    // Bắt đầu tại tab "Đơn đặt Tour mới"
    switchTab("new-bookings");
    setupAdminRealtime();
  } catch (error) {
    adminInitialState.hidden = true;
    adminForbiddenBox.hidden = false;
    document.getElementById("admin-forbidden-msg").textContent = error.message || "Lỗi kiểm tra phiên đăng nhập.";
  } finally {
    adminMain.setAttribute("aria-busy", "false");
  }
}

let realtimeSubscribed = false;
function setupAdminRealtime() {
  if (realtimeSubscribed) return;
  realtimeSubscribed = true;

  onRealtimeStatus(({ connected }) => {
    if (!adminRealtimeBadge || !adminRealtimeText) return;
    adminRealtimeBadge.classList.toggle("is-connected", connected);
    adminRealtimeBadge.classList.toggle("is-reconnecting", !connected);
    adminRealtimeText.textContent = connected ? "Trực tuyến (Real-time)" : "Đang kết nối lại...";
  });

  subscribeRealtime(async (event) => {
    const p = event.payload || {};

    if (event.type === "booking:created") {
      showToast(
        `🔔 Có đơn đặt tour mới #${p.code || ""} (${p.customerName || "Khách hàng"} · ${p.tourName || "Tour"})!`,
        "info"
      );
      if (currentTab === "new-bookings" || currentTab === "all-bookings") {
        await loadBookings();
      } else {
        try {
          const data = await requestJson("/api/admin/bookings?status=pending");
          if (badgePendingCount && data.counts) {
            badgePendingCount.textContent = data.counts.pending ?? 0;
            badgePendingCount.classList.toggle("has-new", (data.counts.pending || 0) > 0);
          }
          if (badgeAllCount && data.counts) {
            badgeAllCount.textContent = data.counts.all ?? 0;
          }
        } catch {
          // ignore
        }
      }
      return;
    }

    if (event.type === "payment:confirmed") {
      showToast(`💳 Khách hàng vừa thanh toán QR thành công cho đơn #${p.code || ""}!`, "success");
      if (currentTab === "new-bookings" || currentTab === "all-bookings") {
        await loadBookings();
      }
      return;
    }

    if (event.type === "booking:cancellation-requested") {
      showToast(`⚠️ Khách hàng vừa gửi yêu cầu hủy đơn #${p.code || ""}!`, "error");
      if (currentTab === "new-bookings" || currentTab === "all-bookings") {
        await loadBookings();
      }
      return;
    }

    if (
      event.type === "booking:updated" ||
      event.type === "booking:status-updated" ||
      event.type === "booking:cancellation-decided"
    ) {
      if (currentTab === "new-bookings" || currentTab === "all-bookings") {
        await loadBookings();
      }
      return;
    }

    if (event.type === "review:changed") {
      if (p.action === "created" || p.action === "updated") {
        showToast(
          `⭐ Khách hàng ${p.review?.authorName || ""} vừa gửi đánh giá ${p.review?.rating || 5} sao!`,
          "info"
        );
      }
      if (currentTab === "reviews") {
        await loadReviews();
      } else {
        try {
          const revSummary = await requestJson("/api/admin/reviews");
          if (badgeReviewsCount) {
            badgeReviewsCount.textContent = revSummary.counts?.all ?? (revSummary.reviews || []).length;
          }
        } catch {
          // ignore
        }
      }
      return;
    }

    if (event.type === "inquiry:changed") {
      if (p.action === "created") {
        showToast(
          `📩 Có biểu mẫu liên hệ mới từ ${p.inquiry?.name || "khách hàng"} (${p.inquiry?.topic || "Tư vấn"})!`,
          "info"
        );
      }
      if (currentTab === "inquiries") {
        await loadInquiries();
      }
      return;
    }

    if (event.type === "tour:changed") {
      if (currentTab === "tours") {
        await loadTours();
      }
      return;
    }

    if (event.type === "destination:changed") {
      if (currentTab === "destinations") {
        await loadDestinations();
      }
    }
  });
}

// Tab button click
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// Filter form submit
bookingFilters.addEventListener("submit", (event) => {
  event.preventDefault();
  loadBookings();
});

// Filter reset
filterResetBtn.addEventListener("click", () => {
  bookingFilters.reset();
  if (currentTab === "new-bookings") {
    filterStatusSelect.value = "pending";
  }
  loadBookings();
});

// Refresh button
refreshBookingsBtn.addEventListener("click", () => {
  loadBookings();
  showToast("Đã làm mới danh sách đơn đặt tour.", "info");
});

// Retry button on error (Ngoại lệ 3)
btnRetryBookings.addEventListener("click", () => {
  loadBookings();
});

// Table action buttons delegation
bookingsTbody.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (!id) return;

  if (action === "view") {
    openBookingDetail(id);
  } else if (action === "confirm") {
    handleConfirmBooking(id);
  } else if (action === "reject") {
    openRejectDialog(id);
  } else if (action === "complete") {
    handleCompleteBooking(id);
  } else if (action === "approve-cancel") {
    handleCancellationDecision(id, "approved");
  } else if (action === "reject-cancel") {
    handleCancellationDecision(id, "rejected");
  }
});

// Modal Detail Close
modalDetailClose.addEventListener("click", () => bookingDetailModal.close());
modalBtnClose.addEventListener("click", () => bookingDetailModal.close());
modalBtnConfirm.addEventListener("click", () => {
  if (selectedBooking) handleConfirmBooking(selectedBooking.id);
});
modalBtnReject.addEventListener("click", () => {
  if (selectedBooking) openRejectDialog(selectedBooking.id);
});
if (modalBtnComplete) {
  modalBtnComplete.addEventListener("click", () => {
    if (selectedBooking) handleCompleteBooking(selectedBooking.id);
  });
}

// Reject Modal Actions
rejectModalClose.addEventListener("click", () => rejectModal.close());
rejectModalCancel.addEventListener("click", () => rejectModal.close());
rejectModalForm.addEventListener("submit", handleRejectSubmit);

// ========================================================
// DESTINATIONS EVENT LISTENERS
// ========================================================

// Refresh & Add buttons
if (adminRefreshDestinations) {
  adminRefreshDestinations.addEventListener("click", () => loadDestinations());
}
if (adminBtnAddDestination) {
  adminBtnAddDestination.addEventListener("click", () => openCreateDestinationModal());
}
if (btnRetryDestinations) {
  btnRetryDestinations.addEventListener("click", () => loadDestinations());
}
const btnEmptyAddDest = document.getElementById("btn-empty-add-dest");
if (btnEmptyAddDest) {
  btnEmptyAddDest.addEventListener("click", () => openCreateDestinationModal());
}

// Destination Filters
if (destinationFilters) {
  destinationFilters.addEventListener("submit", (event) => {
    event.preventDefault();
    loadDestinations();
  });
}
if (adminDestFilterReset) {
  adminDestFilterReset.addEventListener("click", () => {
    destinationFilters.reset();
    loadDestinations();
  });
}

// Destination Table Actions (Delegate click)
if (destinationsTbody) {
  destinationsTbody.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!id) return;

    if (action === "view-dest") {
      openDestinationDetail(id);
    } else if (action === "edit-dest") {
      openEditDestinationModal(id);
    } else if (action === "delete-dest") {
      openDeleteDestinationModal(id);
    }
  });
}

// Destination Form Modal Events
if (destFormModalClose) destFormModalClose.addEventListener("click", () => destFormModal.close());
if (destFormModalCancel) destFormModalCancel.addEventListener("click", () => destFormModal.close());
if (destinationForm) destinationForm.addEventListener("submit", handleDestinationFormSubmit);

if (btnPreviewDestImage) {
  btnPreviewDestImage.addEventListener("click", () => {
    const val = destInputImage.value.trim();
    if (val) {
      destImagePreviewImg.src = resolveImageUrl(val);
      destImagePreviewBox.hidden = false;
    }
  });
}

if (destInputDescription) {
  destInputDescription.addEventListener("input", () => {
    destDescCounter.textContent = `${destInputDescription.value.length}/1000`;
  });
}

// Destination Detail Modal Events
if (destDetailModalClose) destDetailModalClose.addEventListener("click", () => destDetailModal.close());
if (destDetailModalCloseBtn) destDetailModalCloseBtn.addEventListener("click", () => destDetailModal.close());
if (destDetailBtnEdit) {
  destDetailBtnEdit.addEventListener("click", () => {
    destDetailModal.close();
    if (selectedDestination) openEditDestinationModal(selectedDestination.id);
  });
}

// Destination Delete Modal Events
if (destDeleteModalClose) destDeleteModalClose.addEventListener("click", () => destDeleteModal.close());
if (destDeleteModalCancel) destDeleteModalCancel.addEventListener("click", () => destDeleteModal.close());
if (destDeleteModalSubmit) destDeleteModalSubmit.addEventListener("click", handleDeleteDestinationSubmit);

// ========================================================
// REVIEWS EVENT LISTENERS (ĐÁNH GIÁ & CHẤM ĐIỂM TOUR)
// ========================================================

if (adminRefreshReviews) {
  adminRefreshReviews.addEventListener("click", () => {
    loadReviews();
    showToast("Đã làm mới danh sách đánh giá và điểm số Tour.", "info");
  });
}

if (btnRetryReviews) {
  btnRetryReviews.addEventListener("click", () => loadReviews());
}

if (reviewFilters) {
  reviewFilters.addEventListener("submit", (event) => {
    event.preventDefault();
    loadReviews();
  });
}

if (adminRevFilterReset) {
  adminRevFilterReset.addEventListener("click", () => {
    reviewFilters.reset();
    loadReviews();
  });
}

// Click vào thẻ Tour trong phần Điểm trung bình từng Tour để lọc nhanh
if (revTourSummariesGrid) {
  revTourSummariesGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-filter-tour]");
    if (!card || !filterRevTourSelect) return;
    const tourId = card.dataset.filterTour;
    filterRevTourSelect.value = filterRevTourSelect.value === tourId ? "" : tourId;
    loadReviews();
  });
}

// Thao tác trên bảng danh sách đánh giá
if (reviewsTbody) {
  reviewsTbody.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!id) return;

    if (action === "view-rev") {
      openReviewDetailModal(id);
    } else if (action === "toggle-rev") {
      handleToggleReviewVisibility(id);
    } else if (action === "delete-rev") {
      openDeleteReviewModal(id);
    }
  });
}

// Sự kiện trong Modal Chi tiết Đánh giá
if (revDetailModalClose) revDetailModalClose.addEventListener("click", () => revDetailModal.close());
if (revDetailBtnClose) revDetailBtnClose.addEventListener("click", () => revDetailModal.close());
if (revDetailBtnToggle) {
  revDetailBtnToggle.addEventListener("click", () => {
    if (selectedReview) handleToggleReviewVisibility(selectedReview.id);
  });
}
if (revDetailBtnDelete) {
  revDetailBtnDelete.addEventListener("click", () => {
    if (selectedReview) openDeleteReviewModal(selectedReview.id);
  });
}

// Sự kiện trong Modal Xác nhận Xóa Đánh giá
if (revDeleteModalClose) revDeleteModalClose.addEventListener("click", () => revDeleteModal.close());
if (revDeleteModalCancel) revDeleteModalCancel.addEventListener("click", () => revDeleteModal.close());
if (revDeleteModalSubmit) revDeleteModalSubmit.addEventListener("click", handleDeleteReviewSubmit);

// Đóng các modal địa điểm & đánh giá khi click vào vùng backdrop bên ngoài
[destFormModal, destDetailModal, destDeleteModal, revDetailModal, revDeleteModal].forEach((dialog) => {
  if (!dialog) return;
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX && event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) dialog.close();
    }
  });
});

// Đóng modal khi bấm vào vùng nền bên ngoài (Backdrop click)
[bookingDetailModal, rejectModal].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX && event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) dialog.close();
    }
  });
});


// ========================================================
// QUẢN LÝ TOUR DU LỊCH (Admin Tour Management)
// ========================================================

const panelTours = document.getElementById("panel-tours");
const badgeToursCount = document.getElementById("badge-tours-count");
const adminRefreshTours = document.getElementById("admin-refresh-tours");
const adminBtnAddTour = document.getElementById("admin-btn-add-tour");
const tourFilters = document.getElementById("admin-tour-filters");
const filterTourQ = document.getElementById("filter-tour-q");
const filterTourRegion = document.getElementById("filter-tour-region");
const filterTourStatus = document.getElementById("filter-tour-status");
const filterTourPrice = document.getElementById("filter-tour-price");
const filterTourSort = document.getElementById("filter-tour-sort");
const adminTourFilterReset = document.getElementById("admin-tour-filter-reset");

const statToursAll = document.getElementById("stat-tours-all");
const statToursActive = document.getElementById("stat-tours-active");
const statToursInactive = document.getElementById("stat-tours-inactive");

const toursLoading = document.getElementById("tours-loading");
const toursError = document.getElementById("tours-error");
const toursErrorMsg = document.getElementById("tours-error-msg");
const btnRetryTours = document.getElementById("btn-retry-tours");
const toursEmpty = document.getElementById("tours-empty");
const btnEmptyAddTour = document.getElementById("btn-empty-add-tour");
const toursTableWrapper = document.getElementById("tours-table-wrapper");
const adminToursTbody = document.getElementById("admin-tours-tbody");

// Tour Form Modal
const tourFormModal = document.getElementById("tour-form-modal");
const tourFormModalTitle = document.getElementById("tour-form-modal-title");
const tourFormModalClose = document.getElementById("tour-form-modal-close");
const tourFormModalCancel = document.getElementById("tour-form-modal-cancel");
const tourFormModalSubmit = document.getElementById("tour-form-modal-submit");
const tourFormSubmitText = document.getElementById("tour-form-submit-text");
const tourForm = document.getElementById("tour-form");
const tourFormError = document.getElementById("tour-form-error");
const tourFormErrorText = document.getElementById("tour-form-error-text");

const tourInputId = document.getElementById("tour-input-id");
const tourInputName = document.getElementById("tour-input-name");
const tourInputStatus = document.getElementById("tour-input-status");
const tourInputPlace = document.getElementById("tour-input-place");
const tourInputRegion = document.getElementById("tour-input-region");
const tourInputDuration = document.getElementById("tour-input-duration");
const tourInputPrice = document.getElementById("tour-input-price");
const tourInputMaxGuests = document.getElementById("tour-input-max-guests");
const tourInputImage = document.getElementById("tour-input-image");
const btnPreviewTourImage = document.getElementById("btn-preview-tour-image");
const tourImagePreviewBox = document.getElementById("tour-image-preview-box");
const tourImagePreviewImg = document.getElementById("tour-image-preview-img");
const tourInputDepartures = document.getElementById("tour-input-departures");
const tourInputItinerary = document.getElementById("tour-input-itinerary");
const tourItineraryCounter = document.getElementById("tour-itinerary-counter");

// Tour Detail Modal
const tourDetailModal = document.getElementById("tour-detail-modal");
const tourDetailModalClose = document.getElementById("tour-detail-modal-close");
const tourDetailTitle = document.getElementById("tour-detail-modal-title");
const tourDetailStatusBadge = document.getElementById("tour-detail-status-badge");
const tourDetailImage = document.getElementById("tour-detail-image");
const tourDetailCodeBadge = document.getElementById("tour-detail-code-badge");
const tourDetailPrice = document.getElementById("tour-detail-price");
const tourDetailDuration = document.getElementById("tour-detail-duration");
const tourDetailPlace = document.getElementById("tour-detail-place");
const tourDetailCapacity = document.getElementById("tour-detail-capacity");
const tourDetailRating = document.getElementById("tour-detail-rating");
const tourDetailBookingsCount = document.getElementById("tour-detail-bookings-count");
const tourDetailItineraryContent = document.getElementById("tour-detail-itinerary-content");
const tourDetailDeparturesChips = document.getElementById("tour-detail-departures-chips");
const tourDetailBookingsWrapper = document.getElementById("tour-detail-bookings-wrapper");
const tourDetailBookingsTotal = document.getElementById("tour-detail-bookings-total");
const tourDetailBookingsTbody = document.getElementById("tour-detail-bookings-tbody");
const tourDetailNoBookings = document.getElementById("tour-detail-no-bookings");
const tourDetailBtnEdit = document.getElementById("tour-detail-btn-edit");
const tourDetailBtnDelete = document.getElementById("tour-detail-btn-delete");
const tourDetailBtnClose = document.getElementById("tour-detail-btn-close");

// Tour Delete Modal
const tourDeleteModal = document.getElementById("tour-delete-modal");
const tourDeleteModalClose = document.getElementById("tour-delete-modal-close");
const tourDeleteModalCancel = document.getElementById("tour-delete-modal-cancel");
const tourDeleteModalSubmit = document.getElementById("tour-delete-modal-submit");
const tourDeleteBlockedBox = document.getElementById("tour-delete-blocked-box");
const tourDeleteBlockedMsg = document.getElementById("tour-delete-blocked-msg");
const tourDeleteConfirmBox = document.getElementById("tour-delete-confirm-box");
const tourDeleteName = document.getElementById("tour-delete-name");

let currentToursList = [];
let selectedTourDetail = null;
let deletingTourId = null;

function buildTourImg(image) {
  if (!image) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
    return image;
  }
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1200&q=85`;
}

async function loadTours() {
  if (!toursLoading) return;
  toursLoading.hidden = false;
  toursError.hidden = true;
  toursEmpty.hidden = true;
  toursTableWrapper.hidden = true;

  const params = new URLSearchParams();
  if (filterTourQ && filterTourQ.value.trim()) {
    params.set("q", filterTourQ.value.trim());
  }
  if (filterTourRegion && filterTourRegion.value) {
    params.set("region", filterTourRegion.value);
  }
  if (filterTourStatus && filterTourStatus.value && filterTourStatus.value !== "all") {
    params.set("status", filterTourStatus.value);
  }
  if (filterTourSort && filterTourSort.value && filterTourSort.value !== "default") {
    params.set("sort", filterTourSort.value);
  }

  // Price range mapping
  if (filterTourPrice && filterTourPrice.value) {
    if (filterTourPrice.value === "under-2m") {
      params.set("minPrice", "0");
      params.set("maxPrice", "2500000");
    } else if (filterTourPrice.value === "2m-5m") {
      params.set("minPrice", "2500000");
      params.set("maxPrice", "5000000");
    } else if (filterTourPrice.value === "above-5m") {
      params.set("minPrice", "5000001");
    }
  }

  try {
    const data = await requestJson(`/api/admin/tours?${params.toString()}`);
    toursLoading.hidden = true;
    currentToursList = data.tours || [];

    // Cập nhật thống kê nhanh
    if (statToursAll) statToursAll.textContent = data.counts?.all ?? data.total ?? currentToursList.length;
    if (statToursActive) statToursActive.textContent = data.counts?.active ?? 0;
    if (statToursInactive) statToursInactive.textContent = data.counts?.inactive ?? 0;
    if (badgeToursCount) badgeToursCount.textContent = data.counts?.all ?? data.total ?? currentToursList.length;

    // Cập nhật dropdown khu vực nếu chưa có options
    if (filterTourRegion && data.regions) {
      const currentSelected = filterTourRegion.value;
      const opts = ['<option value="">Tất cả khu vực</option>'];
      data.regions.forEach((r) => {
        opts.push(`<option value="${escapeHtml(r)}"${currentSelected === r ? " selected" : ""}>${escapeHtml(r)}</option>`);
      });
      filterTourRegion.innerHTML = opts.join("");
    }

    if (currentToursList.length === 0) {
      toursEmpty.hidden = false;
      return;
    }

    renderToursTable(currentToursList);
    toursTableWrapper.hidden = false;
  } catch (error) {
    toursLoading.hidden = true;
    toursErrorMsg.textContent = error.message || "Không thể tải danh sách Tour du lịch. Vui lòng thử lại.";
    toursError.hidden = false;
  }
}

function renderToursTable(tours) {
  if (!adminToursTbody) return;
  adminToursTbody.innerHTML = "";

  tours.forEach((tour) => {
    const tr = document.createElement("tr");

    const statusBadge = tour.status === "inactive"
      ? '<span class="tour-badge-inactive"><span class="status-indicator status-indicator--inactive"></span> Ngừng hoạt động</span>'
      : '<span class="tour-badge-active"><span class="status-indicator status-indicator--active"></span> Đang hoạt động</span>';

    const departuresDisplay = Array.isArray(tour.departures) && tour.departures.length > 0
      ? tour.departures.slice(0, 2).map((d) => `<span class="badge badge--pill" style="font-size: 11px;">${escapeHtml(d)}</span>`).join(" ") + (tour.departures.length > 2 ? ` <small class="text-muted">+ ${tour.departures.length - 2}</small>` : "")
      : '<span class="text-muted" style="font-size: 12px;">Chưa cập nhật</span>';

    const ratingDisplay = tour.reviewCount > 0
      ? `<span class="badge-rating"><span class="badge-star-icon">★</span>${tour.averageRating.toFixed(1)}</span> <small class="text-muted">(${tour.reviewCount})</small>`
      : '<span class="text-muted" style="font-size: 12px;">Chưa có</span>';

    const bookingsDisplay = tour.totalBookings > 0
      ? `<strong style="color: #057569;">${tour.totalBookings}</strong> <small class="text-muted">đơn (${tour.bookedCount || 0} khách)</small>`
      : '<span class="text-muted" style="font-size: 12px;">0 đơn</span>';

    tr.innerHTML = `
      <td>
        <div class="tour-table-title-cell">
          <img src="${buildTourImg(tour.image)}" alt="${escapeHtml(tour.name)}" class="tour-table-thumb" loading="lazy" />
          <div class="tour-title-info">
            <span class="tour-title-name">${escapeHtml(tour.name)}</span>
            <span class="tour-title-code">Mã: ${escapeHtml(tour.id)}</span>
            <div style="margin-top: 2px;">${departuresDisplay}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight: 600; color: #1f2937;">${escapeHtml(tour.place)}</div>
        <small class="text-muted">${escapeHtml(tour.region)}</small>
      </td>
      <td>
        <strong style="color: #057569; font-size: 14px;">${formatPrice(tour.price)}</strong>
      </td>
      <td>
        <div>${escapeHtml(tour.duration)}</div>
        <small class="text-muted">Tối đa: ${tour.maxGuests || 25} khách</small>
      </td>
      <td>
        <button type="button" class="btn-toggle-status" data-tour-id="${tour.id}" data-current-status="${tour.status}" title="Bấm để đổi trạng thái" style="background: none; border: none; padding: 0; cursor: pointer; text-align: left;">
          ${statusBadge}
        </button>
      </td>
      <td>
        <div>${bookingsDisplay}</div>
        <div style="margin-top: 3px;">${ratingDisplay}</div>
      </td>
      <td class="text-center">
        <div class="table-actions" style="justify-content: center; gap: 6px;">
          <button type="button" class="admin-action-button btn-view-tour" data-tour-id="${tour.id}" title="Xem chi tiết Tour">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Xem
          </button>
          <button type="button" class="admin-action-button btn-edit-tour" data-tour-id="${tour.id}" title="Sửa thông tin Tour">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Sửa
          </button>
          <button type="button" class="admin-action-button text-danger btn-delete-tour" data-tour-id="${tour.id}" title="Xóa Tour">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Xóa
          </button>
        </div>
      </td>
    `;

    adminToursTbody.appendChild(tr);
  });
}

// Mở modal Thêm Tour mới
function openCreateTourModal() {
  if (!tourFormModal) return;
  tourForm.reset();
  tourInputId.value = "";
  tourInputStatus.value = "active";
  tourInputMaxGuests.value = "25";
  tourFormError.hidden = true;
  tourFormModalTitle.textContent = "Thêm Tour du lịch mới";
  tourFormSubmitText.textContent = "Lưu Tour du lịch";
  if (tourImagePreviewBox) tourImagePreviewBox.hidden = true;
  if (tourItineraryCounter) tourItineraryCounter.textContent = "0/3000";

  tourFormModal.showModal();
}

// Mở modal Sửa Tour
async function openEditTourModal(tourId) {
  if (!tourFormModal) return;
  tourForm.reset();
  tourFormError.hidden = true;
  tourFormModalTitle.textContent = "Cập nhật Tour du lịch";
  tourFormSubmitText.textContent = "Lưu thay đổi";

  try {
    const data = await requestJson(`/api/admin/tours/${encodeURIComponent(tourId)}`);
    const tour = data.tour;
    if (!tour) throw new Error("Không tìm thấy dữ liệu Tour.");

    tourInputId.value = tour.id || "";
    tourInputName.value = tour.name || "";
    tourInputStatus.value = tour.status || "active";
    tourInputPlace.value = tour.place || "";
    tourInputRegion.value = tour.region || "";
    tourInputDuration.value = tour.duration || "";
    tourInputPrice.value = tour.price || "";
    tourInputMaxGuests.value = tour.maxGuests || 25;
    tourInputImage.value = tour.image || "";
    tourInputDepartures.value = Array.isArray(tour.departures) ? tour.departures.join(", ") : "";
    tourInputItinerary.value = tour.itinerary || "";

    if (tourItineraryCounter) {
      tourItineraryCounter.textContent = `${(tour.itinerary || "").length}/3000`;
    }

    if (tour.image && tourImagePreviewBox && tourImagePreviewImg) {
      tourImagePreviewImg.src = buildTourImg(tour.image);
      tourImagePreviewBox.hidden = false;
    } else if (tourImagePreviewBox) {
      tourImagePreviewBox.hidden = true;
    }

    tourFormModal.showModal();
  } catch (error) {
    showToast(error.message || "Không thể tải thông tin Tour.", "error");
  }
}

// Xử lý gửi biểu mẫu Thêm/Sửa Tour
async function handleTourFormSubmit(event) {
  event.preventDefault();
  tourFormError.hidden = true;

  const id = tourInputId.value.trim();
  const name = tourInputName.value.trim();
  const status = tourInputStatus.value;
  const place = tourInputPlace.value.trim();
  const region = tourInputRegion.value.trim();
  const duration = tourInputDuration.value.trim();
  const rawPrice = tourInputPrice.value.trim();
  const rawMaxGuests = tourInputMaxGuests.value.trim();
  const image = tourInputImage.value.trim();
  const rawDepartures = tourInputDepartures.value.trim();
  const itinerary = tourInputItinerary.value.trim();

  // Ngoại lệ 1: Thiếu thông tin bắt buộc
  if (!name || !place || !region || !duration || !rawPrice || !image || !rawDepartures || !itinerary) {
    tourFormErrorText.textContent = "Thiếu thông tin bắt buộc: Vui lòng nhập đầy đủ tên Tour, địa điểm, khu vực, thời gian, giá Tour, hình ảnh, ngày khởi hành và lịch trình.";
    tourFormError.hidden = false;
    return;
  }

  // Ngoại lệ 2: Giá Tour hoặc thời gian không hợp lệ
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0) {
    tourFormErrorText.textContent = "Giá Tour không hợp lệ: Giá Tour phải là số nguyên dương lớn hơn 0.";
    tourFormError.hidden = false;
    return;
  }

  const maxGuests = Number(rawMaxGuests) || 25;
  if (!Number.isFinite(maxGuests) || maxGuests < 1 || maxGuests > 200) {
    tourFormErrorText.textContent = "Số lượng khách tối đa không hợp lệ (phải từ 1 đến 200 khách).";
    tourFormError.hidden = false;
    return;
  }

  // Parse departures
  const departures = rawDepartures.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  for (const dep of departures) {
    if (!datePattern.test(dep) || Number.isNaN(Date.parse(dep))) {
      tourFormErrorText.textContent = `Ngày khởi hành "${dep}" không đúng định dạng YYYY-MM-DD.`;
      tourFormError.hidden = false;
      return;
    }
  }

  const payload = {
    name,
    status,
    place,
    region,
    duration,
    price,
    maxGuests,
    image,
    departures,
    itinerary,
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `/api/admin/tours/${encodeURIComponent(id)}` : "/api/admin/tours";
  const method = isEdit ? "PUT" : "POST";

  tourFormModalSubmit.disabled = true;
  tourFormSubmitText.textContent = "Đang lưu...";

  try {
    const data = await requestJson(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    tourFormModal.close();
    showToast(data.message || (isEdit ? "Cập nhật Tour du lịch thành công." : "Thêm Tour du lịch mới thành công."), "success");
    await loadTours();
  } catch (error) {
    tourFormErrorText.textContent = error.message || "Không thể lưu Tour du lịch. Vui lòng kiểm tra lại.";
    tourFormError.hidden = false;
  } finally {
    tourFormModalSubmit.disabled = false;
    tourFormSubmitText.textContent = isEdit ? "Lưu thay đổi" : "Lưu Tour du lịch";
  }
}

// Mở modal Xem chi tiết Tour
async function openTourDetailModal(tourId) {
  if (!tourDetailModal) return;

  try {
    const data = await requestJson(`/api/admin/tours/${encodeURIComponent(tourId)}`);
    const tour = data.tour;
    const bookings = data.bookings || [];
    selectedTourDetail = tour;

    tourDetailTitle.textContent = tour.name || "Chi tiết Tour";
    tourDetailCodeBadge.textContent = `Mã Tour: ${tour.id}`;
    tourDetailImage.src = buildTourImg(tour.image);

    if (tour.status === "inactive") {
      tourDetailStatusBadge.className = "tour-badge-inactive";
      tourDetailStatusBadge.innerHTML = '<span class="status-indicator status-indicator--inactive"></span> Ngừng hoạt động';
    } else {
      tourDetailStatusBadge.className = "tour-badge-active";
      tourDetailStatusBadge.innerHTML = '<span class="status-indicator status-indicator--active"></span> Đang hoạt động';
    }

    tourDetailPrice.textContent = formatPrice(tour.price);
    tourDetailDuration.textContent = tour.duration || "—";
    tourDetailPlace.textContent = `${tour.place}, ${tour.region}`;
    tourDetailCapacity.textContent = `Tối đa ${tour.maxGuests || 25} khách`;

    if (tour.reviewCount > 0) {
      tourDetailRating.innerHTML = `<span class="badge-rating"><span class="badge-star-icon">★</span>${tour.averageRating.toFixed(1)}</span> <span class="text-secondary" style="font-size: 13px;">(${tour.reviewCount} đánh giá)</span>`;
    } else {
      tourDetailRating.textContent = "Chưa có đánh giá";
    }

    tourDetailBookingsCount.textContent = `${bookings.length} đơn (${tour.bookedCount || 0} khách)`;
    tourDetailItineraryContent.textContent = tour.itinerary || "Chưa có thông tin lịch trình chi tiết.";

    // Render departure chips
    if (Array.isArray(tour.departures) && tour.departures.length > 0) {
      tourDetailDeparturesChips.innerHTML = tour.departures
        .map((d) => `<span class="tour-dep-chip">📅 ${escapeHtml(d)}</span>`)
        .join("");
    } else {
      tourDetailDeparturesChips.innerHTML = '<span class="text-muted" style="font-size: 13px;">Chưa có ngày khởi hành nào.</span>';
    }

    // Render bookings table
    tourDetailBookingsTotal.textContent = String(bookings.length);
    if (bookings.length > 0) {
      tourDetailBookingsTbody.innerHTML = bookings
        .map((b) => {
          let badgeClass = "badge-pending";
          let badgeText = "Chờ xác nhận";
          if (b.status === "confirmed") {
            badgeClass = "badge-confirmed";
            badgeText = "Đã xác nhận";
          } else if (b.status === "cancelled") {
            badgeClass = "badge-cancelled";
            badgeText = "Đã hủy";
          }

          return `
            <tr>
              <td><strong class="text-mono">${escapeHtml(b.code || b.id)}</strong></td>
              <td>${escapeHtml(b.customerName)}<br><small class="text-muted">${escapeHtml(b.phone || "")}</small></td>
              <td>${escapeHtml(b.departureDate)}</td>
              <td>${b.passengersCount} khách</td>
              <td><strong>${formatPrice(b.total)}</strong></td>
              <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            </tr>
          `;
        })
        .join("");
      tourDetailBookingsTable.hidden = false;
      tourDetailNoBookings.hidden = true;
    } else {
      tourDetailBookingsTbody.innerHTML = "";
      tourDetailBookingsTable.hidden = true;
      tourDetailNoBookings.hidden = false;
    }

    tourDetailModal.showModal();
  } catch (error) {
    showToast(error.message || "Không thể tải chi tiết Tour.", "error");
  }
}

// Mở modal Xác nhận xóa Tour (Xử lý Ngoại lệ 3: Chặn xóa nếu có đơn đặt)
async function openDeleteTourModal(tourId) {
  if (!tourDeleteModal) return;
  deletingTourId = tourId;

  try {
    const data = await requestJson(`/api/admin/tours/${encodeURIComponent(tourId)}`);
    const tour = data.tour;
    const bookings = data.bookings || [];

    tourDeleteName.textContent = tour.name;

    // Ngoại lệ 3: Tour đã có đơn đặt: Chặn xóa và hiển thị thông báo
    if (bookings.length > 0) {
      tourDeleteBlockedBox.hidden = false;
      tourDeleteConfirmBox.hidden = true;
      const codes = bookings.map((b) => b.code || b.id).slice(0, 5).join(", ") + (bookings.length > 5 ? "..." : "");
      tourDeleteBlockedMsg.textContent = `Tour "${tour.name}" hiện đang có ${bookings.length} đơn đặt tour liên kết (Mã: ${codes}). Vui lòng kiểm tra và xử lý hoặc hủy các đơn liên quan trước khi xóa tour này.`;
      tourDeleteModalSubmit.hidden = true;
      tourDeleteModalCancel.textContent = "Đóng";
    } else {
      tourDeleteBlockedBox.hidden = true;
      tourDeleteConfirmBox.hidden = false;
      tourDeleteModalSubmit.hidden = false;
      tourDeleteModalCancel.textContent = "Hủy bỏ";
    }

    tourDeleteModal.showModal();
  } catch (error) {
    showToast(error.message || "Không thể kiểm tra dữ liệu xóa Tour.", "error");
  }
}

// Xử lý xác nhận xóa Tour
async function handleDeleteTourSubmit() {
  if (!deletingTourId) return;

  tourDeleteModalSubmit.disabled = true;
  try {
    const data = await requestJson(`/api/admin/tours/${encodeURIComponent(deletingTourId)}`, {
      method: "DELETE",
    });

    tourDeleteModal.close();
    if (tourDetailModal && tourDetailModal.open) {
      tourDetailModal.close();
    }

    showToast(data.message || "Đã xóa vĩnh viễn Tour du lịch thành công.", "success");
    await loadTours();
  } catch (error) {
    showToast(error.message || "Không thể xóa Tour du lịch.", "error");
    if (error.status === 409) {
      tourDeleteBlockedBox.hidden = false;
      tourDeleteConfirmBox.hidden = true;
      tourDeleteBlockedMsg.textContent = error.message;
      tourDeleteModalSubmit.hidden = true;
      tourDeleteModalCancel.textContent = "Đóng";
    }
  } finally {
    tourDeleteModalSubmit.disabled = false;
  }
}

// Toggle nhanh trạng thái tour (active <-> inactive)
async function toggleTourStatus(tourId, currentStatus) {
  const newStatus = currentStatus === "active" ? "inactive" : "active";
  try {
    const data = await requestJson(`/api/admin/tours/${encodeURIComponent(tourId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    showToast(data.message || "Đã cập nhật trạng thái tour.", "success");
    await loadTours();
  } catch (error) {
    showToast(error.message || "Không thể đổi trạng thái tour.", "error");
  }
}


// ========================================================
// SỰ KIỆN QUẢN LÝ TOUR DU LỊCH
// ========================================================

if (adminRefreshTours) {
  adminRefreshTours.addEventListener("click", () => {
    loadTours();
    showToast("Đã làm mới danh sách Tour du lịch.", "info");
  });
}
if (adminBtnAddTour) {
  adminBtnAddTour.addEventListener("click", openCreateTourModal);
}
if (btnEmptyAddTour) {
  btnEmptyAddTour.addEventListener("click", openCreateTourModal);
}
if (btnRetryTours) {
  btnRetryTours.addEventListener("click", () => loadTours());
}

if (tourFilters) {
  tourFilters.addEventListener("submit", (event) => {
    event.preventDefault();
    loadTours();
  });
}
if (adminTourFilterReset) {
  adminTourFilterReset.addEventListener("click", () => {
    tourFilters.reset();
    document.querySelectorAll(".quick-stat-pill").forEach((p) => p.classList.remove("is-active-pill"));
    const allPill = document.querySelector('.quick-stat-pill[data-status-filter="all"]');
    if (allPill) allPill.classList.add("is-active-pill");
    loadTours();
  });
}

// Bấm vào quick stat pill để lọc theo trạng thái
document.querySelectorAll(".quick-stat-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".quick-stat-pill").forEach((p) => p.classList.remove("is-active-pill"));
    pill.classList.add("is-active-pill");
    const st = pill.dataset.statusFilter;
    if (filterTourStatus) {
      filterTourStatus.value = st;
      loadTours();
    }
  });
});

// Xem trước ảnh tour
if (btnPreviewTourImage && tourInputImage && tourImagePreviewBox && tourImagePreviewImg) {
  btnPreviewTourImage.addEventListener("click", () => {
    const val = tourInputImage.value.trim();
    if (!val) {
      tourImagePreviewBox.hidden = true;
      return;
    }
    tourImagePreviewImg.src = buildTourImg(val);
    tourImagePreviewBox.hidden = false;
  });
}

// Counter đếm ký tự lịch trình
if (tourInputItinerary && tourItineraryCounter) {
  tourInputItinerary.addEventListener("input", () => {
    tourItineraryCounter.textContent = `${tourInputItinerary.value.length}/3000`;
  });
}

// Sự kiện biểu mẫu Tour
if (tourForm) tourForm.addEventListener("submit", handleTourFormSubmit);
if (tourFormModalClose) tourFormModalClose.addEventListener("click", () => tourFormModal.close());
if (tourFormModalCancel) tourFormModalCancel.addEventListener("click", () => tourFormModal.close());

// Sự kiện bảng Tour (Xem, Sửa, Xóa, Toggle status)
if (adminToursTbody) {
  adminToursTbody.addEventListener("click", (event) => {
    const viewBtn = event.target.closest(".btn-view-tour");
    if (viewBtn) {
      openTourDetailModal(viewBtn.dataset.tourId);
      return;
    }
    const editBtn = event.target.closest(".btn-edit-tour");
    if (editBtn) {
      openEditTourModal(editBtn.dataset.tourId);
      return;
    }
    const deleteBtn = event.target.closest(".btn-delete-tour");
    if (deleteBtn) {
      openDeleteTourModal(deleteBtn.dataset.tourId);
      return;
    }
    const toggleBtn = event.target.closest(".btn-toggle-status");
    if (toggleBtn) {
      toggleTourStatus(toggleBtn.dataset.tourId, toggleBtn.dataset.currentStatus);
      return;
    }
  });
}

// Sự kiện Modal Chi tiết Tour
if (tourDetailModalClose) tourDetailModalClose.addEventListener("click", () => tourDetailModal.close());
if (tourDetailBtnClose) tourDetailBtnClose.addEventListener("click", () => tourDetailModal.close());
if (tourDetailBtnEdit) {
  tourDetailBtnEdit.addEventListener("click", () => {
    if (selectedTourDetail) {
      tourDetailModal.close();
      openEditTourModal(selectedTourDetail.id);
    }
  });
}
if (tourDetailBtnDelete) {
  tourDetailBtnDelete.addEventListener("click", () => {
    if (selectedTourDetail) {
      openDeleteTourModal(selectedTourDetail.id);
    }
  });
}

// Sự kiện Modal Xóa Tour
if (tourDeleteModalClose) tourDeleteModalClose.addEventListener("click", () => tourDeleteModal.close());
if (tourDeleteModalCancel) tourDeleteModalCancel.addEventListener("click", () => tourDeleteModal.close());
if (tourDeleteModalSubmit) tourDeleteModalSubmit.addEventListener("click", handleDeleteTourSubmit);

// Đóng các modal tour khi click vào vùng backdrop bên ngoài
[tourFormModal, tourDetailModal, tourDeleteModal].forEach((dialog) => {
  if (!dialog) return;
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX && event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) dialog.close();
    }
  });
});


// Bấm vào ảnh bìa để mở ảnh kích thước đầy đủ
const destDetailHeroBox = document.getElementById("dest-detail-hero-box");
if (destDetailHeroBox && destDetailImage) {
  destDetailHeroBox.addEventListener("click", () => {
    if (destDetailImage.src) window.open(destDetailImage.src, "_blank");
  });
}
const tourDetailBannerBox = document.getElementById("tour-detail-banner-box");
if (tourDetailBannerBox && tourDetailImage) {
  tourDetailBannerBox.addEventListener("click", () => {
    if (tourDetailImage.src) window.open(tourDetailImage.src, "_blank");
  });
}

// Inquiries Actions
inquiryList.addEventListener("click", async (event) => {
  const btn = event.target.closest("[data-resolve-inquiry]");
  if (!btn) return;
  const id = btn.dataset.resolveInquiry;
  btn.disabled = true;
  try {
    await requestJson(`/api/admin/inquiries/${encodeURIComponent(id)}/resolve`, { method: "PATCH" });
    showToast("Đã đánh dấu biểu mẫu liên hệ là đã xử lý.", "success");
    await loadInquiries();
  } catch (error) {
    showToast(error.message || "Lỗi xử lý biểu mẫu liên hệ.", "error");
    btn.disabled = false;
  }
});

// Customer Create Form
createCustomerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitBtn = createCustomerForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    const payload = Object.fromEntries(new FormData(createCustomerForm).entries());
    await requestJson("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showToast("Đã tạo tài khoản khách hàng thành công.", "success");
    createCustomerForm.reset();
    await loadCustomers();
  } catch (error) {
    showToast(error.message || "Không thể tạo tài khoản khách hàng.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

// Customer Edit Form
customerList.addEventListener("submit", async (event) => {
  const form = event.target.closest(".admin-customer-edit");
  if (!form) return;
  event.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    const id = form.dataset.customerId;
    const payload = Object.fromEntries(new FormData(form).entries());
    await requestJson(`/api/admin/customers/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showToast("Đã cập nhật tài khoản khách hàng.", "success");
    await loadCustomers();
  } catch (error) {
    showToast(error.message || "Không thể cập nhật tài khoản.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

// Customer Delete
customerList.addEventListener("click", async (event) => {
  const btn = event.target.closest("[data-delete-customer]");
  if (!btn) return;
  const id = btn.dataset.deleteCustomer;
  if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản khách hàng này?")) return;
  btn.disabled = true;
  try {
    await requestJson(`/api/admin/customers/${encodeURIComponent(id)}`, { method: "DELETE" });
    showToast("Đã xóa tài khoản khách hàng.", "success");
    await loadCustomers();
  } catch (error) {
    showToast(error.message || "Không thể xóa tài khoản.", "error");
    btn.disabled = false;
  }
});

// Export PDF / Print
exportPdfBtn.addEventListener("click", printTourPassengers);
window.addEventListener("afterprint", () => {
  printArea.hidden = true;
  printArea.replaceChildren();
});

// Logout
adminLogoutBtn.addEventListener("click", async () => {
  if (!window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?")) return;
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/admin-login.html");
  } catch {
    window.location.assign("/admin-login.html");
  }
});

// Start
initialize();
