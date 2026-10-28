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

## Trang quản trị

Trong file `.env` ở thư mục gốc, đặt `ADMIN_EMAILS` thành email của tài khoản quản trị (có thể phân cách nhiều email bằng dấu phẩy), rồi khởi động lại server. Nếu file `.env` đang dùng biến cũ `SUPPORT_EMAILS`, thay tên biến bằng `ADMIN_EMAILS` và dùng đúng email đăng nhập của tài khoản; không ghi mật khẩu vào biến này. Tạo tài khoản qua chức năng đăng ký với đúng email đã cấu hình; sau đó vào `/admin-login.html` và đăng nhập bằng email/mật khẩu đó. Do ứng dụng chưa xác minh email, chỉ cấu hình địa chỉ email mà bạn kiểm soát; không dùng email quản trị công khai để tự đăng ký trên môi trường triển khai.

Trang `/admin.html` cho phép duyệt đơn mới, cập nhật đơn đã xác nhận thành hoàn tất, xem/lọc đơn, duyệt hoặc từ chối yêu cầu hủy, quản lý tài khoản khách hàng và đánh dấu biểu mẫu liên hệ đã xử lý. Muốn xuất danh sách khách của một tour, chọn tour rồi bấm **Xuất khách tour này (PDF)**; hộp thoại in của trình duyệt cho phép lưu thành PDF. Danh sách gồm thông tin người đặt và chi tiết hành khách có trong đơn. Đơn tour cũ không có dữ liệu chi tiết hành khách sẽ được ghi chú trong báo cáo.

Biểu mẫu liên hệ được lưu trực tiếp vào hệ thống và xử lý trong trang quản trị; ứng dụng không gửi email và không cần cấu hình SMTP. Khi duyệt hủy, trạng thái thanh toán không tự động hoàn tiền; việc hoàn tiền cần được xử lý riêng.

Đây là bản nền tảng để chạy cục bộ. Trước khi triển khai công khai, cần bổ sung giới hạn lượt đăng nhập/gửi biểu mẫu, chính sách sao lưu dữ liệu và HTTPS.
