import { mountAccountMenu, setAccountUser } from "./account-menu.js";

const dialog = document.getElementById("auth-dialog");
const form = document.getElementById("auth-form");
const errorMessage = document.getElementById("auth-error");
const tabs = Array.from(dialog.querySelectorAll("[data-auth-mode]"));
const registerFields = Array.from(dialog.querySelectorAll(".register-only"));
const loginOnlyFields = Array.from(dialog.querySelectorAll("[data-login-only]"));
const submitButton = dialog.querySelector(".auth-submit");
const authNotice = document.getElementById("auth-notice");
const forgotPanel = document.getElementById("auth-forgot");
const otpRequestForm = document.getElementById("auth-otp-request");
const passwordResetForm = document.getElementById("auth-password-reset");
const otpDemo = document.getElementById("auth-otp-demo");
const forgotError = document.getElementById("auth-forgot-error");
let mode = "login";
let noticeTimer;

function showNotice(message, isError = false) {
  window.clearTimeout(noticeTimer);
  authNotice.textContent = message;
  authNotice.classList.toggle("is-error", isError);
  authNotice.hidden = false;
  noticeTimer = window.setTimeout(() => {
    authNotice.hidden = true;
  }, 4000);
}

function setMode(nextMode) {
  mode = nextMode;
  const isRegister = mode === "register";
  form.hidden = false;
  forgotPanel.hidden = true;
  dialog.querySelector(".auth-tabs").hidden = false;
  dialog.querySelector("#auth-title").textContent = isRegister ? "Tạo tài khoản" : "Đăng nhập";
  dialog.querySelector("#auth-description").textContent = isRegister
    ? "Tạo tài khoản để đồng hành cùng Traveller Team."
    : "Đăng nhập để tiếp tục cùng Traveller Team.";
  submitButton.innerHTML = isRegister ? "Tạo tài khoản <span aria-hidden=\"true\">↗</span>" : "Đăng nhập <span aria-hidden=\"true\">↗</span>";
  form.elements.password.autocomplete = isRegister ? "new-password" : "current-password";
  registerFields.forEach((field) => {
    field.hidden = !isRegister;
    field.querySelector("input").required = isRegister;
  });
  loginOnlyFields.forEach((field) => { field.hidden = isRegister; });
  dialog.querySelector(".admin-auth-link").hidden = isRegister;
  tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.authMode === mode)));
  errorMessage.textContent = "";
  errorMessage.classList.remove("is-success");
}

function showForgotPassword() {
  mode = "forgot";
  form.hidden = true;
  dialog.querySelector(".auth-tabs").hidden = true;
  forgotPanel.hidden = false;
  dialog.querySelector("#auth-title").textContent = "Quên mật khẩu";
  dialog.querySelector("#auth-description").textContent = "Xác minh tài khoản bằng OTP để đặt mật khẩu mới.";
  otpRequestForm.reset();
  passwordResetForm.reset();
  passwordResetForm.hidden = true;
  otpDemo.hidden = true;
  forgotError.textContent = "";
  errorMessage.textContent = "";
}

function setUser(user) {
  const loginButton = document.querySelector(".nav-auth");
  const signupButton = document.querySelector(".nav-signup");
  loginButton.hidden = Boolean(user);
  signupButton.hidden = Boolean(user);
  setAccountUser(user);
}

// Chỉ cho phép quay lại các trang nội bộ của ứng dụng sau khi đăng nhập (tránh open-redirect).
const RETURN_TO_ALLOWLIST = ["/tour-detail.html?", "/booking-history.html", "/booking-detail.html?", "/checkout.html?", "/profile.html"];

function safeReturnTo(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return RETURN_TO_ALLOWLIST.some((prefix) => value.startsWith(prefix)) ? value : null;
}

async function handleLogout() {
  if (!window.confirm("Bạn chắc muốn đăng xuất?")) return;
  try {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("logout failed");
    setUser(null);
    showNotice("Bạn đã đăng xuất.");
  } catch {
    showNotice("Không thể đăng xuất lúc này. Vui lòng thử lại.", true);
  }
}

async function loadSession() {
  try {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    setUser(data.user || null);
  } catch {
    setUser(null);
  }
}

export function initAuth() {
  mountAccountMenu({ onLogout: handleLogout });

  document.querySelectorAll("[data-open-auth]").forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.authMode || "login");
      dialog.showModal();
    });
  });

  tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.authMode)));
  dialog.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector("input");
      const isVisible = input.type === "text";
      input.type = isVisible ? "password" : "text";
      button.setAttribute("aria-pressed", String(!isVisible));
      button.setAttribute("aria-label", isVisible ? "Hiện mật khẩu" : "Ẩn mật khẩu");
    });
  });
  dialog.querySelector("[data-open-forgot]").addEventListener("click", showForgotPassword);
  dialog.querySelector("[data-back-to-login]").addEventListener("click", () => setMode("login"));
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".auth-cancel").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
  dialog.addEventListener("cancel", (event) => event.preventDefault());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";
    submitButton.disabled = true;
    const payload = {
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
      rememberMe: form.elements.rememberMe.checked,
    };
    if (mode === "register") {
      if (payload.password !== form.elements.confirmPassword.value) {
        errorMessage.textContent = "Mật khẩu nhập lại chưa khớp.";
        submitButton.disabled = false;
        return;
      }
      payload.name = form.elements.name.value.trim();
    }

    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể xác thực tài khoản.");
      if (mode === "register") {
        const registeredEmail = payload.email;
        form.reset();
        form.elements.email.value = registeredEmail;
        setMode("login");
        errorMessage.textContent = "Đăng ký thành công. Mời bạn đăng nhập.";
        errorMessage.classList.add("is-success");
      } else {
        setUser(data.user);
        form.reset();
        dialog.close();
        const returnTo = safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
        if (returnTo) {
          window.location.assign(returnTo);
          return;
        }
        showNotice("Đăng nhập thành công.");
      }
    } catch (error) {
      errorMessage.textContent = error.message || "Không thể kết nối máy chủ.";
    } finally {
      submitButton.disabled = false;
    }
  });

  otpRequestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    forgotError.textContent = "";
    const button = otpRequestForm.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const email = otpRequestForm.elements.email.value.trim();
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tạo mã OTP.");
      passwordResetForm.hidden = false;
      otpDemo.textContent = data.demoOtp
        ? `Mã OTP demo của bạn: ${data.demoOtp} (có hiệu lực trong 5 phút).`
        : data.message;
      otpDemo.hidden = false;
    } catch (error) {
      forgotError.textContent = error.message || "Không thể kết nối máy chủ.";
    } finally {
      button.disabled = false;
    }
  });

  passwordResetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    forgotError.textContent = "";
    const button = passwordResetForm.querySelector('button[type="submit"]');
    const password = passwordResetForm.elements.password.value;
    if (password !== passwordResetForm.elements.confirmPassword.value) {
      forgotError.textContent = "Mật khẩu nhập lại chưa khớp.";
      return;
    }
    button.disabled = true;
    try {
      const email = otpRequestForm.elements.email.value.trim();
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: passwordResetForm.elements.otp.value.trim(),
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể đặt lại mật khẩu.");
      setMode("login");
      form.elements.email.value = email;
      errorMessage.textContent = data.message;
      errorMessage.classList.add("is-success");
    } catch (error) {
      forgotError.textContent = error.message || "Không thể kết nối máy chủ.";
    } finally {
      button.disabled = false;
    }
  });

  loadSession();
  const authParam = new URLSearchParams(window.location.search).get("auth");
  if (authParam === "login" || authParam === "register") {
    setMode(authParam);
    dialog.showModal();
  }
}