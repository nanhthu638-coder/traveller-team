// ========================================================
// TRANG QUẢN TRỊ ADMIN - TRAVELLER TEAM
// Chức năng: Quản lý đặt Tour → Đơn đặt Tour mới
// ========================================================

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
const modalProcessedAlert = document.getElementById("modal-processed-alert");
const modalProcessedText = document.getElementById("modal-processed-text");
const modalFooterHint = document.getElementById("modal-footer-status-hint");

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

    bcParent.textContent = "Tiện ích quản trị";
    bcChild.textContent = "Biểu mẫu liên hệ";
    viewTitle.textContent = "Biểu mẫu liên hệ";
    viewSubtitle.textContent = "Xử lý thắc mắc và yêu cầu tư vấn gửi từ trang liên hệ của khách hàng.";
    loadInquiries();
  } else if (tab === "customers") {
    panelBookings.hidden = true;
    panelInquiries.hidden = true;
    panelCustomers.hidden = false;

    bcParent.textContent = "Tiện ích quản trị";
    bcChild.textContent = "Quản lý khách hàng";
    viewTitle.textContent = "Quản lý khách hàng";
    viewSubtitle.textContent = "Danh sách tài khoản khách hàng, thêm mới hoặc điều chỉnh thông tin.";
    loadCustomers();
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
    const statusLabelText = statusLabels[booking.status] || booking.status;
    const statusClass = statusClasses[booking.status] || "is-pending";
    const paymentText = paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus;
    const guests = guestCountSummary(booking.passengers);

    const contactName = escapeHtml(booking.contact?.name || "Khách hàng");
    const contactEmail = escapeHtml(booking.contact?.email || "—");
    const contactPhone = escapeHtml(booking.contact?.phone || "Chưa có SĐT");
    const tourName = escapeHtml(booking.tour?.name || "Tour du lịch");
    const tourPlace = escapeHtml(booking.tour?.place || "");

    // Ngoại lệ 2: Đơn đã được xử lý: Không cho phép xác nhận lại
    const actionsHtml = isPending
      ? `
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
        </div>`
      : `
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
    modalProcessedText.textContent = `Đơn đặt tour này đã được xử lý (${statusLabels[booking.status] || booking.status}). Không cho phép xác nhận hoặc từ chối lại.`;
    modalBtnConfirm.disabled = true;
    modalBtnConfirm.classList.add("btn-disabled");
    modalBtnConfirm.hidden = true;
    modalBtnReject.disabled = true;
    modalBtnReject.classList.add("btn-disabled");
    modalBtnReject.hidden = true;
    modalFooterHint.textContent = "Đơn đã kết thúc xử lý.";
  } else {
    modalProcessedAlert.hidden = true;
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
    } catch {
      // Bỏ qua lỗi load tour options
    }

    // Bắt đầu tại tab "Đơn đặt Tour mới"
    switchTab("new-bookings");
  } catch (error) {
    adminInitialState.hidden = true;
    adminForbiddenBox.hidden = false;
    document.getElementById("admin-forbidden-msg").textContent = error.message || "Lỗi kiểm tra phiên đăng nhập.";
  } finally {
    adminMain.setAttribute("aria-busy", "false");
  }
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

// Reject Modal Actions
rejectModalClose.addEventListener("click", () => rejectModal.close());
rejectModalCancel.addEventListener("click", () => rejectModal.close());
rejectModalForm.addEventListener("submit", handleRejectSubmit);

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
