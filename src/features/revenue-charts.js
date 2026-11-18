// Biểu đồ thống kê doanh thu – vẽ bằng SVG/HTML thuần, không cần thư viện biểu đồ nào.
import { escapeHtml } from "./booking-format.js";

const numberFormat = new Intl.NumberFormat("vi-VN");
export const formatVnd = (value) => `${numberFormat.format(Math.round(value || 0))} ₫`;

/** 1.250.000 → "1,25 tr"; 3.400.000.000 → "3,4 tỷ" (dùng cho nhãn trục). */
export function formatShortVnd(value) {
  const amount = Math.abs(value);
  const trim = (number) => number.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  if (amount >= 1e9) return `${trim(value / 1e9)} tỷ`;
  if (amount >= 1e6) return `${trim(value / 1e6)} tr`;
  if (amount >= 1e3) return `${trim(value / 1e3)} k`;
  return String(Math.round(value));
}

/** Làm tròn giá trị lớn nhất lên mốc "đẹp" (1, 2, 2.5, 5 × 10^n) để trục dễ đọc. */
function niceMax(max) {
  if (max <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(max));
  const ratio = max / power;
  const step = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 2.5 ? 2.5 : ratio <= 5 ? 5 : 10;
  return step * power;
}

/** Biểu đồ cột doanh thu theo kỳ. series: [{ label, revenue, bookings }] */
export function revenueBarChart(series) {
  const width = 760;
  const height = 320;
  const margin = { top: 18, right: 14, bottom: 44, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const top = niceMax(Math.max(0, ...series.map((point) => point.revenue)));
  const ticks = 4;
  const slot = plotWidth / series.length;
  const barWidth = Math.min(54, slot * 0.64);
  const labelEvery = Math.ceil(series.length / 12); // tối đa ~12 nhãn trục X

  const grid = Array.from({ length: ticks + 1 }, (_, index) => {
    const value = (top / ticks) * index;
    const y = margin.top + plotHeight - (value / top) * plotHeight;
    return `<line x1="${margin.left}" x2="${width - margin.right}" y1="${y}" y2="${y}" class="rev-grid" />
      <text x="${margin.left - 8}" y="${y + 4}" text-anchor="end" class="rev-axis">${escapeHtml(formatShortVnd(value))}</text>`;
  }).join("");

  const bars = series.map((point, index) => {
    const barHeight = (point.revenue / top) * plotHeight;
    const x = margin.left + slot * index + (slot - barWidth) / 2;
    const y = margin.top + plotHeight - barHeight;
    const tip = `${point.label}: ${formatVnd(point.revenue)} · ${point.bookings} đơn`;
    const label = index % labelEvery === 0
      ? `<text x="${x + barWidth / 2}" y="${height - margin.bottom + 18}" text-anchor="middle" class="rev-axis">${escapeHtml(point.label)}</text>`
      : "";
    return `<g class="rev-bar-group"><title>${escapeHtml(tip)}</title>
      <rect x="${margin.left + slot * index}" y="${margin.top}" width="${slot}" height="${plotHeight}" class="rev-hit" />
      <rect x="${x}" y="${point.revenue > 0 ? y : margin.top + plotHeight - 2}" width="${barWidth}" height="${point.revenue > 0 ? Math.max(2, barHeight) : 2}" rx="3" class="${point.revenue > 0 ? "rev-bar" : "rev-bar is-empty"}" style="--bar-index:${Math.min(index, 18)}" />${label}</g>`;
  }).join("");

  return `<svg class="rev-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Biểu đồ cột doanh thu theo kỳ" preserveAspectRatio="xMidYMid meet">${grid}${bars}</svg>`;
}

/** Thanh ngang xếp hạng doanh thu theo tour. items: [{ name, revenue, bookings, guests }] */
export function tourRevenueBars(items) {
  if (!items.length) return '<p class="admin-empty">Chưa có doanh thu trong khoảng thời gian này.</p>';
  const max = Math.max(...items.map((item) => item.revenue), 1);
  const total = items.reduce((sum, item) => sum + item.revenue, 0) || 1;
  return `<ol class="rev-tour-list">${items.map((item) => `
    <li>
      <div class="rev-tour-head"><span class="rev-tour-name">${escapeHtml(item.name)}</span><strong>${escapeHtml(formatVnd(item.revenue))}</strong></div>
      <div class="rev-track" role="img" aria-label="${escapeHtml(item.name)}: ${Math.round((item.revenue / total) * 100)}% tổng doanh thu"><span style="width:${Math.max(2, (item.revenue / max) * 100).toFixed(1)}%"></span></div>
      <small>${Math.round((item.revenue / total) * 100)}% tổng · ${item.bookings} đơn · ${item.guests} khách · ${item.reviewCount} đánh giá</small>
    </li>`).join("")}</ol>`;
}

/** Thanh xếp chồng thể hiện tỷ lệ đơn theo trạng thái. */
export function statusStackedBar(counts, labels, colors) {
  const keys = Object.keys(labels);
  const total = keys.reduce((sum, key) => sum + (counts[key] || 0), 0);
  if (!total) return '<p class="admin-empty">Chưa có đơn đặt tour nào trong khoảng thời gian này.</p>';
  const segments = keys.filter((key) => counts[key] > 0).map((key) => `<span style="flex:${counts[key]};background:${colors[key]}" title="${escapeHtml(labels[key])}: ${counts[key]} đơn"></span>`).join("");
  const legend = keys.map((key) => `<li><i style="background:${colors[key]}"></i>${escapeHtml(labels[key])}<strong>${counts[key] || 0}</strong></li>`).join("");
  return `<div class="rev-stack" role="img" aria-label="Tỷ lệ đơn theo trạng thái, tổng ${total} đơn">${segments}</div><ul class="rev-legend">${legend}</ul>`;
}
