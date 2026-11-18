// Menu tài khoản (avatar) dùng chung cho mọi trang: Lịch sử đặt tour + Đăng xuất.
// Markup được chèn vào cuối `.site-nav` để các trang không phải chép lại HTML.

import { subscribeRealtime } from "./realtime.js";

const HISTORY_URL = "/booking-history.html";
let root = null;
let guestLinks = [];
let accountUserId = null;
let notificationLoadSequence = 0;

const MENU_HTML = `
  <div class="account-notifications">
    <button class="notification-trigger" type="button" aria-label="Thông báo" aria-expanded="false" aria-controls="notification-panel">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
      <span class="notification-count" data-notification-count hidden></span>
    </button>
    <section class="notification-panel" id="notification-panel" aria-label="Thông báo biểu mẫu" hidden>
      <h2>Biểu mẫu đã xử lý</h2>
      <div class="notification-list" data-notification-list aria-live="polite">
        <p class="notification-empty">Đang tải thông báo...</p>
      </div>
    </section>
  </div>
  <button class="account-trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="account-dropdown">
    <span class="account-avatar" data-account-avatar aria-hidden="true"><span data-account-initial></span><img alt="" hidden /></span>
    <span class="account-name" data-account-name></span>
    <span class="account-caret" aria-hidden="true">▾</span>
  </button>
  <div class="account-dropdown" id="account-dropdown" role="menu" hidden>
    <div class="account-dropdown-head">
      <strong data-account-fullname></strong>
      <span data-account-email></span>
    </div>
    <a class="account-item" role="menuitem" href="${HISTORY_URL}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2V5a1 1 0 0 1 1-1Z"/><path d="M9.5 9h5M9.5 12.5h5"/></svg>
      Lịch sử đặt tour
    </a>
    <a class="account-item" role="menuitem" href="/profile.html">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.3 3.2-5 7-5s6.3 1.7 7 5"/></svg>
      Hồ sơ cá nhân
    </a>
    <a class="account-item" role="menuitem" href="/admin.html" data-admin-link hidden>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></svg>
      Trang quản trị
    </a>
    <button class="account-item" role="menuitem" type="button" data-account-logout>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M15 8l4 4-4 4M19 12H10"/></svg>
      Đăng xuất
    </button>
  </div>`;

function initialOf(name) {
  const lastWord = String(name || "").trim().split(/\s+/).pop() || "?";
  return lastWord.charAt(0).toUpperCase();
}

function setOpen(open) {
  if (!root) return;
  root.querySelector(".account-trigger").setAttribute("aria-expanded", String(open));
  root.querySelector(".account-dropdown").hidden = !open;
}

function setNotificationsOpen(open) {
  if (!root) return;
  root.querySelector(".notification-trigger").setAttribute("aria-expanded", String(open));
  root.querySelector(".notification-panel").hidden = !open;
}

function renderNotifications(inquiries) {
  if (!root) return;
  const resolved = inquiries.filter((inquiry) => inquiry.status === "resolved");
  const count = root.querySelector("[data-notification-count]");
  count.textContent = resolved.length > 99 ? "99+" : String(resolved.length);
  count.hidden = resolved.length === 0;
  root.querySelector(".notification-trigger").setAttribute(
    "aria-label",
    resolved.length ? `Thông báo, ${resolved.length} biểu mẫu đã xử lý` : "Thông báo",
  );

  const list = root.querySelector("[data-notification-list]");
  list.replaceChildren();
  if (!resolved.length) {
    const empty = document.createElement("p");
    empty.className = "notification-empty";
    empty.textContent = "Chưa có biểu mẫu nào được xử lý.";
    list.append(empty);
    return;
  }

  for (const inquiry of resolved) {
    const item = document.createElement("article");
    item.className = "notification-item";
    const heading = document.createElement("strong");
    heading.textContent = inquiry.topic || "Biểu mẫu liên hệ";
    const reference = document.createElement("p");
    reference.className = "notification-reference";
    reference.textContent = `Mã biểu mẫu: ${inquiry.id}`;
    const message = document.createElement("p");
    message.className = "notification-message";
    message.textContent = inquiry.message;
    const resolvedAt = document.createElement("time");
    resolvedAt.className = "notification-date";
    if (inquiry.resolvedAt) {
      resolvedAt.dateTime = inquiry.resolvedAt;
      resolvedAt.textContent = `Đã xử lý: ${new Date(inquiry.resolvedAt).toLocaleString("vi-VN")}`;
    } else {
      resolvedAt.textContent = "Đã xử lý";
    }
    item.append(heading, reference, message, resolvedAt);
    list.append(item);
  }

  const profileLink = document.createElement("a");
  profileLink.className = "notification-profile-link";
  profileLink.href = "/profile.html";
  profileLink.textContent = "Xem tất cả biểu mẫu";
  list.append(profileLink);
}

async function loadInquiryNotifications() {
  if (!accountUserId || !root) return;
  const sequence = ++notificationLoadSequence;
  const list = root.querySelector("[data-notification-list]");
  list.replaceChildren();
  const loading = document.createElement("p");
  loading.className = "notification-empty";
  loading.textContent = "Đang tải thông báo...";
  list.append(loading);

  try {
    const response = await fetch("/api/inquiries/mine");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể tải thông báo.");
    if (!Array.isArray(data.inquiries)) throw new Error("Dữ liệu thông báo không hợp lệ.");
    if (sequence !== notificationLoadSequence || !accountUserId) return;
    renderNotifications(data.inquiries);
  } catch (error) {
    if (sequence !== notificationLoadSequence || !accountUserId) return;
    list.replaceChildren();
    const errorMessage = document.createElement("p");
    errorMessage.className = "notification-error";
    errorMessage.textContent = error instanceof TypeError ? "Không thể kết nối máy chủ để tải thông báo." : error.message;
    const retry = document.createElement("button");
    retry.className = "notification-retry";
    retry.type = "button";
    retry.textContent = "Thử lại";
    retry.addEventListener("click", loadInquiryNotifications);
    list.append(errorMessage, retry);
  }
}

/** Chèn menu (và, nếu cần, nút Đăng nhập/Tạo tài khoản) vào header. Gọi một lần mỗi trang. */
export function mountAccountMenu({ onLogout, withGuestLinks = false } = {}) {
  const nav = document.querySelector(".site-nav");
  if (!nav || nav.querySelector("[data-account-menu]")) return;

  if (withGuestLinks) {
    const wrapper = document.createElement("span");
    wrapper.className = "nav-guest";
    wrapper.hidden = true;
    wrapper.innerHTML = `
      <a class="nav-auth" href="/index.html?auth=login">Đăng nhập</a>
      <a class="nav-signup" href="/index.html?auth=register">Tạo tài khoản <span aria-hidden="true">↗</span></a>`;
    nav.append(wrapper);
    guestLinks = [wrapper];
  }

  root = document.createElement("div");
  root.className = "account-menu";
  root.dataset.accountMenu = "";
  root.hidden = true;
  root.innerHTML = MENU_HTML;
  nav.append(root);

  const trigger = root.querySelector(".account-trigger");
  const dropdown = root.querySelector(".account-dropdown");
  const notificationTrigger = root.querySelector(".notification-trigger");
  const notificationPanel = root.querySelector(".notification-panel");
  const onHistoryPage = /\/booking-(history|detail)\.html$/.test(window.location.pathname);
  if (onHistoryPage) root.querySelector(`a[href="${HISTORY_URL}"]`).setAttribute("aria-current", "page");
  if (window.location.pathname === "/profile.html") root.querySelector('a[href="/profile.html"]').setAttribute("aria-current", "page");

  trigger.addEventListener("click", () => {
    setNotificationsOpen(false);
    setOpen(dropdown.hidden);
  });
  notificationTrigger.addEventListener("click", () => {
    setOpen(false);
    const open = notificationPanel.hidden;
    setNotificationsOpen(open);
    if (open) loadInquiryNotifications();
  });
  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) {
      setOpen(false);
      setNotificationsOpen(false);
    }
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && (!dropdown.hidden || !notificationPanel.hidden)) {
      const closingNotifications = !notificationPanel.hidden;
      setOpen(false);
      setNotificationsOpen(false);
      (closingNotifications ? notificationTrigger : trigger).focus();
    }
    if (event.key === "ArrowDown" && dropdown.hidden) {
      event.preventDefault();
      setOpen(true);
      dropdown.querySelector(".account-item").focus();
    }
  });
  root.querySelector("[data-account-logout]").addEventListener("click", () => {
    setOpen(false);
    onLogout?.();
  });
  subscribeRealtime("inquiry:changed", (event) => {
    const payload = event.payload || {};
    if (payload.action === "resolved" && payload.userId && payload.userId === accountUserId) {
      loadInquiryNotifications();
    }
  });
}

/** Hiển thị avatar + tên khi đã đăng nhập, ẩn khi chưa. */
export function setAccountUser(user) {
  guestLinks.forEach((element) => {
    element.hidden = Boolean(user);
  });
  if (!root) return;
  root.hidden = !user;
  if (!user) {
    accountUserId = null;
    notificationLoadSequence += 1;
    renderNotifications([]);
    setOpen(false);
    setNotificationsOpen(false);
    return;
  }
  if (accountUserId !== user.id) {
    accountUserId = user.id;
    loadInquiryNotifications();
  }
  root.querySelector("[data-account-initial]").textContent = initialOf(user.name);
  const avatar = root.querySelector("[data-account-avatar]");
  const image = avatar.querySelector("img");
  if (image) {
    image.hidden = !user.avatarUrl;
    image.src = user.avatarUrl || "";
  }
  root.querySelector("[data-account-name]").textContent = user.name;
  root.querySelector("[data-account-fullname]").textContent = user.name;
  root.querySelector("[data-account-email]").textContent = user.email || "";
  root.querySelector("[data-admin-link]").hidden = user.role !== "admin";
  root.querySelector(".account-trigger").setAttribute("aria-label", `Tài khoản của ${user.name}`);
}

async function logoutAndRefresh() {
  if (!window.confirm("Bạn chắc muốn đăng xuất?")) return;
  try {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("logout failed");
  } catch {
    window.alert("Không thể đăng xuất lúc này. Vui lòng thử lại.");
    return;
  }
  // Trang yêu cầu đăng nhập (lịch sử, chi tiết đơn...) thì quay về trang chủ; trang công khai thì chỉ đổi giao diện.
  if (document.body.dataset.requiresAuth === "true") {
    window.location.assign("/index.html");
    return;
  }
  setAccountUser(null);
}

/** Dùng cho các trang con (không có hộp thoại đăng nhập): tự lấy phiên đăng nhập và dựng menu. */
export async function initHeaderAccount() {
  mountAccountMenu({ onLogout: logoutAndRefresh, withGuestLinks: true });
  const user = await loadAccountUser();
  return user;
}

async function loadAccountUser() {
  try {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    setAccountUser(data.user || null);
    return data.user || null;
  } catch {
    setAccountUser(null);
    return null;
  }
}
