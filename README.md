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
Nếu không cấu hình SQL Server (`SQLSERVER_USER`/`SQLSERVER_PASSWORD`), máy chủ tự động chạy ở chế độ fallback bằng `server/data/app-data.json` để dự án vẫn khởi động được trong môi trường demo/local. Khi có SQL Server, bảng `dbo.AppRecords` được tạo nếu chưa có; nếu bảng đang trống, máy chủ nhập dữ liệu cũ từ `server/data/app-data.json` (nếu có); nếu SQL đã có bản ghi, SQL được dùng làm nguồn chính và file JSON được giữ nguyên, không tự động gộp.

## Tính năng

- Đăng ký, đăng nhập và đăng xuất; mật khẩu được băm bằng scrypt ở máy chủ.
- Gửi lời nhắn liên hệ hoặc thắc mắc đến API.
- Trang quản trị: quản lý đơn tour, khách hàng và biểu mẫu liên hệ.
- Xem tour nổi bật, tìm kiếm và lọc theo địa điểm, giá, ngày khởi hành; xem chi tiết và tính giá theo số khách.
- Lưu tài khoản, booking, thanh toán, đánh giá và lời nhắn trong SQL Server.

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
  database.js
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
