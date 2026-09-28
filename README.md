# Traveller Team

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
- Lưu tài khoản và lời nhắn trong tệp JSON cục bộ tại `server/data/app-data.json`.

## Cấu trúc

```text
index.html
src/
  features/auth.js
  features/contact.js
  main.js
  style.css
server/index.js
vite.config.js
```

Để chạy bản build bằng máy chủ Express: `npm run build` rồi `npm start`.

Đây là bản nền tảng để chạy cục bộ. Trước khi triển khai công khai, cần bổ sung giới hạn lượt đăng nhập/gửi biểu mẫu, chính sách sao lưu dữ liệu và HTTPS.