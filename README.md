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
# :maple_leaf: Sprint 1 :maple_leaf:
 
 * Đăng ký, đăng nhập và đăng xuất; mật khẩu được băm bằng scrypt ở máy chủ.
 * Gửi lời nhắn liên hệ hoặc thắc mắc đến API.
 * Xem tour nổi bật, tìm kiếm và lọc theo địa điểm, giá, ngày khởi hành; xem chi tiết và tính giá theo số khách.
 * Lưu tài khoản và lời nhắn trong tệp JSON cục bộ tại `server/data/app-data.json`.
 * Xem Trang chủ
 * Xem danh sách Tour

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
## 📌 Pull Requests đã thực hiện

- [PR #8: Update README.md](https://github.com/nanthu638-coder/traveller-team/pull/8)
- [PR #3: Change search](https://github.com/nanthu638-coder/traveller-team/pull/3)
---
## ❓Issue đã thực hiện 
- [Is #10: Đánh giá và chấm điểm Tour](https://github.com/nanhthu638-coder/traveller-team/issues/10)
- [Is #9: Xem lịch sử đặt Tour](https://github.com/nanhthu638-coder/traveller-team/issues/9)
---
- Excel
  * Link access: https://docs.google.com/spreadsheets/d/1tG4tDlw2bT8fQgMii-VEUp_I7WRxZ7zSyKmIA1J_7iU/edit?usp=sharing
- Docs
  * Link access Nhom4_Lab4.1: https://docs.google.com/document/d/1KIsDL5-5ESIB9BfOeZTKzox-B9mEKBlDRTpk73BD6s8/edit?usp=sharing
  * Link access Nhom4_Lab4.2: https://docs.google.com/document/d/1B3PK5EkUFVLVzMVA0jzjIE2PT7JaABEu1hiBlVBzdS8/edit?usp=sharing
