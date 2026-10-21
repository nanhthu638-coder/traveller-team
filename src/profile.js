import { initHeaderAccount, setAccountUser } from "./features/account-menu.js";
import { initNavigation } from "./features/navigation.js";

const form = document.getElementById("profile-form");
const status = document.getElementById("profile-status");
const avatar = document.getElementById("profile-avatar");
const avatarFile = document.getElementById("profile-avatar-file");
const removeAvatar = document.getElementById("profile-avatar-remove");

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function renderProfile(profile, stats) {
  for (const field of ["name", "email", "phone", "birthDate", "gender", "address"]) {
    form.elements[field].value = profile[field] || "";
  }
  avatar.querySelector("[data-avatar-initial]").textContent = profile.name.trim().split(/\s+/).at(-1)?.[0]?.toUpperCase() || "?";
  const image = avatar.querySelector("img");
  image.hidden = !profile.avatarUrl;
  image.src = profile.avatarUrl || "";
  avatar.classList.toggle("has-image", Boolean(profile.avatarUrl));
  removeAvatar.hidden = !profile.avatarUrl;
  document.getElementById("profile-bookings").textContent = String(stats.bookings);
  document.getElementById("profile-reviews").textContent = String(stats.reviews);
}

async function loadProfile() {
  try {
    const response = await fetch("/api/profile");
    const data = await response.json();
    if (response.status === 401) {
      window.location.replace(`/index.html?auth=login&returnTo=${encodeURIComponent("/profile.html")}`);
      return;
    }
    if (!response.ok) throw new Error(data.error || "Không thể tải hồ sơ.");
    renderProfile(data.profile, data.stats);
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    document.body.setAttribute("aria-busy", "false");
  }
}

async function compressAvatar(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.86;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > 1_350_000 && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > 1_350_000) throw new Error("Ảnh quá lớn sau khi nén. Vui lòng chọn ảnh khác.");
  return dataUrl;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showStatus("");
  const saveButton = form.querySelector('[type="submit"]');
  saveButton.disabled = true;
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể lưu hồ sơ.");
    const stats = {
      bookings: document.getElementById("profile-bookings").textContent,
      reviews: document.getElementById("profile-reviews").textContent,
    };
    renderProfile(data.profile, { bookings: Number(stats.bookings), reviews: Number(stats.reviews) });
    setAccountUser(data.profile);
    showStatus("Đã lưu thông tin hồ sơ.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    saveButton.disabled = false;
  }
});

avatarFile.addEventListener("change", async () => {
  const file = avatarFile.files?.[0];
  avatarFile.value = "";
  if (!file) return;
  showStatus("");
  try {
    const image = await compressAvatar(file);
    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể cập nhật ảnh đại diện.");
    const profileResponse = await fetch("/api/profile");
    const profileData = await profileResponse.json();
    if (!profileResponse.ok) throw new Error(profileData.error || "Không thể tải hồ sơ.");
    renderProfile(profileData.profile, profileData.stats);
    setAccountUser(data.user);
    showStatus("Đã cập nhật ảnh đại diện.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  }
});

removeAvatar.addEventListener("click", async () => {
  removeAvatar.disabled = true;
  try {
    const response = await fetch("/api/profile/avatar", { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể xóa ảnh đại diện.");
    const profileResponse = await fetch("/api/profile");
    const profileData = await profileResponse.json();
    if (!profileResponse.ok) throw new Error(profileData.error || "Không thể tải hồ sơ.");
    renderProfile(profileData.profile, profileData.stats);
    setAccountUser(data.user);
    showStatus("Đã xóa ảnh đại diện.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
  } finally {
    removeAvatar.disabled = false;
  }
});

initNavigation();
initHeaderAccount();
loadProfile();
