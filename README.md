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
 ├── features/auth.js
 ├── features/contact.js
 ├── features/featured-tours.js
 ├──features/tours.js
 ├──main.js
 ├──style.css
 ├──tour-list.js
 ├── tour-detail.js
server/
 ├──data/app-data.json
 ├── index.js
 ├── tours.js
vite.config.js
```

