import { randomUUID } from "node:crypto";
import { decodeImage } from "./reviews.js";

export const MAX_TOUR_IMAGES = 12;
export const MAX_TOUR_IMAGE_BYTES = 1_000_000;
export const MAX_TOUR_IMAGE_FILE = /^[0-9a-f-]{36}\.jpg$/;
export const MAX_TOUR_IMAGE_UPLOADS = 4;

const MEALS = new Set(["breakfast", "lunch", "dinner"]);

export function defaultItinerary() {
	return [
		{
			title: "Ngày 1: Khởi hành và khám phá",
			description: "Đón khách, di chuyển đến điểm đến, dùng bữa địa phương và nhận phòng nghỉ ngơi.",
			meals: ["lunch", "dinner"],
			stay: "Khách sạn theo chương trình",
		},
		{
			title: "Ngày 2: Trải nghiệm địa phương",
			description: "Tham quan địa danh nổi bật, thưởng thức ẩm thực và khám phá văn hóa bản địa.",
			meals: ["breakfast", "lunch", "dinner"],
			stay: "Khách sạn theo chương trình",
		},
		{
			title: "Ngày cuối: Trở về",
			description: "Dùng bữa sáng, tham quan điểm cuối trong lịch trình và khởi hành về điểm đón.",
			meals: ["breakfast"],
			stay: "",
		},
	];
}

export function validateItinerary(value) {
	if (!Array.isArray(value) || value.length < 1 || value.length > 14) {
		return { error: "Lịch trình phải có từ 1 đến 14 ngày." };
	}
	const itinerary = [];
	for (const [index, day] of value.entries()) {
		const title = typeof day?.title === "string" ? day.title.trim() : "";
		const description = typeof day?.description === "string" ? day.description.trim() : "";
		const stay = typeof day?.stay === "string" ? day.stay.trim() : "";
		const meals = Array.isArray(day?.meals) ? [...new Set(day.meals)] : [];
		if (!title || title.length > 120 || !description || description.length > 1500 || stay.length > 120) {
			return { error: `Vui lòng kiểm tra tiêu đề, mô tả và lưu trú của ngày ${index + 1}.` };
		}
		if (meals.some((meal) => !MEALS.has(meal))) return { error: `Bữa ăn của ngày ${index + 1} không hợp lệ.` };
		itinerary.push({ title, description, stay, meals });
	}
	return { itinerary };
}

export function decodeTourImages(value) {
	if (!Array.isArray(value) || value.length < 1 || value.length > MAX_TOUR_IMAGE_UPLOADS) {
		return { error: `Mỗi lần tải lên từ 1 đến ${MAX_TOUR_IMAGE_UPLOADS} ảnh.` };
	}
	const buffers = [];
	for (const image of value) {
		const result = decodeImage(image);
		if (result.error) return result;
		if (result.buffer.length > MAX_TOUR_IMAGE_BYTES) return { error: "Mỗi ảnh tối đa 1 MB sau khi nén." };
		buffers.push({ file: `${randomUUID()}.jpg`, buffer: result.buffer });
	}
	return { images: buffers };
}
