import { tours as tourCatalog } from "./tours.js";
import { todayInVietnam } from "./bookings.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GROUPS = new Set(["day", "month"]);
const STATUS_KEYS = ["pending", "confirmed", "completed", "cancelled"];

function isValidDate(value) {
	if (!DATE_PATTERN.test(value)) return false;
	const date = new Date(`${value}T00:00:00.000Z`);
	return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function shiftDate(value, days) {
	const date = new Date(`${value}T00:00:00.000Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

function monthStart(value) {
	return `${value.slice(0, 7)}-01`;
}

function shiftMonth(value, months) {
	const date = new Date(`${monthStart(value)}T00:00:00.000Z`);
	date.setUTCMonth(date.getUTCMonth() + months);
	return date.toISOString().slice(0, 10);
}

function bookingDate(booking) {
	const value = String(booking.createdAt || "").slice(0, 10);
	return isValidDate(value) ? value : "";
}

function guestsOf(booking) {
	const passengers = booking.passengers || {};
	return (passengers.adult || 0) + (passengers.child || 0) + (passengers.infant || 0);
}

function recordRevenue(booking) {
	return Number.isSafeInteger(booking.total) && booking.total > 0 ? booking.total : 0;
}

function groupKey(date, groupBy) {
	return groupBy === "month" ? date.slice(0, 7) : date;
}

function groupLabel(key, groupBy) {
	if (groupBy === "month") {
		const [year, month] = key.split("-");
		return `${month}/${year.slice(2)}`;
	}
	return `${key.slice(8, 10)}/${key.slice(5, 7)}`;
}

function periodsBetween(from, to, groupBy) {
	const periods = [];
	let cursor = groupBy === "month" ? monthStart(from) : from;
	const last = groupBy === "month" ? monthStart(to) : to;
	while (cursor <= last) {
		const key = groupKey(cursor, groupBy);
		periods.push({ key, label: groupLabel(key, groupBy) });
		cursor = groupBy === "month" ? shiftMonth(cursor, 1) : shiftDate(cursor, 1);
	}
	return periods;
}

function summarizeBookings(bookings) {
	const paid = bookings.filter((booking) => booking.paymentStatus === "paid");
	const pending = bookings.filter((booking) => booking.paymentStatus === "unpaid" && booking.status !== "cancelled");
	const revenue = paid.reduce((sum, booking) => sum + recordRevenue(booking), 0);
	return {
		revenue,
		paidBookings: paid.length,
		guests: paid.reduce((sum, booking) => sum + guestsOf(booking), 0),
		averageOrder: paid.length ? Math.round(revenue / paid.length) : 0,
		pendingRevenue: pending.reduce((sum, booking) => sum + recordRevenue(booking), 0),
		pendingBookings: pending.length,
	};
}

function reviewsByTour(reviews) {
	const grouped = new Map();
	for (const review of reviews) {
		const current = grouped.get(review.tourId) || { reviewCount: 0, ratingTotal: 0 };
		current.reviewCount += 1;
		current.ratingTotal += Number(review.rating) || 0;
		grouped.set(review.tourId, current);
	}
	return grouped;
}

export function revenueReport(bookings, reviews, query = {}, now = new Date()) {
	const groupBy = typeof query.groupBy === "string" && query.groupBy ? query.groupBy : "day";
	if (!GROUPS.has(groupBy)) return { error: "Cách nhóm thống kê không hợp lệ." };

	const today = todayInVietnam(now);
	const defaultFrom = groupBy === "month" ? shiftMonth(today, -5) : shiftDate(today, -29);
	const from = typeof query.from === "string" && query.from ? query.from : defaultFrom;
	const to = typeof query.to === "string" && query.to ? query.to : today;
	if (!isValidDate(from) || !isValidDate(to)) return { error: "Ngày thống kê không hợp lệ." };
	if (from > to) return { error: "Ngày bắt đầu không được sau ngày kết thúc." };
	const duration = (Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`)) / 86_400_000;
	if (duration > (groupBy === "month" ? 1826 : 365)) return { error: "Khoảng thống kê quá dài." };

	const tourId = typeof query.tourId === "string" ? query.tourId.trim() : "";
	if (tourId && !tourCatalog.some((tour) => tour.id === tourId)) return { error: "Tour thống kê không hợp lệ." };

	const inRange = (booking) => {
		const date = bookingDate(booking);
		return date && date >= from && date <= to;
	};
	const matchingBookings = bookings.filter((booking) => inRange(booking) && (!tourId || booking.tour?.id === tourId));
	const allRangeBookings = bookings.filter(inRange);
	const series = periodsBetween(from, to, groupBy).map(({ key, label }) => {
		const entries = matchingBookings.filter((booking) => bookingDate(booking) && groupKey(bookingDate(booking), groupBy) === key);
		return {
			key,
			label,
			revenue: entries.filter((booking) => booking.paymentStatus === "paid").reduce((sum, booking) => sum + recordRevenue(booking), 0),
			bookings: entries.filter((booking) => booking.paymentStatus === "paid").length,
		};
	});

	const summary = summarizeBookings(matchingBookings);
	const previousTo = shiftDate(from, -1);
	const previousFrom = shiftDate(previousTo, -duration);
	const previousRevenue = summarizeBookings(bookings.filter((booking) => {
		const date = bookingDate(booking);
		return date && date >= previousFrom && date <= previousTo && (!tourId || booking.tour?.id === tourId);
	})).revenue;
	summary.growth = previousRevenue === 0 ? (summary.revenue > 0 ? null : 0) : (summary.revenue - previousRevenue) / previousRevenue;

	const statusBreakdown = Object.fromEntries(STATUS_KEYS.map((key) => [
		key,
		matchingBookings.filter((booking) => booking.status === key).length,
	]));
	const ratingMap = reviewsByTour(reviews);
	const metrics = new Map(tourCatalog.map((tour) => [tour.id, {
		tourId: tour.id,
		name: tour.name,
		revenue: 0,
		bookings: 0,
		guests: 0,
		reviewCount: 0,
		averageRating: null,
	}]));
	for (const booking of allRangeBookings) {
		const metric = metrics.get(booking.tour?.id);
		if (!metric) continue;
		if (booking.status !== "cancelled") {
			metric.bookings += 1;
			metric.guests += guestsOf(booking);
		}
		if (booking.paymentStatus === "paid") metric.revenue += recordRevenue(booking);
	}
	for (const [id, rating] of ratingMap) {
		const metric = metrics.get(id);
		if (!metric) continue;
		metric.reviewCount = rating.reviewCount;
		metric.averageRating = rating.reviewCount ? Math.round((rating.ratingTotal / rating.reviewCount) * 10) / 10 : null;
	}

	const byTour = [...metrics.values()]
		.filter((metric) => !tourId || metric.tourId === tourId)
		.sort((left, right) => right.revenue - left.revenue || right.bookings - left.bookings);
	const leaders = {
		revenue: [...metrics.values()].filter((item) => item.revenue > 0).sort((a, b) => b.revenue - a.revenue)[0] || null,
		bookings: [...metrics.values()].filter((item) => item.bookings > 0).sort((a, b) => b.bookings - a.bookings)[0] || null,
		reviews: [...metrics.values()].filter((item) => item.reviewCount > 0).sort((a, b) => b.reviewCount - a.reviewCount)[0] || null,
	};

	return {
		summary,
		series,
		byTour,
		statusBreakdown,
		leaders,
		range: { from, to, groupBy },
	};
}
