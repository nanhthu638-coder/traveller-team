# ✈️ Traveller Team - Website Đặt Tour Du Lịch

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)

**Traveller Team** là một hệ thống website đặt tour du lịch trực tuyến, được phát triển qua 3 Sprint của môn học Công nghệ Phần mềm Nâng cao. Dự án cung cấp trải nghiệm tìm kiếm, đặt tour cho khách hàng và hệ thống quản trị toàn diện cho Admin.

## 📖 Mục lục
- [1. Giới thiệu tính năng](#1-giới-thiệu-tính-năng)
- [2. Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
- [3. Yêu cầu hệ thống](#3-yêu-cầu-hệ-thống)
- [4. Hướng dẫn cài đặt và chạy](#4-hướng-dẫn-cài-đặt-và-chạy)
- [5. Tài khoản Demo](#5-tài-khoản-demo)
- [6. Cấu trúc dự án](#6-cấu-trúc-dự-án)
- [7. Release & Đóng gói](#7-release--đóng-gói)

---

## 1. Giới thiệu tính năng

Dự án đã hoàn thành các tính năng qua 3 Sprint:

### 🍁 Sprint 1: Khách hàng & Giao diện
*   Xem danh sách tour, tìm kiếm, xem chi tiết tour.
*   Đăng ký / Đăng nhập, gửi form liên hệ.

### 🍁 Sprint 2: Giao dịch & Tương tác
*   **Đặt tour & Thanh toán:** Đặt tour trực tuyến, áp dụng mã giảm giá (voucher). 
*   **Thanh toán giả lập:** Trang checkout hỗ trợ thẻ Visa/Mastercard mẫu, thẻ ATM nội địa mẫu và mã seri được tạo cho từng giao dịch. API chỉ ghi nhận phương thức giả lập, **không gửi hoặc lưu số thẻ/tên chủ thẻ**. Khi xác nhận, máy chủ cập nhật trạng thái payment và booking.
    *   *(Lưu ý: Luồng này chỉ phục vụ đồ án/demo, không xử lý tiền thật. Trạng thái tour không chuyển thành `completed` khi vừa thanh toán; trạng thái này chỉ dành cho tour đã hoàn thành).*
*   **Khôi phục mật khẩu (OTP):** Trong môi trường demo, người dùng có thể yêu cầu OTP 6 chữ số ở màn hình đăng nhập. OTP hết hạn sau 5 phút, giới hạn 5 lần nhập và chỉ được hiển thị trực tiếp trong giao diện demo; không gửi OTP qua email.
*   **Ghi nhớ đăng nhập:** Tùy chọn "Ghi nhớ tôi" bật sẽ giữ phiên 30 ngày; tắt dùng cookie phiên trình duyệt và phiên máy chủ hết hạn sau 12 giờ.

### 🍁 Sprint 3: Quản trị viên
*   Quản lý danh sách tour (Thêm/Sửa/Xóa), quản lý địa điểm, quản lý khách hàng.
*   Xem thống kê doanh thu, xem lịch sử đặt tour.

## 2. Công nghệ sử dụng
*   **Frontend:** HTML, Tailwind CSS, JavaScript (Vite).
*   **Backend:** Node.js, Express.js.
*   **Database:** SQL Server (Hỗ trợ cơ chế fallback tự động sang file JSON).
*   **Xác thực:** JWT (JSON Web Token), mã hóa mật khẩu với `crypto` (Salt & Hash).

## 3. Yêu cầu hệ thống
*   **Node.js:** Phiên bản `>= 18.0.0` (Khuyên dùng bản LTS).
*   **NPM:** Phiên bản `>= 9.0.0`.
*   **SQL Server:** (Tùy chọn) Nếu muốn chạy với CSDL thật. 
*   **Trình duyệt:** Chrome, Edge, Safari hoặc Firefox phiên bản mới nhất.

## 4. Hướng dẫn cài đặt và chạy

**Bước 1: Clone mã nguồn từ GitHub**
```bash
git clone https://github.com/nanhthu638-coder/traveller-team.git
cd traveller-team
```
**Bước 2: Cài đặt các thư viện phụ thuộc**
```bash
npm install
```
**Bước 3: Cấu hình biến môi trường (Environment Variables)**
* Copy file .env.example thành .env.
* Mở file .env và điền các thông số (nếu dùng SQL Server):
```env
PORT=3000
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=TravellerDB
```
**Bước 4: Khởi chạy Server và Frontend**
```bash
npm run dev
```
**Bước 5: Truy cập ứng dụng**
* Mở địa chỉ Vite hiển thị trong terminal (mặc định: http://localhost:5173).
* API Node.js chạy ở cổng 3000 và được Vite chuyển tiếp (proxy) tự động.

# ⚠️ Cơ chế Fallback Database:
Nếu không cấu hình SQL Server (SQLSERVER_USER / SQLSERVER_PASSWORD), máy chủ tự động chạy ở chế độ fallback bằng server/data/app-data.json để dự án vẫn khởi động được trong môi trường demo/local.
Khi có SQL Server, bảng dbo.AppRecords được tạo nếu chưa có. Nếu bảng đang trống, máy chủ nhập dữ liệu từ file JSON (nếu có). Nếu SQL đã có bản ghi, SQL được dùng làm nguồn chính và file JSON được giữ nguyên, không tự động gộp.

## 5. Tài khoản Demo
Dành cho việc nghiệm thu và chạy thử (Dữ liệu mẫu có sẵn trong file app-data.json):

Vai trò	Email đăng nhập	Mật khẩu	Ghi chú
* Admin	:     admin@example.com	   (Điền mật khẩu của bạn vào đây)	Toàn quyền quản trị
* Khách hàng:	user1@example.com	   (Điền mật khẩu của bạn vào đây)	 Tài khoản khách

## 6. Cấu trúc dự án
```test
traveller-team/
├── docs/                  # Chứa tài liệu thiết kế, báo cáo
├── public/                # Chứa các tài nguyên tĩnh (hình ảnh, icon)
├── server/                # Mã nguồn Backend (Node.js/Express)
│   ├── data/              # Chứa file dữ liệu JSON (app-data.json)
│   ├── routes/            # Các API endpoints
│   └── index.js           # File khởi chạy server
├── src/                   # Mã nguồn Frontend (HTML, JS, CSS)
├── .env.example           # File mẫu cấu hình môi trường
├── package.json           # Danh sách thư viện và scripts
└── README.md              # Hướng dẫn sử dụng (File này)
```
## 7. Realease & Đóng Gói
* Phiên bản hiện tại: v1.0.0 (Hoàn thiện sau Sprint 3).
* Link Release: Xem chi tiết tại đây
* Release Notes:
* Hoàn thiện toàn bộ luồng đặt tour và thanh toán giả lập.
* Tích hợp tính năng OTP khôi phục mật khẩu cho môi trường demo.
* Thêm bảng điều khiển (Dashboard) cho Admin.
* Sửa các lỗi giao diện từ Sprint 2.

# Giới hạn: Cổng thanh toán hiện tại chỉ là giả lập (Mock API), chưa tích hợp VNPay/Momo thật. API khôi phục mật khẩu qua email thật đang bị tắt cho tới khi cấu hình dịch vụ gửi mail.
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
  * Link access Nhom4_Lab6:   https://docs.google.com/document/d/1Nf03SPij8G0znanWDw3Ss4lWrvl-YZ8SenX6Jz3g7hM/edit?usp=sharing
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
