// Nén ảnh về JPEG trước khi gửi lên server (server chỉ nhận JPEG ≤ 1 MB sau khi giải mã).
// Dùng cho ảnh tour ở trang quản trị; logic tương tự hộp thoại đánh giá nhưng cho phép ảnh lớn hơn (cạnh dài 1600 px).
const MAX_SIDE = 1600;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 1_300_000; // ~0,95 MB ảnh, dưới giới hạn 1 MB của server

export async function fileToJpegDataUrl(file) {
  if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" không phải là ảnh.`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" quá lớn (tối đa 15 MB).`);

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`Không đọc được ảnh "${file.name}". Hãy chọn ảnh JPG, PNG hoặc WebP.`);
  }

  let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  try {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff"; // nền trắng cho ảnh PNG trong suốt
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      let quality = 0.85;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.45) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
      scale *= 0.8; // vẫn quá nặng: thu nhỏ thêm rồi nén lại
    }
  } finally {
    bitmap.close?.();
  }
  throw new Error(`Ảnh "${file.name}" vẫn quá nặng sau khi nén. Vui lòng chọn ảnh khác.`);
}
