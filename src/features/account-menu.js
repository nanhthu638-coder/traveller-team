// Menu tài khoản (avatar) dùng chung cho mọi trang: Lịch sử đặt tour + Đăng xuất.
// Markup được chèn vào cuối `.site-nav` để các trang không phải chép lại HTML.

const HISTORY_URL = "/booking-history.html";
let root = null;
let guestLinks = [];

const MENU_HTML = `
  <button class="account-trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="account-dropdown">
    <span class="account-avatar" data-account-avatar aria-hidden="true"></span>
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
  const onHistoryPage = /\/booking-(history|detail)\.html$/.test(window.location.pathname);
  if (onHistoryPage) root.querySelector(`a[href="${HISTORY_URL}"]`).setAttribute("aria-current", "page");

  trigger.addEventListener("click", () => setOpen(dropdown.hidden));
  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) setOpen(false);
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dropdown.hidden) {
      setOpen(false);
      trigger.focus();
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
}

/** Hiển thị avatar + tên khi đã đăng nhập, ẩn khi chưa. */
export function setAccountUser(user) {
  guestLinks.forEach((element) => {
    element.hidden = Boolean(user);
  });
  if (!root) return;
  root.hidden = !user;
  if (!user) {
    setOpen(false);
    return;
  }
  root.querySelector("[data-account-avatar]").textContent = initialOf(user.name);
  root.querySelector("[data-account-name]").textContent = user.name;
  root.querySelector("[data-account-fullname]").textContent = user.name;
  root.querySelector("[data-account-email]").textContent = user.email || "";
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
