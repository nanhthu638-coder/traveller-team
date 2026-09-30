# Traveller Team

Môn học: Congnghephanmem_NângCao

Website du lịch tiếng Việt, dùng Tailwind CSS cho giao diện, Vite cho môi trường phát triển và Node.js/Express cho API.

## Chạy dự án

Yêu cầu Node.js 20.19 trở lên.

```sh
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (mặc định `http://localhost:5173`). API Node.js chạy ở cổng 3000 và được Vite chuyển tiếp tự động.

## Tính năng

- Đăng ký, đăng nhập và đăng xuất; mật khẩu được băm bằng scrypt ở máy chủ.
- Gửi lời nhắn liên hệ hoặc thắc mắc đến API.
- Xem tour nổi bật, tìm kiếm và lọc theo địa điểm, giá, ngày khởi hành; xem chi tiết và tính giá theo số khách.
- Lưu tài khoản và lời nhắn trong tệp JSON cục bộ tại `server/data/app-data.json`.

## Cấu trúc

```text
index.html
tour-list.html
tour-detail.html
src/
  features/auth.js
  features/contact.js
  features/featured-tours.js
  features/tours.js
  main.js
  style.css
  tour-list.js
  tour-detail.js
server/
  data/app-data.json
  index.js
  tours.js
vite.config.js
```

## API tìm kiếm & lọc tour

`GET /api/tours` — tất cả tham số đều tùy chọn:

| Tham số | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `q` | Từ khóa theo tên, địa điểm, tỉnh (không phân biệt dấu) | `q=ha long` |
| `minPrice`, `maxPrice` | Khoảng giá (VND) | `minPrice=2000000&maxPrice=4000000` |
| `from`, `to` | Khoảng ngày khởi hành (`YYYY-MM-DD`) | `from=2026-11-01&to=2026-11-10` |
| `sort` | `default`, `price-asc`, `price-desc`, `date-asc` | `sort=price-asc` |

Trả về `{ total, tours }`; mỗi tour có `departures` (mọi ngày khởi hành) và `matchedDepartures` (các ngày khớp bộ lọc ngày). Tham số sai trả về mã 400 kèm `{ error }`. Dữ liệu tour mẫu nằm ở `server/tours.js`.

Trang chi tiết tour dùng URL `/tour-detail.html?id=<tour-id>` và lấy dữ liệu qua API.
Để chạy bản build bằng máy chủ Express: `npm run build` rồi `npm start`.

Đây là bản nền tảng để chạy cục bộ. Trước khi triển khai công khai, cần bổ sung giới hạn lượt đăng nhập/gửi biểu mẫu, chính sách sao lưu dữ liệu và HTTPS.
