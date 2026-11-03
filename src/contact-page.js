import { initSupportWidget } from "./features/support-widget.js";

const form = document.getElementById("contact-form");
const alertBox = document.getElementById("alert-box");
const submitButton = document.getElementById("btn-submit");

function showAlert(type, message) {
  alertBox.className = `mb-6 rounded-lg border p-4 text-lg font-bold transition-all ${
    type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
  }`;
  alertBox.textContent = message;
  alertBox.classList.remove("hidden");
  alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("c-name").value.trim();
  const email = document.getElementById("c-email").value.trim();
  const topic = document.getElementById("c-subject").value.trim();
  const message = document.getElementById("c-message").value.trim();
  if (!name || !email || !topic || message.length < 10) {
    showAlert("error", "Vui lòng điền đầy đủ thông tin; nội dung cần ít nhất 10 ký tự.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Đang gửi...";
  try {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, topic, message }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể gửi lời nhắn.");
    const trackingNote = data.trackedInAccount
      ? " Bạn có thể xem trạng thái xử lý trong Hồ sơ cá nhân."
      : " Để theo dõi trạng thái, hãy đăng nhập trước khi gửi biểu mẫu.";
    showAlert("success", `Biểu mẫu của bạn đã được gửi thành công và chuyển đến bộ phận quản lý xử lý.${trackingNote} Mã tham chiếu: ${data.inquiry.id}.`);
    form.reset();
  } catch (error) {
    showAlert("error", error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng thử lại." : error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Gửi liên hệ";
  }
});

initSupportWidget();
