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

## Thanh toán giả lập
Trang checkout hỗ trợ thẻ Visa/Mastercard mẫu, thẻ ATM nội địa mẫu và mã seri được tạo cho từng giao dịch. API chỉ ghi nhận phương thức giả lập, không gửi hoặc lưu số thẻ/tên chủ thẻ. Khi xác nhận, máy chủ cập nhật trạng thái payment và booking, sau đó lưu vào SQL Server nếu đã cấu hình; nếu không, dữ liệu được lưu trong `server/data/app-data.json`. Luồng này chỉ phục vụ đồ án/demo, không xử lý tiền thật.

Trạng thái tour không chuyển thành `completed` khi vừa thanh toán; trạng thái này chỉ dành cho tour đã hoàn thành.

## Khôi phục mật khẩu

Trong môi trường demo, người dùng có thể yêu cầu OTP 6 chữ số ở màn hình đăng nhập để đặt lại mật khẩu. OTP hết hạn sau 5 phút, giới hạn 5 lần nhập và chỉ được hiển thị trực tiếp trong giao diện demo; không gửi OTP qua email. API khôi phục mật khẩu bị tắt ở production cho tới khi cấu hình dịch vụ gửi email. Đăng nhập có tùy chọn “Ghi nhớ tôi”: bật sẽ giữ phiên 30 ngày; tắt dùng cookie phiên trình duyệt và phiên máy chủ hết hạn sau 12 giờ.

# :maple_leaf: Sprint 1 :maple_leaf:
- Đăng ký, đăng nhập và đăng xuất; mật khẩu được băm bằng scrypt ở máy chủ.
- Gửi lời nhắn liên hệ hoặc thắc mắc đến API.
- Trang quản trị: quản lý đơn tour, khách hàng và biểu mẫu liên hệ.
- Xem tour nổi bật, tìm kiếm và lọc theo địa điểm, giá, ngày khởi hành; xem chi tiết và tính giá theo số khách.
- Lưu tài khoản, booking, thanh toán giả lập, đánh giá và lời nhắn trong SQL Server.

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
 ---
# :maple_leaf: Sprint 3 :maple_leaf:
 * Xem đơn đặt Tour mới.
 * Quản lý đơn đặt Tour (Xem, Lọc, Cập nhật trạng thái,..).
 * Xuất danh sách khách hàng của một Tour cụ thể.
 * Quản lý Danh mục Địa điểm (Thêm, Sửa, Xóa).
 * Quản lý Lịch trình chi tiết & Hình ảnh Tour.
 * Xem biểu đồ thống kê doanh thu.
 * Quản lí khách hàng (Thêm, Sửa, Xóa tài khoản khách hàng ).
 * Quên mật khẩu.

## Cấu trúc
```text
traveller-team/
├── server/                     
│   ├── data/                   
│   │   └── app-data.json       
│   ├── admin-revenue.js        
│   ├── availability.js         
│   ├── bookings.js             
│   ├── database.js             
│   ├── destinations-data.js    
│   ├── index.js                
│   ├── passengers.js           
│   ├── reviews.js              
│   ├── tour-content.js         
│   ├── tours.js                
│   └── vouchers.js             
│
├── src/                        
│   ├── features/               
│   │   ├── account-menu.js     
│   │   ├── admin-revenue.js    
│   │   ├── admin-tour-content.js
│   │   ├── auth.js             
│   │   ├── booking-flow.js     
│   │   ├── booking-format.js   
│   │   ├── contact.js          
│   │   ├── featured-tours.js   
│   │   ├── image-compress.js   
│   │   ├── navigation.js       
│   │   ├── realtime.js         
│   │   ├── revenue-charts.js   
│   │   ├── review-dialog.js    
│   │   ├── review-ui.js        
│   │   ├── support-widget.js   
│   │   ├── tour-reviews.js     
│   │   └── tours.js            
│   ├── admin-login.js          
│   ├── admin.js                
│   ├── booking-detail.js       
│   ├── booking-history.js      
│   ├── checkout.js             
│   ├── checkout.jsx            
│   ├── contact-page.js        
│   ├── main.js                
│   ├── profile.js             
│   ├── style.css              
│   ├── tour-detail.js         
│   └── tour-list.js           
│
├── .env.example              
├── .gitignore                 
├── admin-login.html           
├── admin.html                 
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
