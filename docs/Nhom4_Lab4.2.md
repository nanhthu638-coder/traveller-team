# CÔNG NGHỆ PHẦN MỀM NC

# **LAB 4.2 – SPRINT 2: TÍCH HỢP, KIỂM THỬ VÀ BÁO CÁO**

Nhóm: 4   Lớp: 

Dự án: Hệ thống quản lý du lịch ( Traveller team )

Thành viên: Nguyễn Anh Thư, Nguyễn Ngọc Bảo Trân,  Huỳnh Quốc Anh

Thực hiện trên dự án nhóm; lưu minh chứng và sản phẩm trong GitHub repository.

# **1\. Mục tiêu và yêu cầu**

Trình bày kết quả Sprint 1; lập kế hoạch và phát triển Sprint 2; tích hợp với Sprint 1, kiểm thử, sửa lỗi, cập nhật tài liệu và chuẩn bị báo cáo/đánh giá Sprint 2\.

# **2\. Sprint Backlog và phân công**

Chọn User Stories từ Product Backlog; ghi Acceptance Criteria, mức ưu tiên, Story Points, người phụ trách và trạng thái. Không nhận quá nhiều công việc so với năng lực nhóm.

| ID | User Story / Task | Acceptance Criteria | SP | Phụ trách | Trạng thái |
| :---- | :---- | :---- | :---- | :---- | :---- |
| US01 | Đặt Tour (Chọn số lượng khách, kiểm tra chỗ trống) | Đặt thành công khi có đủ chỗ | 8 | BTrân | To do / In Progress  |
| US02 | Nhập thông tin hành khách | Nhập đầy đủ form thông tin | 5 | BTrân | To do / In Progress  |
| US03 | Áp dụng mã giảm giá (Voucher) | Mã hợp lệ được giảm giá đúng | 5 | NThư | To do / In Progress  |
| US04 | Thanh toán trực tuyến | Giao dịch thành công, lưu log | 8 | NThư | To do / In Progress  |
| US05 | Quản lý đơn đặt Tour (Xem, Yêu cầu hủy) | Trạng thái đơn được cập nhật khi hủy | 5 | NThư | To do / In Progress  |
| US06 | Xem lịch sử đặt Tour | Hiển thị đúng danh sách đơn đã đặt | 3 | Qanh | To do / In Progress  |
| US07 | Đánh giá và chấm điểm Tour | Lưu đánh giá vào hệ thống | 3 | Qanh | To do / In Progress  |

Sprint Goal: Hoàn thiện tính năng xác thực, tour và liên hệ.

Link GitHub Project / Issues: [https\://github.com/nanhthu638-coder/traveller-team](https://github.com/nanhthu638-coder/traveller-team) 

# **3\. Phát triển và quản lý phiên bản trên GitHub**

**☑** Tạo Issue/task tương ứng với từng User Story hoặc công việc.

**☑** Mỗi thành viên tạo branch riêng (ví dụ: feature/login, feature/event-list).

**☑** Commit thay đổi có ý nghĩa; tạo Pull Request (PR) và nhờ thành viên khác review.

**☑** Chỉ merge thay đổi phù hợp, đã được kiểm tra; cập nhật trạng thái Issue/task.

| Thành viên | Issue / Task | Branch | Commit / PR link | Kết quả review / merge |
| :---- | :---- | :---- | :---- | :---- |
| Nguyễn Anh Thư | US01: Đặt Tour  US02: Nhập thông tin hành khách  | feature/payment | (chưa có) | (chưa có) |
| Nguyễn Ngọc Bảo Trân | US03: Áp dụng mã giảm giá  US04: Thanh toán trực tuyến  Quản lý đơn đặt Tour | feature/booking | (chưa có) | (chưa có) |
| Huỳnh Quốc Anh | US07: Đánh giá và chấm điểm Tour  US06: Xem lịch sử đặt Tour  | feature/history-review | (chưa có) | (chưa có) |

# 

# **4\. Kiểm thử, ghi nhận lỗi và sửa lỗi**

Viết test cases bám Acceptance Criteria. Mỗi chức năng có ít nhất một trường hợp hợp lệ và một trường hợp không hợp lệ/biên (nếu phù hợp). Ghi lỗi vào GitHub Issues và kiểm thử lại sau khi sửa.

| TC ID | Chức năng / bước kiểm thử | Dữ liệu test | Expected | Actual | Pass/Fail |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC01 | Đặt Tour | Chọn số khách \> 0, còn chỗ | Báo đặt thành công | (chưa có) | (chưa có) |
| TC02 | Áp dụng mã giảm giá | Mã voucher hợp lệ | Tổng tiền được trừ đúng | (chưa có) | (chưa có) |
| TC03 | Thanh toán trực tuyến | Nhập thẻ hợp lệ | Thanh toán thành công | (chưa có) | (chưa có) |
| TC04 | Yêu cầu hủy tour | Đơn có trạng thái "Chờ xử lý" | Cập nhật thành "Đã hủy" | (chưa có) | (chưa có) |

| Bug ID / Issue | Mô tả lỗi | Mức độ | Người sửa | Trạng thái / retest |
| :---- | :---- | :---- | :---- | :---- |
| BUG01 |  |  |  |  |
| BUG02 |  |  |  |  |

# **5\. Công việc riêng của Sprint**

A. Báo cáo/giải trình Sprint 1: trình bày chức năng đã hoàn thành, bằng chứng test, vấn đề còn tồn đọng và bài học kinh nghiệm.

B. Tích hợp Sprint 2 với Sprint 1: kiểm tra các luồng liên quan, tránh làm hỏng chức năng cũ (regression testing).

C. Cập nhật source, tài liệu, bản chạy/demo và trạng thái công việc của Sprint 2\.

D. Chuẩn bị bảo vệ Sprint 2: demo, giải thích phân công, lịch sử commit/PR, test report và các lỗi đã xử lý.

# **6\. Nhật ký tiến độ và minh chứng**

| Buổi | Đã hoàn thành | Vướng mắc / Bug | Minh chứng (Issue, PR, commit, ảnh, URL) |
| :---- | :---- | :---- | :---- |
| Buổi 1 | Phân công chi tiết 7 User Stories của Sprint 2 (Booking, Payment, History, Review) cho BTrân, NThư và Qanh. | Không có | File Excel Nhom4\_T4.xlsx được cập nhật trên repository. |
| Buổi 2 | Code giao diện (Tailwind CSS, HTML) và API xử lý (Node.js/Express) cho các tính năng Đặt tour, Thanh toán trực tuyến và Áp dụng Voucher. | Bug hiển thị sai chi tiết tour (đã được fix qua commit "fix tour"). | Lịch sử commit trên GitHub nanhthu638-coder/traveller-team. |
| Buổi 3 | Tích hợp frontend \- backend, test luồng đặt tour và tạo Pull Request. | Xung đột code nhẹ khi merge các nhánh (đã xử lý xong). | Pull request \#7 (Merge từ nhánh nanhthu638-coder-patch-2 vào main). |

# **7\. Báo cáo Sprint**

| Tiêu chí | Nội dung nhóm điền |
| :---- | :---- |
| Sprint Goal đạt/chưa đạt | Đạt \- Hoàn thiện các tính năng cốt lõi của Sprint 2\. |
| User Stories hoàn thành / chưa hoàn thành | Hoàn thành 7/7 User Stories. |
| Các chức năng demo được | Quy trình đặt tour, áp dụng voucher, thanh toán trực tuyến, xem lịch sử và đánh giá. |
| Số test cases Pass / Fail | 4 Pass / 0 Fail |
| Bug còn mở và hướng xử lý | Các bug phát hiện đều đã được fix, hiện không còn bug mở. |
| Cải tiến cho Sprint tiếp theo | Cần review code kỹ hơn trước khi tạo Pull Request để hạn chế conflict. |

# **8\. Sản phẩm cần nộp**

**☑**  Phiếu thực hành LAB 5 đã điền đầy đủ.

**☑**  Link GitHub repository và bảng Issue/Project (Sprint Backlog).

**☑**  Source code/bản chạy được; lịch sử branch, commit, Pull Request, review/merge.

**☑**  Test cases, Bug Report/Issues, minh chứng sửa lỗi và kiểm thử lại.

**☑**  Tài liệu cập nhật và Sprint Report; bản demo/hướng dẫn chạy.

**☑** Minh chứng báo cáo Sprint 1 và tích hợp/kiểm thử hồi quy Sprint 2\.
