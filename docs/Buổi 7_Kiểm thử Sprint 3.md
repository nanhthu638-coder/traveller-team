# **BÀI THỰC HÀNH – BUỔI 7** **TÍCH HỢP HỆ THỐNG, KIỂM THỬ VÀ LẬP KẾ HOẠCH SPRINT 3**

Học phần: Thực hành Công nghệ phần mềm nâng cao  \|  Thời lượng: 3 tiết

| Nhóm | Tên dự án | Lớp | GitHub Repository URL |
| :---- | :---- | :---- | :---- |
| 4 | Traveller team |  | https\://github.com/nanhthu638-coder/traveller-team.git |

Bối cảnh: Nhóm đã hoàn thành và báo cáo Sprint 1, Sprint 2\. Buổi này tập trung xác nhận phần mềm tích hợp hoạt động ổn định, ghi nhận lỗi và chuẩn bị Sprint 3\.

# **1\. MỤC TIÊU VÀ YÊU CẦU CHUNG**

✓ Tích hợp các chức năng Sprint 1–2 thành một phiên bản chạy được.

✓ Thực hiện Integration Testing và Regression Testing có minh chứng.

✓ Quản lý lỗi bằng GitHub Issues, theo dõi xử lý và kiểm thử lại.

✓  Lập Sprint 3 Goal và Sprint 3 Backlog dựa trên tình trạng thực tế của dự án.

Yêu cầu: thao tác trên repository của nhóm; sử dụng dữ liệu thử nghiệm, không đưa mật khẩu/API key hoặc thông tin cá nhân thật lên GitHub.

# **2\. NHIỆM VỤ 1 – SPRINT 2 RETROSPECTIVE**

Thảo luận ngắn trong nhóm; ghi ít nhất 01 ý cho mỗi nội dung.

| Nội dung | Kết quả của nhóm |
| :---- | :---- |
| Điều nhóm đã làm tốt | Hoàn thành đúng tiến độ các chức năng của Sprint 1 và Sprint 2 (Đặt tour, thanh toán, quản lý tài khoản). Code được review chéo và merge lên nhánh chính ổn định. |
| Vấn đề/kỹ thuật còn tồn tại | Một số lỗi giao diện (UI) hiển thị chưa tốt trên thiết bị di động. Chưa có nhiều dữ liệu mẫu (mock data) để test các trường hợp biên (edge cases) khi tìm kiếm tour. |
| Hành động cải tiến cụ thể | Viết thêm unit test cho các hàm xử lý logic đặt tour. Bổ sung dữ liệu mẫu đa dạng vào database test. Thống nhất dùng chung một component thư viện UI để đồng bộ giao diện. |

# 

# **3\. NHIỆM VỤ 2 – TÍCH HỢP CÁC CHỨC NĂNG SPRINT 1–2**

Bước 1\. Mở repository, kiểm tra branch chính và xác định phiên bản sẽ dùng để tích hợp.  
Bước 2\. Đồng bộ các thay đổi đã được review/merge; chạy ứng dụng với database thử nghiệm.  
Bước 3\. Kiểm tra một luồng nghiệp vụ xuyên suốt nhiều chức năng.  
Bước 4\. Ghi kết quả vào bảng và lưu minh chứng (ảnh chụp hoặc link commit/PR).

| Chức năng/luồng nghiệp vụ | Sprint | Tình trạng tích hợp (Đạt/Chưa đạt) | Minh chứng |
| :---- | :---- | :---- | :---- |
| Tìm kiếm Tour \-\> Xem chi tiết \-\> Đăng nhập \-\> Đặt Tour | 1 & 2 | Đạt | [Issue 23](https://github.com/nanhthu638-coder/traveller-team/issues/23) (UC04) [Issue 15](https://github.com/nanhthu638-coder/traveller-team/issues/15) (UC03) [Issue 27](https://github.com/nanhthu638-coder/traveller-team/issues/27) (UC08) [Issue12](https://github.com/nanhthu638-coder/traveller-team/issues/12) (UC10) [Brach](https://github.com/nanhthu638-coder/traveller-team/tree/search): https\://github.com/nanhthu638-coder/traveller-team/tree/search |
| Chọn Tour \-\> Áp dụng Voucher \-\> Thanh toán trực tuyến | 2  | Đạt | [Issue 30](https://github.com/nanhthu638-coder/traveller-team/issues/30) (UC12) [Issue 11](https://github.com/nanhthu638-coder/traveller-team/issues/11) (UC11) [Brach](https://github.com/nanhthu638-coder/traveller-team/tree/feature/center-booking-dialog):https\://github.com/nanhthu638-coder/traveller-team/tree/feature/center-booking-dialog |
| Quản lý hồ sơ cá nhân \-\> Xem lịch sử đặt Tour | 2 | Đạt | [Issue 31](https://github.com/nanhthu638-coder/traveller-team/issues/31) (UC15) [Issue 09](https://github.com/nanhthu638-coder/traveller-team/issues/9) (UC14) [Brach](https://github.com/nanhthu638-coder/traveller-team/tree/feature/history-review_sprint2):https\://github.com/nanhthu638-coder/traveller-team/tree/feature/history-review\_sprint2 |
| Đăng nhập \-\> Xem lịch sử đặt Tour \-\> Đánh giá và chấm điểm Tour | 1 & 2 | Đạt | [Issue 9](https://github.com/nanhthu638-coder/traveller-team/issues/9) (UC14) [Issue 10](https://github.com/nanhthu638-coder/traveller-team/issues/10) (UC16) [Brach](https://github.com/nanhthu638-coder/traveller-team/tree/feature/history-review_sprint2):https\://github.com/nanhthu638-coder/traveller-team/tree/feature/history-review\_sprint2 |

Ví dụ (Student Event Management System): Login → View Events → Event Registration → kiểm tra bản ghi đăng ký trong database.

# 

# **4\. NHIỆM VỤ 3 – INTEGRATION & REGRESSION TESTING**

Bước 1\. Xác định ít nhất 05 test cases, trong đó có ≥ 02 Integration Tests và ≥ 02 Regression Tests.  
Bước 2\. Chuẩn bị input hợp lệ, không hợp lệ hoặc trường hợp biên.  
Bước 3\. Chạy thử trên phần mềm, so sánh Expected với Actual và ghi Pass/Fail.  
Bước 4\. Lưu file TestCases.xlsx hoặc TestReport.md trong thư mục test/ của repository.

| Test ID / Loại | Bước thực hiện / Input | Expected Result | Actual Result | Pass/Fail |
| :---- | :---- | :---- | :---- | :---- |
| TS01 \- Intergration | 1\. Đăng nhập (user: Blue12 , pass: 12345678912\) 2\. Tìm kiếm tour "Hạ Long" 3\. Bấm "Đặt tour" (SL: 2 người lớn) 4\. Bấm "Thanh toán" 5\. Mở Database kiểm tra bảng Bookings  | Hệ thống báo "Đặt tour thành công". Database xuất hiện 1 record mới với Status \= 'Paid' và tổng tiền đúng.  | Hệ thống báo thành công, DB có record Status \= 'Paid'.  | Pass |
| TC02 \- Intergration | 1\. Đăng nhập 2\. Chọn 1 tour sắp khởi hành (Ví dụ: còn 12 chỗ trống) 3\. Nhập số lượng khách đặt là 13 4\. Bấm "Đặt tour"  | Hệ thống chặn lại và báo lỗi "Số lượng khách vượt quá số chỗ còn trống". Không cho phép thanh toán.  | Hệ thống không cho đặt và yêu cầu chọn ngày khác, đồng thời khoá luôn nút tiếp tục nhập thông tin hành khách | Pass |
| TC03 \- Integration | 1\. Chọn 1 Tour \-\> Đặt Tour. 2\. Nhập mã Voucher hợp lệ (VD: CHAO10 ). 3\. Bấm "Thanh toán trực tuyến". 4\. Kiểm tra hóa đơn. | Tổng tiền thanh toán \= (Giá Tour) \- (Tiền giảm giá từ Voucher). Hóa đơn hiển thị đúng số tiền và trạng thái đơn hàng chuyển sang "Đã thanh toán". | Số tiền được trừ đúng, trạng thái đơn cập nhật. | Pass |
| TC04 \- Integration | 1\. Đăng nhập tài khoản đã có lịch sử đặt tour. 2\. Vào "Lịch sử đặt Tour". 3\. Chọn tour đã đi, bấm "Đánh giá". 4\. Chọn 5 sao, nhập bình luận, gửi. 5\. Ra lại trang Chi tiết Tour. | Đánh giá gửi thành công. Quay lại trang Chi tiết Tour, đánh giá 5 sao và bình luận vừa nhập phải xuất hiện ở phần đánh giá của khách hàng. | Đánh giá hiển thị đúng vị trí. | Pass |
| TC05 \- Regression | 1\. Mở form "Đăng ký tài khoản" 2\. Nhập email hợp lệ, mật khẩu hợp lệ 3\. Bấm "Đăng ký" 4\. Dùng tài khoản vừa tạo để "Đăng nhập"  | Tài khoản được tạo thành công và có thể đăng nhập bình thường vào hệ thống.  | Tài khoản tạo thành công, đăng nhập thành công.  | Pass |
| TC06 \- Regression | 1\. Vào thanh tìm kiếm. 2\. Nhập từ khóa không tồn tại (VD: "Tour Sao Hỏa"). 3\. Kết hợp chọn mức giá từ 10.000.000đ đến 20.000.000đ. 4\. Bấm "Tìm kiếm". | Hệ thống hiển thị thông báo "Không tìm thấy Tour nào phù hợp" thay vì bị lỗi trắng trang (crash) hoặc hiển thị sai dữ liệu. | Hệ thống báo không tìm thấy, UI hiển thị bình thường. | Pass |

Phân biệt: Integration Testing kiểm tra các thành phần phối hợp với nhau; Regression Testing kiểm tra chức năng cũ vẫn đúng sau khi có thay đổi.

# 

# **5\. NHIỆM VỤ 4 – BUG TRACKING TRÊN GITHUB**

Bước 1\. Với mỗi lỗi phát hiện, vào repository → Issues → New issue.  
Bước 2\. Ghi tiêu đề rõ nghĩa, Steps to Reproduce, Expected Result, Actual Result, mức độ ưu tiên và minh chứng.  
Bước 3\. Gán người phụ trách; nếu sửa trong buổi, tạo branch/commit/PR và liên kết Issue.  
Bước 4\. Kiểm thử lại sau sửa; chỉ đóng Issue khi lỗi đã được xác nhận khắc phục.

| Bug ID / Issue URL | Mô tả ngắn | Mức độ (High/Medium/Low) | Người xử lý | Trạng thái |
| :---- | :---- | :---- | :---- | :---- |
| BUG01 – Nút Đặt Tour không phản hồi | Steps: Đăng nhập → mở chi tiết Tour → chọn ngày khởi hành và số lượng khách → nhấn “Tiếp tục nhập thông tin hành khách”. Expected: Hệ thống kiểm tra số chỗ và mở biểu mẫu nhập thông tin hành khách. Actual: Tài liệu Sprint 1 ghi nhận nút không phản hồi; phiên bản code hiện tại đã có xử lý click, cần kiểm thử lại. | **High** | Qanh | Cần kiểm thử lại |
| BUG02 – Chưa tự động đăng nhập sau khi đăng ký | Steps: Mở đăng ký → nhập họ tên, email mới và mật khẩu hợp lệ → nhấn tạo tài khoản. Expected: Nếu yêu cầu nghiệp vụ là tự động đăng nhập, hệ thống tạo phiên đăng nhập và chuyển đến trang phù hợp. Actual: Code hiện tại chuyển sang chế độ đăng nhập và hiển thị “Đăng ký thành công. Mời bạn đăng nhập.” | **Medium** | NThư | Cần xác nhận yêu cầu và kiểm thử lại |
| BUG03 – Chưa gửi email phản hồi khi liên hệ | Steps: Mở trang Liên hệ → nhập họ tên, email hợp lệ, chủ đề và nội dung tối thiểu 10 ký tự → nhấn Gửi. Expected: Lưu lời nhắn và gửi email xác nhận nếu đây là yêu cầu nghiệp vụ. Actual: API hiện lưu lời nhắn, trả về mã tham chiếu; chưa thấy chức năng gửi email trong luồng này. | **Low** | Qanh | Cần xác nhận yêu cầu và kiểm thử lại |

Mẫu Issue: \[Bug\] Event Registration accepts duplicate submissions. Steps: đăng nhập → mở sự kiện → đăng ký hai lần. Expected: từ chối lần hai. Actual: tạo hai bản ghi.

# **6\. NHIỆM VỤ 5 – SPRINT 3 PLANNING**

Bước 1\. Tổng hợp User Stories chưa hoàn thành, lỗi ưu tiên cao và chức năng còn thiếu.  
Bước 2\. Đặt Sprint 3 Goal có thể kiểm chứng.  
Bước 3\. Chọn backlog phù hợp năng lực nhóm, ghi Acceptance Criteria và người phụ trách.  
Bước 4\. Tạo/cập nhật GitHub Issues hoặc Project Board cho Sprint 3\.

Sprint 3 Goal của nhóm: Xây dựng thành công màn hình quản lý đơn hàng giúp Admin xem được đơn mới, cập nhật trạng thái thành công và xuất được file danh sách khách hàng của một Tour cụ thể.

| ID / Issue | User Story / Bug / Task | Priority | Acceptance Criteria | Phụ trách |
| :---- | :---- | ----- | :---- | :---- |
| SP3-01  | Xem đơn đặt Tour mới | 8 | Hiển thị đầy đủ danh sách đơn đặt Tour mới, thông tin khách hàng và trạng thái đơn hàng chính xác.  | Qanh |
| SP3-02  | Quản lý đơn đặt Tour (Xem, Lọc, Cập nhật trạng thái,..) | 5 | Cho phép xem, lọc đơn đặt Tour và cập nhật trạng thái; dữ liệu được lưu chính xác.  | NThư |
| SP3-03  | Xuất danh sách khách hàng của một Tour cụ thể | 5 | Xuất được danh sách khách hàng theo Tour đã chọn, thông tin đầy đủ và chính xác.  | NThư |
| SP3-04  | Quản lý Danh mục Địa điểm (Thêm, Sửa, Xóa) | 8 | Thêm, sửa, xóa địa điểm thành công; dữ liệu hợp lệ và danh sách được cập nhật.  | Qanh |
| SP3-05  | Quản lý Tour du lịch (Thêm, Sửa, Xóa) | 5 | Cho phép thêm, sửa, xóa Tour; kiểm tra dữ liệu đầu vào và lưu thay đổi chính xác.  | Qanh |
| SP3-06  | Quản lý Lịch trình chi tiết & Hình ảnh Tour | 3 | Cho phép cập nhật lịch trình và hình ảnh; thông tin hiển thị đúng với Tour tương ứng.  | BTrân |
| SP3-07  | Xem biểu đồ thống kê doanh thu | 3 | Hiển thị biểu đồ doanh thu dựa trên dữ liệu đặt Tour, số liệu thống kê chính xác.  | BTrân |
| SP3-08 | Quản lí khách hàng (Thêm, Sửa, Xóa tài khoản khách hàng ) | 1 | Cho phép thêm, sửa, xóa tài khoản khách hàng theo quyền hạn; dữ liệu được cập nhật chính xác.  | NThư |

# 

# **7\. MINH CHỨNG VÀ SẢN PHẨM CẦN NỘP**

✓ Phiếu thực hành Buổi 7 đã điền đầy đủ.

✓  Repository chạy được với các chức năng Sprint 1–2 tích hợp.

✓  Test Report có tối thiểu 05 test cases và kết quả thực thi.

✓  GitHub Issues ghi nhận lỗi và liên kết PR/commit nếu có sửa lỗi.

✓  Sprint 3 Goal, Sprint 3 Backlog và danh sách người phụ trách.

Link minh chứng chính: [https\://github.com/nanhthu638-coder/traveller-team.git](https://github.com/nanhthu638-coder/traveller-team.git)

Backlog và AC đầy đủ: https://docs.google.com/document/d/1X3Ryuw5d1VcSsD6umJFl2o_Nar2EcXwz/edit?usp=sharing&ouid=101899638306327173938&rtpof=true&sd=true
Chưa thực hiện xong các chức năng của Sprint 3
