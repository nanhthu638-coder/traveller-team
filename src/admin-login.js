const form = document.getElementById("admin-login-form");
const errorMessage = document.getElementById("admin-login-error");
const submitButton = form.querySelector("button[type=submit]");

async function existingAdminSession() {
  try {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    if (response.ok && data.user?.role === "admin") window.location.replace("/admin.html");
  } catch {
    // Login remains available when the session check cannot reach the API.
  }
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
    window.location.assign("/admin.html");
  } catch (error) {
    errorMessage.textContent = error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng thử lại." : error.message;
    errorMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
  }
});

existingAdminSession();
