const dialog = document.getElementById("auth-dialog");
const form = document.getElementById("auth-form");
const errorMessage = document.getElementById("auth-error");
const tabs = Array.from(dialog.querySelectorAll("[data-auth-mode]"));
const registerFields = Array.from(dialog.querySelectorAll(".register-only"));
const submitButton = dialog.querySelector(".auth-submit");
let mode = "login";

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
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".auth-cancel").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
  dialog.addEventListener("cancel", (event) => event.preventDefault());

  document.querySelector(".nav-user").addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
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
      setUser(data.user);
      form.reset();
      dialog.close();
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      if (returnTo?.startsWith("/tour-detail.html?") && !returnTo.startsWith("//")) {
        window.location.assign(returnTo);
        return;
      }
    } catch (error) {
      errorMessage.textContent = error.message || "Không thể kết nối máy chủ.";
    } finally {
      submitButton.disabled = false;
    }
  });

  loadSession();
  if (new URLSearchParams(window.location.search).get("auth") === "login") {
    setMode("login");
    dialog.showModal();
  }
}