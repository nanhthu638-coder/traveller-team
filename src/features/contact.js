export function initContact() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  const submitButton = form.querySelector("[type=submit]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.classList.remove("is-error");
    status.textContent = "";
    submitButton.disabled = true;

    const payload = Object.fromEntries(new FormData(form).entries());
    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === "string") payload[key] = payload[key].trim();
    });

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể gửi lời nhắn.");
      status.textContent = `Cảm ơn ${data.inquiry.name}, lời nhắn đã được gửi. Mã tham chiếu: ${data.inquiry.id}.`;
      form.reset();
    } catch (error) {
      status.classList.add("is-error");
      status.textContent = error.message || "Không thể kết nối máy chủ. Vui lòng thử lại.";
    } finally {
      submitButton.disabled = false;
    }
  });
}