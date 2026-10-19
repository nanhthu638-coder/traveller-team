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

# :maple_leaf: Sprint 2 :maple_leaf:

 * **Xem lịch sử đặt tour** (`booking-history.html`, `booking-detail.html`): Trang chủ → avatar tài khoản → *Lịch sử đặt tour*.
   * Danh sách đơn: tên tour, ảnh, mã đặt tour, ngày đặt, ngày khởi hành, số khách, tổng tiền, trạng thái đặt tour và thanh toán.
   * Tìm theo tên tour / điểm đến / mã đặt tour (không phân biệt dấu), lọc theo trạng thái đặt tour (kèm số đếm), trạng thái thanh toán, sắp xếp.
   * Nút *Xem chi tiết* mở trang chi tiết đơn (thông tin chuyến đi, người đặt, bảng giá).
   * Luồng ngoại lệ: chưa đăng nhập → trang đăng nhập (xong quay lại đúng trang); chưa có đơn → thông báo + nút *Khám phá tour*; lỗi tải → thông báo + *Thử lại*.
   * Bảo mật: API chỉ trả đơn của chính tài khoản đang đăng nhập; đơn của người khác trả 404.
 * Menu avatar tài khoản dùng chung cho mọi trang (`src/features/account-menu.js`).

 * **Đánh giá và chấm điểm tour**:
   * Xem: Trang chủ → chọn tour → trang chi tiết tour → mục *Đánh giá và nhận xét* (điểm trung bình, tổng lượt, phân bố 1–5 sao, danh sách nhận xét kèm ảnh, sắp xếp mới nhất / điểm cao / điểm thấp).
   * Viết: Lịch sử đặt tour → chọn đơn **đã hoàn thành** → *Đánh giá tour* → chọn sao, nhập nhận xét (≥ 10 ký tự), đính kèm tối đa 3 ảnh → *Gửi đánh giá*. Cũng viết được ngay ở trang chi tiết tour.
   * Sửa / xóa đánh giá của chính mình. Mỗi đơn đánh giá 1 lần.
   * Xác thực: server chỉ nhận đánh giá của chủ đơn **đã hoàn thành**; ảnh được nén về JPEG ở trình duyệt và server kiểm tra lại định dạng thật (tối đa 1 MB/ảnh).
   * Điểm "4.8" cố định cũ đã được thay bằng điểm trung bình thật ở trang chi tiết tour, danh sách tour, tour nổi bật ở trang chủ (tour chưa có đánh giá hiện *Chưa có đánh giá*).
 * **Đặt tour** ngay tại trang chi tiết tour: chọn ngày khởi hành (chỉ hiện các ngày còn hiệu lực), số khách, số điện thoại, ghi chú → tạo đơn → chuyển sang trang chi tiết đơn với thông báo thành công. Đơn mới ở trạng thái *Chờ xử lý* + *Chưa thanh toán* và xuất hiện ngay trong Lịch sử đặt tour.
   * Server kiểm tra lại mọi dữ liệu: ngày khởi hành hợp lệ và chưa qua, ít nhất 1 người lớn, tối đa 20 khách mỗi loại, số điện thoại đúng định dạng.

### API đơn đặt tour

| Phương thức | Đường dẫn | Mô tả |
| --- | --- | --- |
| GET | `/api/bookings?q=&status=&payment=&sort=` | Lịch sử đặt tour của người dùng đang đăng nhập (`status`: pending / confirmed / completed / cancelled; `payment`: unpaid / paid / refunded; `sort`: newest / departure-asc / total-desc) |
| GET | `/api/bookings/:id` | Chi tiết một đơn (chỉ đơn của mình) |
| POST | `/api/bookings` | Tạo đơn `{ tourId, departureDate, passengers: { adult, child, infant }, phone?, note? }` – được trang chi tiết tour gọi khi bấm *Đặt tour* |
| GET | `/api/tours/:id/reviews?sort=` | Điểm trung bình, phân bố sao và danh sách đánh giá của tour (công khai; `sort`: newest / highest / lowest). Kèm `mine` = quyền đánh giá của người đang đăng nhập (`ok` / `reviewed` / `not-completed` / `not-booked` / `login`) |
| POST | `/api/bookings/:id/review` | Gửi đánh giá `{ rating, comment, images?: [dataURL JPEG] }` – chỉ chủ đơn, đơn đã hoàn thành, 1 lần/đơn |
| PUT | `/api/reviews/:id` | Sửa đánh giá của mình (`images` gồm đường dẫn ảnh cũ muốn giữ + ảnh mới) |
| DELETE | `/api/reviews/:id` | Xóa đánh giá của mình (xóa cả ảnh đính kèm) |
| GET | `/api/review-images/:file` | Ảnh đính kèm đánh giá |
| POST | `/api/dev/bookings/:id/complete` | Giả lập đơn đã hoàn thành để thử đánh giá (tắt khi `NODE_ENV=production`) |
| POST | `/api/dev/demo-bookings` | Tạo 6 đơn mẫu (kèm một số đánh giá mẫu của khách khác) cho tài khoản đang đăng nhập (tắt khi `NODE_ENV=production`) |

Để xem thử khi phát triển: chạy `npm run dev`, đăng nhập, vào *Lịch sử đặt tour*, bấm **Tạo dữ liệu mẫu** ở trạng thái rỗng. Với đơn của chính bạn chưa hoàn thành, trang chi tiết đơn có nút *Giả lập: đánh dấu đã hoàn thành* (chỉ khi phát triển) để thử luồng đánh giá.

## Cấu trúc

```text
index.html
tour-list.html
tour-detail.html
booking-history.html
booking-detail.html
src/
  features/account-menu.js
  features/auth.js
  features/booking-format.js
  features/review-ui.js
  features/review-dialog.js
  features/tour-reviews.js
  features/contact.js
  features/featured-tours.js
  features/tours.js
  main.js
  style.css
  tour-list.js
  tour-detail.js
  booking-history.js
  booking-detail.js
server/
  data/app-data.json
  bookings.js
  reviews.js
  index.js
  tours.js
vite.config.js
```
## 📌 Pull Requests đã thực hiện

- [PR #8: Update README.md](https://github.com/nanthu638-coder/traveller-team/pull/8)
- [PR #3: Change search](https://github.com/nanthu638-coder/traveller-team/pull/3)
---
- Excel
  * Link access: https://docs.google.com/spreadsheets/d/1tG4tDlw2bT8fQgMii-VEUp_I7WRxZ7zSyKmIA1J_7iU/edit?usp=sharing
- Docs
  * Link access Nhom4_Lab4.1: https://docs.google.com/document/d/1KIsDL5-5ESIB9BfOeZTKzox-B9mEKBlDRTpk73BD6s8/edit?usp=sharing
  * Link access Nhom4_Lab4.2: https://docs.google.com/document/d/1B3PK5EkUFVLVzMVA0jzjIE2PT7JaABEu1hiBlVBzdS8/edit?usp=sharing
