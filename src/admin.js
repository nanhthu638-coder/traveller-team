const status = document.getElementById("admin-status");
const content = document.getElementById("admin-content");
const bookingList = document.getElementById("admin-bookings");
const inquiryList = document.getElementById("admin-inquiries");
const customerList = document.getElementById("admin-customers");
const bookingFilters = document.getElementById("admin-booking-filters");
const createCustomerForm = document.getElementById("admin-customer-create");
const printArea = document.getElementById("admin-print-area");
const bookingStatusLabels = {
  pending: "Chờ duyệt",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};
const passengerTypeLabels = { adult: "Người lớn", child: "Trẻ em", infant: "Em bé" };
let tours = [];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function showStatus(message, isError = false) {
  status.textContent = message;
  status.className = `admin-status ${isError ? "is-error" : ""}`;
  status.hidden = !message;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "Không thể hoàn tất yêu cầu.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("vi-VN");
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
}

function renderBookings(bookings) {
  if (!bookings.length) {
    bookingList.innerHTML = '<p class="admin-empty">Không có đơn đặt tour phù hợp.</p>';
    return;
  }
  bookingList.innerHTML = bookings.map((booking) => {
    const cancellation = booking.cancellationRequest;
    const passengers = Array.isArray(booking.passengerDetails) ? booking.passengerDetails : [];
    const guestCount = Object.values(booking.passengers || {}).reduce((sum, count) => sum + Number(count || 0), 0);
    return `
      <article class="admin-card">
        <div class="admin-card-heading">
          <div><h3>${escapeHtml(booking.tour?.name)} · ${escapeHtml(booking.code)}</h3>
            <p>${escapeHtml(booking.contact?.name)} · <a href="mailto:${escapeHtml(booking.contact?.email)}">${escapeHtml(booking.contact?.email)}</a> · ${escapeHtml(booking.contact?.phone || "Chưa có SĐT")}</p></div>
          <span class="admin-badge">${escapeHtml(bookingStatusLabels[booking.status] || booking.status)}</span>
        </div>
        <dl class="admin-booking-details">
          <div><dt>Khởi hành</dt><dd>${escapeHtml(formatDate(booking.departureDate))}</dd></div>
          <div><dt>Số khách</dt><dd>${guestCount}</dd></div>
          <div><dt>Thanh toán</dt><dd>${escapeHtml(booking.paymentStatus || "—")}</dd></div>
          <div><dt>Tổng tiền</dt><dd>${Number(booking.total || 0).toLocaleString("vi-VN")} ₫</dd></div>
        </dl>
        ${booking.note ? `<p class="admin-note"><strong>Ghi chú:</strong> ${escapeHtml(booking.note)}</p>` : ""}
        ${passengers.length ? `<details class="admin-passenger-details"><summary>Thông tin hành khách (${passengers.length})</summary><ul>${passengers.map((person) => `<li>${escapeHtml(person.fullName)} · ${escapeHtml(passengerTypeLabels[person.type] || person.type)} · ${escapeHtml(person.gender || "—")} · ${escapeHtml(formatDate(person.dob))}${person.idNumber ? ` · Giấy tờ ${escapeHtml(person.idNumber)}` : ""}</li>`).join("")}</ul></details>` : ""}
        ${cancellation ? `<p class="admin-cancellation-note"><strong>Yêu cầu hủy:</strong> ${escapeHtml(cancellation.status === "pending" ? "Chờ xử lý" : cancellation.status === "approved" ? "Đã duyệt" : "Đã từ chối")} · ${escapeHtml(formatDateTime(cancellation.requestedAt))}${cancellation.reason ? `<br />Lý do: ${escapeHtml(cancellation.reason)}` : ""}</p>` : ""}
        <div class="admin-card-actions">
          ${booking.status === "pending" ? `
            <button class="admin-primary-button" type="button" data-booking-status="confirmed" data-booking-id="${escapeHtml(booking.id)}">Duyệt đơn</button>
            <button class="admin-danger-button admin-cancel-booking-button" type="button" data-booking-cancel="${escapeHtml(booking.id)}">Hủy đơn</button>
          ` : ""}
          ${booking.status === "confirmed" ? `<button class="admin-secondary-button" type="button" data-booking-status="completed" data-booking-id="${escapeHtml(booking.id)}">Đánh dấu hoàn tất</button>` : ""}
          ${cancellation?.status === "pending" ? `
            <button class="admin-primary-button" type="button" data-cancellation-decision="approved" data-booking-id="${escapeHtml(booking.id)}">Duyệt hủy</button>
            <button class="admin-danger-button" type="button" data-cancellation-decision="rejected" data-booking-id="${escapeHtml(booking.id)}">Từ chối hủy</button>
          ` : ""}
        </div>
      </article>`;
  }).join("");
}

async function loadBookings() {
  const params = new URLSearchParams(new FormData(bookingFilters));
  for (const [key, value] of [...params.entries()]) if (!value.trim()) params.delete(key);
  const { bookings } = await requestJson(`/api/admin/bookings?${params}`);
  renderBookings(bookings);
}

function renderInquiries(inquiries) {
  if (!inquiries.length) {
    inquiryList.innerHTML = '<p class="admin-empty">Chưa có biểu mẫu liên hệ nào.</p>';
    return;
  }
  inquiryList.innerHTML = inquiries.map((inquiry) => `
    <article class="admin-card">
      <div class="admin-card-heading">
        <div><h3>${escapeHtml(inquiry.topic)}</h3>
          <p>${escapeHtml(inquiry.name)} · <a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></p></div>
        <span class="admin-badge ${inquiry.status === "resolved" ? "is-resolved" : ""}">${inquiry.status === "resolved" ? "Đã xử lý" : "Chưa xử lý"}</span>
      </div>
      <p class="admin-inquiry-message">${escapeHtml(inquiry.message)}</p>
      <p class="admin-card-date">Gửi lúc ${escapeHtml(formatDateTime(inquiry.createdAt))} · Mã ${escapeHtml(inquiry.id)}</p>
      ${inquiry.status === "resolved" ? `<p class="admin-card-date">Đã xử lý lúc ${escapeHtml(formatDateTime(inquiry.resolvedAt))}</p>` : `<button class="admin-primary-button" type="button" data-resolve-inquiry="${escapeHtml(inquiry.id)}">Đánh dấu đã xử lý</button>`}
    </article>
  `).join("");
}

function renderCustomers(customers) {
  if (!customers.length) {
    customerList.innerHTML = '<p class="admin-empty">Chưa có tài khoản khách hàng.</p>';
    return;
  }
  customerList.innerHTML = customers.map((customer) => `
    <article class="admin-card">
      <form class="admin-customer-edit" data-customer-id="${escapeHtml(customer.id)}">
        <h3>${escapeHtml(customer.name)}</h3>
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

async function loadInquiries() {
  const { inquiries } = await requestJson("/api/admin/inquiries");
  renderInquiries(inquiries);
}

async function loadCustomers() {
  const { customers } = await requestJson("/api/admin/customers");
  renderCustomers(customers);
}

async function loadAll() {
  await Promise.all([loadBookings(), loadInquiries(), loadCustomers()]);
  showStatus("Dữ liệu quản trị đã được tải.");
}

async function postJson(url, method, body) {
  return requestJson(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function printPassengerRows(booking) {
  const passengers = Array.isArray(booking.passengerDetails) ? booking.passengerDetails : [];
  if (!passengers.length) return '<p>Đơn cũ chưa lưu thông tin chi tiết từng hành khách.</p>';
  return `<table class="admin-print-passengers"><thead><tr><th>Họ tên</th><th>Loại khách</th><th>Giới tính</th><th>Ngày sinh</th><th>Giấy tờ</th></tr></thead><tbody>${passengers.map((person) => `
    <tr>
      <td>${escapeHtml(person.fullName)}</td>
      <td>${escapeHtml(passengerTypeLabels[person.type] || person.type)}</td>
      <td>${escapeHtml(person.gender || "—")}</td>
      <td>${escapeHtml(formatDate(person.dob))}</td>
      <td>${escapeHtml(person.idNumber || "—")}</td>
    </tr>`).join("")}</tbody></table>`;
}

async function printTourPassengers() {
  const tourId = bookingFilters.elements.tourId.value;
  if (!tourId) {
    showStatus("Chọn một tour cụ thể trước khi xuất danh sách khách.", true);
    return;
  }
  const button = document.getElementById("admin-export-pdf");
  button.disabled = true;
  try {
    const { bookings } = await requestJson(`/api/admin/bookings?tourId=${encodeURIComponent(tourId)}`);
    const tour = tours.find((item) => item.id === tourId);
    const activeBookings = bookings.filter((booking) => booking.status !== "cancelled");
    printArea.innerHTML = `
      <h1>Danh sách khách hàng theo tour</h1>
      <h2>${escapeHtml(tour?.name || "Tour")}</h2>
      <p>Ngày xuất: ${escapeHtml(new Date().toLocaleString("vi-VN"))} · Tổng đơn: ${activeBookings.length}</p>
      ${activeBookings.length ? activeBookings.map((booking) => `
        <article class="admin-print-booking">
          <h3>${escapeHtml(booking.code)} · ${escapeHtml(bookingStatusLabels[booking.status] || booking.status)}</h3>
          <p><strong>Người đặt:</strong> ${escapeHtml(booking.contact?.name)} · ${escapeHtml(booking.contact?.email)} · ${escapeHtml(booking.contact?.phone || "Chưa có SĐT")}</p>
          <p><strong>Khởi hành:</strong> ${escapeHtml(formatDate(booking.departureDate))} · <strong>Số khách:</strong> ${Object.values(booking.passengers || {}).reduce((sum, count) => sum + Number(count || 0), 0)}</p>
          ${booking.note ? `<p><strong>Ghi chú:</strong> ${escapeHtml(booking.note)}</p>` : ""}
          ${printPassengerRows(booking)}
        </article>`).join("") : "<p>Tour này chưa có khách đặt.</p>"}
    `;
    printArea.hidden = false;
    window.print();
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function initialize() {
  try {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể kiểm tra phiên đăng nhập.");
    if (!data.user) {
      window.location.replace("/admin-login.html");
      return;
    }
    if (data.user.role !== "admin") {
      showStatus("Tài khoản này không có quyền truy cập trang quản trị.", true);
      return;
    }
    document.getElementById("admin-name").textContent = data.user.name;
    content.hidden = false;
    const tourData = await requestJson("/api/admin/tours");
    tours = tourData.tours;
    const tourSelect = bookingFilters.elements.tourId;
    tourSelect.insertAdjacentHTML("beforeend", tours.map((tour) => `<option value="${escapeHtml(tour.id)}">${escapeHtml(tour.name)}</option>`).join(""));
    await loadAll();
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng thử lại." : error.message, true);
  } finally {
    document.getElementById("admin-main").setAttribute("aria-busy", "false");
  }
}

bookingFilters.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await loadBookings();
    showStatus("Đã cập nhật danh sách đơn.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  }
});

document.getElementById("admin-refresh").addEventListener("click", async () => {
  try {
    await loadAll();
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  }
});

document.getElementById("admin-export-pdf").addEventListener("click", printTourPassengers);

document.getElementById("admin-logout").addEventListener("click", async () => {
  try {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("Không thể đăng xuất quản trị.");
    window.location.assign("/admin-login.html");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  }
});

bookingList.addEventListener("click", async (event) => {
  const statusButton = event.target.closest("[data-booking-status]");
  const cancelBookingButton = event.target.closest("[data-booking-cancel]");
  const cancellationButton = event.target.closest("[data-cancellation-decision]");
  if (!statusButton && !cancelBookingButton && !cancellationButton) return;
  const button = statusButton || cancelBookingButton || cancellationButton;
  if (cancelBookingButton && !window.confirm("Bạn có chắc muốn hủy đơn này? Nếu khách đã thanh toán, khoản tiền cần được xử lý hoàn riêng.")) return;
  button.disabled = true;
  try {
    const bookingId = encodeURIComponent(button.dataset.bookingId || cancelBookingButton?.dataset.bookingCancel);
    if (statusButton) {
      await postJson(`/api/admin/bookings/${bookingId}/status`, "PATCH", { status: statusButton.dataset.bookingStatus });
    } else if (cancelBookingButton) {
      await postJson(`/api/admin/bookings/${bookingId}/status`, "PATCH", { status: "cancelled" });
    } else {
      const decision = cancellationButton.dataset.cancellationDecision;
      const verb = decision === "approved" ? "duyệt hủy" : "từ chối yêu cầu hủy";
      if (!window.confirm(`Bạn có chắc muốn ${verb} đơn này?`)) return;
      await postJson(`/api/admin/bookings/${bookingId}/cancellation`, "PATCH", { decision });
    }
    await loadBookings();
    showStatus("Đã cập nhật đơn đặt tour.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    button.disabled = false;
  }
});

inquiryList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-resolve-inquiry]");
  if (!button) return;
  button.disabled = true;
  try {
    await postJson(`/api/admin/inquiries/${encodeURIComponent(button.dataset.resolveInquiry)}/resolve`, "PATCH");
    await loadInquiries();
    showStatus("Đã đánh dấu biểu mẫu là đã xử lý.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    button.disabled = false;
  }
});

createCustomerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = createCustomerForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await postJson("/api/admin/customers", "POST", Object.fromEntries(new FormData(createCustomerForm).entries()));
    createCustomerForm.reset();
    await loadCustomers();
    showStatus("Đã tạo tài khoản khách hàng.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    button.disabled = false;
  }
});

customerList.addEventListener("submit", async (event) => {
  const form = event.target.closest(".admin-customer-edit");
  if (!form) return;
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await postJson(`/api/admin/customers/${encodeURIComponent(form.dataset.customerId)}`, "PUT", Object.fromEntries(new FormData(form).entries()));
    await loadCustomers();
    showStatus("Đã cập nhật tài khoản khách hàng.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    button.disabled = false;
  }
});

customerList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-customer]");
  if (!button || !window.confirm("Xóa tài khoản này? Các đơn đặt tour và lịch sử liên quan được giữ lại.")) return;
  button.disabled = true;
  try {
    await postJson(`/api/admin/customers/${encodeURIComponent(button.dataset.deleteCustomer)}`, "DELETE");
    await loadCustomers();
    showStatus("Đã xóa tài khoản khách hàng.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    button.disabled = false;
  }
});

window.addEventListener("afterprint", () => {
  printArea.hidden = true;
  printArea.replaceChildren();
});

initialize();
