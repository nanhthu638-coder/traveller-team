// Trang quản trị – "Xem biểu đồ thống kê doanh thu". Gọi GET /api/admin/stats/revenue.
import { escapeHtml, formatDate } from "./booking-format.js";
import { formatVnd, revenueBarChart, statusStackedBar, tourRevenueBars } from "./revenue-charts.js";

const STATUS_LABELS = { pending: "Chờ duyệt", confirmed: "Đã xác nhận", completed: "Hoàn tất", cancelled: "Đã hủy" };
const STATUS_COLORS = { pending: "#d9a441", confirmed: "#3b82a0", completed: "#057569", cancelled: "#b9473b" };

export function initRevenueAdmin({ tours, requestJson }) {
  const form = document.getElementById("admin-revenue-filters");
  const message = document.getElementById("admin-revenue-message");
  const kpis = document.getElementById("admin-revenue-kpis");
  const chart = document.getElementById("admin-revenue-chart");
  const rangeText = document.getElementById("admin-revenue-range");
  const tourBars = document.getElementById("admin-revenue-tours");
  const statusBar = document.getElementById("admin-revenue-status");
  const tourSelect = form.elements.tourId;
  tourSelect.insertAdjacentHTML("beforeend", tours.map((tour) => `<option value="${escapeHtml(tour.id)}">${escapeHtml(tour.name)}</option>`).join(""));

  function setMessage(text, isError = false) {
    message.textContent = text;
    message.className = `admin-inline-status${isError ? " is-error" : ""}`;
    message.hidden = !text;
  }

  function growthBadge(summary) {
    if (summary.growth === null) return summary.revenue > 0 ? '<small class="rev-delta">Kỳ trước chưa có doanh thu</small>' : "";
    const percent = Math.round(summary.growth * 1000) / 10;
    const direction = percent > 0 ? "is-up" : percent < 0 ? "is-down" : "";
    const arrow = percent > 0 ? "▲" : percent < 0 ? "▼" : "■";
    return `<small class="rev-delta ${direction}">${arrow} ${Math.abs(percent).toLocaleString("vi-VN")}% so với kỳ trước</small>`;
  }

  function render(data) {
    const { summary, series, byTour, statusBreakdown, range } = data;
    kpis.innerHTML = `
      <article class="rev-kpi is-main"><span>Doanh thu</span><strong>${escapeHtml(formatVnd(summary.revenue))}</strong>${growthBadge(summary)}</article>
      <article class="rev-kpi"><span>Đơn đã thanh toán</span><strong>${summary.paidBookings.toLocaleString("vi-VN")}</strong></article>
      <article class="rev-kpi"><span>Tổng số khách</span><strong>${summary.guests.toLocaleString("vi-VN")}</strong></article>
      <article class="rev-kpi"><span>Giá trị TB / đơn</span><strong>${escapeHtml(formatVnd(summary.averageOrder))}</strong></article>
      <article class="rev-kpi"><span>Chờ thanh toán</span><strong>${escapeHtml(formatVnd(summary.pendingRevenue))}</strong><small>${summary.pendingBookings} đơn chưa thu tiền</small></article>`;
    rangeText.textContent = `${formatDate(range.from)} – ${formatDate(range.to)} · ${range.groupBy === "month" ? "theo tháng" : "theo ngày"}`;
    chart.innerHTML = summary.revenue > 0
      ? revenueBarChart(series)
      : '<p class="admin-empty">Chưa có đơn đã thanh toán trong khoảng thời gian này.</p>';
    tourBars.innerHTML = tourRevenueBars(byTour);
    statusBar.innerHTML = statusStackedBar(statusBreakdown, STATUS_LABELS, STATUS_COLORS);
  }

  async function load() {
    const params = new URLSearchParams(new FormData(form));
    for (const [key, value] of [...params.entries()]) if (!String(value).trim()) params.delete(key);
    form.querySelector('button[type="submit"]').disabled = true;
    try {
      render(await requestJson(`/api/admin/stats/revenue?${params}`));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof TypeError ? "Không thể kết nối máy chủ." : error.message, true);
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    load();
  });
  // Đổi cách nhóm → bỏ khoảng ngày cũ để server dùng khoảng mặc định phù hợp (6 tháng / 30 ngày)
  form.elements.groupBy.addEventListener("change", () => {
    form.elements.from.value = "";
    form.elements.to.value = "";
    load();
  });
  tourSelect.addEventListener("change", load);
  document.getElementById("admin-revenue-reset").addEventListener("click", () => {
    form.reset();
    load();
  });

  return { load };
}
