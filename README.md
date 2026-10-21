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
API dùng SQL Server/SQL Express theo cấu hình `SQLSERVER_*` trong `.env`. Với SQL Express tắt SQL Browser hoặc dùng cổng động, có thể đặt `SQLSERVER_PORT` để kết nối trực tiếp; khi có port, cấu hình instance được bỏ qua. Bảng `dbo.AppRecords` được tạo nếu chưa có. Nếu bảng đang trống, máy chủ nhập dữ liệu cũ từ `server/data/app-data.json` (nếu có); nếu SQL đã có bản ghi, SQL được dùng làm nguồn chính và file JSON được giữ nguyên, không tự động gộp.

## Tính năng

- Đăng ký, đăng nhập và đăng xuất; mật khẩu được băm bằng scrypt ở máy chủ.
- Gửi lời nhắn liên hệ hoặc thắc mắc đến API.
- Xem tour nổi bật, tìm kiếm và lọc theo địa điểm, giá, ngày khởi hành; xem chi tiết và tính giá theo số khách.
- Lưu tài khoản, booking, thanh toán, đánh giá và lời nhắn trong SQL Server.

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
 ---
 # :maple_leaf: Sprint 2 :maple_leaf:
 * Đặt Tour (Chọn số lượng khách, kiểm tra chỗ trống).
 * Nhập thông tin hành khách.
 * Áp dụng mã giảm giá (Voucher).
 * Thanh toán trực tuyến.
 * Xem lịch sử đặt Tour.
 * Quản lý đơn đặt Tour (Xem, Yêu cầu hủy)
 * Quản lý hồ sơ cá nhân.
 * Đánh giá và chấm điểm Tour.

## Cấu trúc
```text
traveller-team/
├── server/                     
│   ├── data/                   
│   │   └── app-data.json
│   ├── src/                    
│   │   └── features/           
│   │       ├── account-menu.js
│   │       ├── auth.js
│   │       ├── booking-flow.js
│   │       ├── booking-format.js
│   │       ├── contact.js
│   │       ├── featured-tours.js
│   │       ├── navigation.js
│   │       ├── review-dialog.js
│   │       ├── review-ui.js
│   │       ├── support-widget.js
│   │       ├── tour-reviews.js
│   │       └── tours.js
│   ├── booking-detail.js
│   ├── booking-history.js
│   ├── checkout.js
│   ├── contact-page.js
│   ├── main.js
│   ├── profile.js
│   ├── style.css
│   ├── tour-detail.js
│   └── tour-list.js
│   ├── availability.js
│   ├── bookings.js
│   ├── database.js
│   ├── index.js
│   ├── passengers.js
│   ├── reviews.js
│   ├── tours.js
│   └── vouchers.js
│
├── traveller-team-Test/        
│   ├── src/
│   │   └── features/  
│   │       ├── auth.js
│   │       ├── contact.js
│   │       ├── featured-tours.js
│   │       └── tours.js
│   ├── main.js
│   ├── style.css
│   ├── tour-detail.js
│   └── tour-list.js
│
├── .env.example               
├── .gitignore
├── Nhom4_T4.xlsx               
├── README.md
├── booking-detail.html         
├── booking-history.html
├── checkout.html
├── contact.html
├── index.html
├── package-lock.json
├── package.json                
├── tour-detail.html
├── tour-list.html
└── vite.config.js              
```
