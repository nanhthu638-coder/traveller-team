const dialog = document.getElementById("auth-dialog");
const form = document.getElementById("auth-form");
const errorMessage = document.getElementById("auth-error");
const tabs = Array.from(dialog.querySelectorAll("[data-auth-mode]"));
const registerFields = Array.from(dialog.querySelectorAll(".register-only"));
const submitButton = dialog.querySelector(".auth-submit");
const authNotice = document.getElementById("auth-notice");
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
  tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.authMode === mode)));
  errorMessage.textContent = "";
  errorMessage.classList.remove("is-success");
}

function setUser(user) {
  const loginButton = document.querySelector(".nav-auth");
  const signupButton = document.querySelector(".nav-signup");
  const userButton = document.querySelector(".nav-user");
  loginButton.hidden = Boolean(user);
  signupButton.hidden = Boolean(user);
  userButton.hidden = !user;
  if (user) {
    userButton.textContent = `${user.name} · Đăng xuất`;
    userButton.setAttribute("aria-label", `Đăng xuất tài khoản ${user.name}`);
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
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.querySelector(".nav-user").addEventListener("click", async () => {
    if (!window.confirm("Bạn chắc muốn đăng xuất?")) return;
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout failed");
      setUser(null);
      showNotice("Bạn đã đăng xuất.");
    } catch {
      showNotice("Không thể đăng xuất lúc này. Vui lòng thử lại.", true);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";
    submitButton.disabled = true;
    const payload = {
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
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
        showNotice("Đăng nhập thành công.");
      }
    } catch (error) {
      errorMessage.textContent = error.message || "Không thể kết nối máy chủ.";
    } finally {
      submitButton.disabled = false;
    }
  });

  loadSession();
}