# Test Cases – Traveller Team

> Tài liệu kiểm thử tích hợp và hồi quy. Nội dung được chuyển từ `TestCases.xlsx` sang Markdown; các trường chưa có dữ liệu được giữ nguyên là “Chưa ghi nhận”.

## Tổng quan

| Hạng mục | Số lượng |
|---|---:|
| Tổng số test case | 6 |
| Integration | 4 |
| Regression | 2 |
| Pass | 6 |
| Fail | 0 |
| Blocked | 0 |

## Danh sách test case

| Test ID | Loại | Sprint | Chức năng / Luồng | Pass/Fail |
|---|---|---|---|---|
| TC01 | Integration | 1 & 2 | Đăng nhập → Tìm kiếm tour → Đặt tour → Thanh toán → Kiểm tra DB | Pass |
| TC02 | Integration | 2 | Đặt tour – kiểm tra chỗ trống (boundary) | Pass |
| TC03 | Integration | 2 | Đặt tour → Áp dụng voucher → Thanh toán → Hóa đơn | Pass |
| TC04 | Integration | 1 & 2 | Đăng nhập → Lịch sử đặt tour → Đánh giá → Trang chi tiết tour | Pass |
| TC05 | Regression | 1 & 2 | Đăng ký tài khoản → Đăng nhập | Pass |
| TC06 | Regression | 1 & 2 | Tìm kiếm tour – trường hợp không có kết quả | Pass |

### TC01 – Đăng nhập → Tìm kiếm tour → Đặt tour → Thanh toán → Kiểm tra DB

- **Loại:** Integration
- **Sprint:** 1 & 2
- **Điều kiện tiên quyết:** Tài khoản test tồn tại; tour "Hạ Long" còn chỗ

**Bước thực hiện / Input**

1. Đăng nhập (user: testuser, pass: ***)
2. Tìm kiếm “Hạ Long”
3. Bấm “Đặt tour” (SL: 2 người lớn)
4. Bấm “Thanh toán”
5. Mở app-data.json / dbo.AppRecords, kiểm tra collection bookings

**Expected Result**

Hệ thống báo “Đặt tour thành công”. Collection bookings có 1 record mới với status = 'Paid' và totalAmount đúng.

**Actual Result**

Hệ thống báo thành công; record có status = 'Paid'.

- **Pass/Fail:** Pass
- **Tester:** Chưa ghi nhận
- **Test Date:** Chưa ghi nhận
- **Environment:** Chưa ghi nhận
- **Ghi chú:** Không dùng mật khẩu thật; “Bookings table” đã sửa thành collection bookings cho khớp thiết kế

---

### TC02 – Đặt tour – kiểm tra chỗ trống (boundary)

- **Loại:** Integration
- **Sprint:** 2
- **Điều kiện tiên quyết:** Tour sắp khởi hành còn đúng 12 chỗ

**Bước thực hiện / Input**

1. Đăng nhập
2. Chọn tour còn 12 chỗ
3. Nhập 13 khách (13 người lớn)
4. Bấm “Đặt tour”

**Expected Result**

Hệ thống chặn và báo lỗi “Số lượng khách vượt quá số chỗ còn trống”. Không cho thanh toán.

**Actual Result**

Hệ thống không cho đặt, yêu cầu chọn ngày khác, khóa nút “Tiếp tục nhập thông tin hành khách”.

- **Pass/Fail:** Pass
- **Tester:** Chưa ghi nhận
- **Test Date:** Chưa ghi nhận
- **Environment:** Chưa ghi nhận
- **Ghi chú:** Actual khác Expected (yêu cầu chọn ngày khác thay vì báo lỗi trực tiếp) – cần xác nhận lại yêu cầu nghiệp vụ

---

### TC03 – Đặt tour → Áp dụng voucher → Thanh toán → Hóa đơn

- **Loại:** Integration
- **Sprint:** 2
- **Điều kiện tiên quyết:** Tour giá 5.000.000đ; voucher CHAO10 giảm 10% (tối đa 500.000đ)

**Bước thực hiện / Input**

1. Chọn tour → Đặt tour
2. Nhập voucher CHAO10
3. Bấm “Thanh toán trực tuyến”
4. Kiểm tra hóa đơn

**Expected Result**

Tổng tiền = 5.000.000 − 500.000 = 4.500.000đ. Hóa đơn hiển thị đúng số tiền; trạng thái đơn → “Đã thanh toán”.

**Actual Result**

Số tiền được trừ đúng; trạng thái đơn cập nhật.

- **Pass/Fail:** Pass
- **Tester:** Chưa ghi nhận
- **Test Date:** Chưa ghi nhận
- **Environment:** Chưa ghi nhận
- **Ghi chú:** Cần bổ sung case voucher hết hạn / sai mã

---

### TC04 – Đăng nhập → Lịch sử đặt tour → Đánh giá → Trang chi tiết tour

- **Loại:** Integration
- **Sprint:** 1 & 2
- **Điều kiện tiên quyết:** Tài khoản có lịch sử đặt tour đã hoàn thành

**Bước thực hiện / Input**

1. Đăng nhập
2. Vào “Lịch sử đặt tour”
3. Chọn tour đã đi, bấm “Đánh giá”
4. Chọn 5 sao, nhập bình luận “Tour rất tuyệt vời”, gửi
5. Quay lại trang Chi tiết tour

**Expected Result**

Đánh giá gửi thành công. Trang Chi tiết tour hiển thị đúng 5 sao và bình luận “Tour rất tuyệt vời” ở phần đánh giá khách hàng.

**Actual Result**

Đánh giá hiển thị đúng vị trí.

- **Pass/Fail:** Pass
- **Tester:** Chưa ghi nhận
- **Test Date:** Chưa ghi nhận
- **Environment:** Chưa ghi nhận
- **Ghi chú:** Bảng gốc bị vỡ qua 2 trang – đã gộp; cần xác nhận nội dung bình luận hiển thị đúng

---

### TC05 – Đăng ký tài khoản → Đăng nhập

- **Loại:** Regression
- **Sprint:** 1 & 2
- **Điều kiện tiên quyết:** Email mới chưa tồn tại trong hệ thống

**Bước thực hiện / Input**

1. Mở form “Đăng ký tài khoản”
2. Nhập email hello@123, mật khẩu hợp lệ
3. Bấm “Đăng ký”
4. Dùng tài khoản vừa tạo để “Đăng nhập”

**Expected Result**

Tài khoản được tạo thành công và có thể đăng nhập bình thường.

**Actual Result**

Tài khoản tạo thành công, đăng nhập thành công.

- **Pass/Fail:** Pass
- **Tester:** Chưa ghi nhận
- **Test Date:** Chưa ghi nhận
- **Environment:** Chưa ghi nhận
- **Ghi chú:** Liên quan BUG02 (chưa tự động đăng nhập sau đăng ký) – test case này không kiểm tra hành vi tự động đăng nhập

---

### TC06 – Tìm kiếm tour – trường hợp không có kết quả

- **Loại:** Regression
- **Sprint:** 1 & 2
- **Điều kiện tiên quyết:** Đã đăng nhập hoặc khách vãng lai

**Bước thực hiện / Input**

1. Vào thanh tìm kiếm
2. Nhập “Tour Sao Hỏa”
3. Chọn mức giá 10.000.000đ – 20.000.000đ
4. Bấm “Tìm kiếm”

**Expected Result**

Hệ thống hiển thị “Không tìm thấy Tour nào phù hợp”, không crash, không hiển thị sai dữ liệu.

**Actual Result**

Hệ thống báo không tìm thấy, UI hiển thị bình thường.

- **Pass/Fail:** Pass
- **Tester:** Chưa ghi nhận
- **Test Date:** Chưa ghi nhận
- **Environment:** Chưa ghi nhận
- **Ghi chú:** Nên bổ sung case từ khóa tồn tại + filter giá có/không có kết quả để kiểm tra logic filter thực sự

---

## Quy ước cập nhật

- Cập nhật **Actual Result** sau khi thực thi kiểm thử.
- Chọn trạng thái `Pass`, `Fail` hoặc `Blocked` cho từng test case.
- Ghi rõ Tester, Test Date và Environment khi có kết quả chạy thực tế.
- Nếu Expected Result và Actual Result khác nhau, cần ghi nhận và xác minh yêu cầu nghiệp vụ hoặc tạo defect phù hợp.
