import { randomUUID } from "node:crypto";

export const DEMO_VOUCHERS = [
	{
		id: "voucher-welcome10",
		code: "CHAO10",
		type: "percent",
		value: 10,
		maxDiscount: 500_000,
		minimumOrder: 1_000_000,
		startsAt: "2026-01-01",
		expiresAt: "2027-12-31",
		active: true,
		usageLimit: 500,
		usageCount: 0,
	},
	{
		id: "voucher-expired",
		code: "CU2024",
		type: "percent",
		value: 15,
		maxDiscount: 1_000_000,
		minimumOrder: 1_000_000,
		startsAt: "2024-01-01",
		expiresAt: "2024-12-31",
		active: true,
		usageLimit: 100,
		usageCount: 0,
	},
];

export function normalizeVoucherCode(value) {
	return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function listAvailableVouchers(vouchers, subtotal, today) {
	return vouchers
		.filter((voucher) => voucher.active
			&& today >= voucher.startsAt
			&& today <= voucher.expiresAt
			&& voucher.usageCount < voucher.usageLimit
			&& subtotal >= voucher.minimumOrder)
		.map((voucher) => {
			const rawDiscount = voucher.type === "percent" ? Math.round(subtotal * voucher.value / 100) : voucher.value;
			const discount = Math.min(subtotal, voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount);
			return {
				code: voucher.code,
				type: voucher.type,
				value: voucher.value,
				maxDiscount: voucher.maxDiscount || null,
				minimumOrder: voucher.minimumOrder,
				expiresAt: voucher.expiresAt,
				discount,
				total: subtotal - discount,
			};
		});
}

export function quoteVoucher(vouchers, code, subtotal, today) {
	const normalized = normalizeVoucherCode(code);
	if (!normalized) return { voucher: null, discount: 0 };
	const voucher = vouchers.find((item) => item.code === normalized);
	if (!voucher || !voucher.active) return { error: "Mã voucher không còn khả dụng." };
	if (today < voucher.startsAt) return { error: "Voucher chưa đến thời gian áp dụng." };
	if (today > voucher.expiresAt) return { error: "Voucher đã hết hạn, không còn khả dụng." };
	if (voucher.usageCount >= voucher.usageLimit) return { error: "Voucher đã hết lượt sử dụng, không còn khả dụng." };
	if (subtotal < voucher.minimumOrder) return { error: `Đơn hàng cần tối thiểu ${voucher.minimumOrder.toLocaleString("vi-VN")}đ để dùng voucher.` };

	const rawDiscount = voucher.type === "percent" ? Math.round(subtotal * voucher.value / 100) : voucher.value;
	const discount = Math.min(subtotal, voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount);
	return {
		voucher: { id: voucher.id, code: voucher.code, type: voucher.type, value: voucher.value },
		discount,
		total: subtotal - discount,
	};
}

export function createPayment({ booking, user }) {
	const timestamp = new Date().toISOString();
	return {
		id: randomUUID(),
		bookingId: booking.id,
		bookingCode: booking.code,
		userId: user.id,
		amount: booking.total,
		method: "demo",
		status: "pending",
		createdAt: timestamp,
		updatedAt: timestamp,
	};
}
