

# StuWork

Trang tuyển dụng dành cho sinh viên, xây dựng bằng React, Tailwind CSS và Vite. Giao diện có trang chủ responsive, đăng nhập/đăng ký, khôi phục mật khẩu bằng OTP demo và API Node.js dùng bcrypt để băm mật khẩu.

## Chạy ứng dụng

Yêu cầu Node.js 22 trở lên.

```bash
npm install
npm run dev
```

Lệnh trên khởi chạy Vite tại `http://localhost:5173` và API tại `http://localhost:3001`. Tạo tài khoản để thử đăng nhập; dữ liệu tài khoản được lưu trong SQLite tại `server/data/stuwork.sqlite` và mật khẩu được băm bằng bcrypt.

Trong môi trường phát triển, OTP được tạo ngẫu nhiên và hiển thị trong giao diện để tiện thử luồng đặt lại mật khẩu. API không gửi email hoặc SMS thật. Endpoint OTP sẽ từ chối chạy trong môi trường production cho đến khi tích hợp nhà cung cấp gửi mã. Bộ nhớ OTP và mã đặt lại chỉ tồn tại trong thời gian chạy của API.

Để bật hộp thư hỗ trợ, cấu hình đầy đủ `SUPPORT_NAME`, `SUPPORT_EMAIL`, `SUPPORT_PHONE` và `SUPPORT_PASSWORD` trước khi chạy API. Nếu không cấu hình, tài khoản hỗ trợ sẽ không được tạo. Phiên đăng nhập được lưu trong bộ nhớ và hết hạn sau 12 giờ; khởi động lại API sẽ kết thúc các phiên hiện tại.

SQLite và các file WAL/SHM nằm trong `server/data/` và không được Git theo dõi. Không xóa các file này khi ứng dụng đang chạy; hãy sao lưu cả bộ trước khi di chuyển dữ liệu.

## Hồ sơ, tải CV và ứng tuyển

Người dùng có role `seeker` (tài khoản thường) dùng được các chức năng sau, tất cả đều yêu cầu đăng nhập:

- **Cập nhật hồ sơ**: mở menu tài khoản → "Cập nhật hồ sơ & tải CV". Sửa họ tên, số điện thoại, trường, ngành, năm tốt nghiệp, kỹ năng, giới thiệu bản thân. Email không đổi được vì là định danh đăng nhập.
- **Tải CV**: hỗ trợ PDF, DOC, DOCX, tối đa 5 MB. Server kiểm tra phần mở rộng và byte đầu của file, lưu với tên ngẫu nhiên trong `server/data/cvs/` (không được Git theo dõi). Có thể thay, tải về hoặc xóa CV.
- **Ứng tuyển**: ở trang chi tiết công việc. Server kiểm tra theo thứ tự: đã có CV, chưa quá hạn nộp, chưa ứng tuyển trước đó, còn slot. Slot còn lại = `slots` trong `src/jobsData.js` trừ số đơn đang hiệu lực; việc kiểm tra và ghi đơn nằm trong một transaction nên không bị vượt slot khi nhiều người nộp cùng lúc. Người dùng có thể rút đơn để trả lại slot. Đơn lưu kèm bản CV tại thời điểm nộp.

| Phương thức | Đường dẫn | Mô tả |
| --- | --- | --- |
| GET / PUT | `/api/profile` | Xem / cập nhật hồ sơ |
| POST / GET / DELETE | `/api/profile/cv` | Tải lên (body nhị phân, header `X-File-Name`) / tải về / xóa CV |
| GET | `/api/jobs/:id/availability` | Slot còn lại, hạn nộp, trạng thái ứng tuyển của người đang đăng nhập |
| POST | `/api/jobs/:id/apply` | Ứng tuyển, body `{ "coverLetter": "..." }` (không bắt buộc) |
| GET | `/api/applications` | Lịch sử ứng tuyển |
| DELETE | `/api/applications/:id` | Rút đơn ứng tuyển |

Danh sách công việc và số slot tổng vẫn nằm trong `src/jobsData.js`, server đọc trực tiếp từ file này. Hạn nộp (`deadline`, dạng `dd/mm/yyyy`) được tính đến hết ngày đó.

## Kiểm tra

```bash
npm run build
npm run lint
```

## Ghi chú triển khai

Đây là nền tảng giao diện và API mẫu, chưa bao gồm xác thực email/số điện thoại, tích hợp OAuth, nhà cung cấp gửi OTP, lưu phiên đăng nhập bền vững, giới hạn tốc độ phân tán hoặc quy trình vận hành production. Cần bổ sung các thành phần đó trước khi triển khai xác thực cho người dùng thực.
