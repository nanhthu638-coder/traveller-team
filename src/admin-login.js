const form = document.getElementById("admin-login-form");
const errorMessage = document.getElementById("admin-login-error");
const submitButton = form.querySelector("button[type=submit]");
const btnFillDemo = document.getElementById("btn-fill-demo");

function getReturnTo() {
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return "/admin.html";
}

async function existingAdminSession() {
  try {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    if (response.ok && data.user?.role === "admin") {
      window.location.replace(getReturnTo());
    }
  } catch {
    // Không kết nối được API thì người dùng vẫn có thể đăng nhập bình thường
  }
}

if (btnFillDemo) {
  btnFillDemo.addEventListener("click", () => {
    form.elements.email.value = "admin@example.com";
    form.elements.password.value = "admin@123";
    errorMessage.hidden = true;
    form.elements.password.focus();
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  submitButton.disabled = true;
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.elements.email.value.trim(),
        password: form.elements.password.value,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể đăng nhập quản trị.");
    if (data.user?.role !== "admin") throw new Error("Tài khoản này chưa được cấp quyền quản trị.");
    window.location.assign(getReturnTo());
  } catch (error) {
    errorMessage.textContent = error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng thử lại." : error.message;
    errorMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
  }
});

existingAdminSession();
