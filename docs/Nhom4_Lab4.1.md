# CÔNG NGHỆ PHẦN MỀM NC

# **LAB 4.1 – SPRINT 1: PHÁT TRIỂN VÀ KIỂM THỬ**

Nhóm: 4   Lớp:   

Dự án: Hệ thống quản lý du lịch 

Thành viên: 

Nguyễn Anh Thư

Nguyễn Ngọc Bảo Trân

Huỳnh Quốc Anh

Thực hiện trên dự án nhóm; lưu minh chứng và sản phẩm trong GitHub repository.

# **1\. Mục tiêu và yêu cầu**

Hoàn thành một phần chức năng chạy được của Sprint 1; thực hiện quản lý công việc, phát triển trên branch, kiểm thử, sửa lỗi, cập nhật tài liệu và chuẩn bị demo.

# **2\. Sprint Backlog và phân công**

Chọn User Stories từ Product Backlog; ghi Acceptance Criteria, mức ưu tiên, Story Points, người phụ trách và trạng thái. Không nhận quá nhiều công việc so với năng lực nhóm.

| ID | User Story / Task | Acceptance Criteria | SP | Phụ trách | Trạng thái |
| :---- | :---- | :---- | :---- | :---- | :---- |
| US01 | Xem Trang chủ | Hiển thị banner, tour nổi bật, thông tin tổng quan | 3 | Qanh, BTrân | Done |
| US02 | Xem danh sách Tour | Hiển thị danh sách tour với hình ảnh, tên, giá, ngày khởi hành | 3 | Qanh | Done |
| US03 | Xem chi tiết Tour | Hiển thị chi tiết lịch trình, hình ảnh, chính sách, giá, các hoạt động của tour Có nút đặt tour | 3  | Qanh | Done |
| US04 | Tìm kiếm Tour | Tìm theo tên tour hoặc địa điểm Kết quả hiển thị đúng, có thông báo khi không tìm thấy Xử lý từ khóa rỗng | 3 | BTrân | Done |
| US05 | Lọc Tour theo khoảng giá và ngày khởi hành | Lọc theo khoảng giá (min-max) Lọc theo ngày khởi hành Kết hợp nhiều bộ lọc Hiển thị số lượng kết quả | 3 | BTrân | Done |
| US06 | Đăng nhập/Đăng ký và đăng xuất tài khoản | Tạo được tài khoản người dùng và đăng xuất được Thông báo lỗi khi sai thông tin | 2 | NThư | Done |
| US07 | Gửi biểu mẫu liên hệ/thắc mắc | Form liên hệ  Thông báo gửi thành công | 2 | NThư | To do |

Sprint Goal: Hoàn thành các chức năng cơ bản cho khách hàng vãng lai (xem trang chủ, danh sách tour, chi tiết tour, tìm kiếm, lọc tour) và chức năng tài khoản (đăng ký, đăng nhập, gửi liên hệ) — đảm bảo chạy được, có kiểm thử và demo.

Link GitHub Project / Issues: [https\://github.com/nanhthu638-coder/traveller-team](https://github.com/nanhthu638-coder/traveller-team)

# **3\. Phát triển và quản lý phiên bản trên GitHub**

**☑** Tạo Issue/task tương ứng với từng User Story hoặc công việc.

**☑** Mỗi thành viên tạo branch riêng (ví dụ: feature/login, feature/event-list).

**☑** Commit thay đổi có ý nghĩa; tạo Pull Request (PR) và nhờ thành viên khác review.

**☑** Chỉ merge thay đổi phù hợp, đã được kiểm tra; cập nhật trạng thái Issue/task.

| Thành viên | Issue / Task | Branch | Commit / PR link | Kết quả review / merge |
| :---- | :---- | :---- | :---- | :---- |
| Qanh, BTrân | Xem Trang chủ | Test/sever  | [https\://github.com/nanhthu638-coder/traveller-team/tree/Test/server](https://github.com/nanhthu638-coder/traveller-team/tree/Test/server) | Done |
| Qanh | Xem danh sách Tour | tour\_detail/tour-list | [https\://github.com/nanhthu638-coder/traveller-team/blob/tour\_detail/tour-list/traveller-team-Test/src/tour-list.js](https://github.com/nanhthu638-coder/traveller-team/blob/tour_detail/tour-list/traveller-team-Test/src/tour-list.js) | Done |
| Qanh | Xem chi tiết Tour | tour\_detail/tour-list | [https\://github.com/nanhthu638-coder/traveller-team/blob/tour\_detail/tour-list/traveller-team-Test/src/tour-detail.js](https://github.com/nanhthu638-coder/traveller-team/blob/tour_detail/tour-list/traveller-team-Test/src/tour-detail.js) | Done |
| BTrân | Tìm kiếm Tour | search/tours.js   | [https\://github.com/nanhthu638-coder/traveller-team/blob/search/server/tours.js](https://github.com/nanhthu638-coder/traveller-team/blob/search/server/tours.js) | Done |
| BTrân | Lọc Tour theo khoảng giá và ngày khởi hành | search/tours.js | [https\://github.com/nanhthu638-coder/traveller-team/blob/search/server/tours.js](https://github.com/nanhthu638-coder/traveller-team/blob/search/server/tours.js) | Done |
| NThư | Đăng nhập/Đăng ký và đăng xuất tài khoản | Test/index.js  | [https\://github.com/nanhthu638-coder/traveller-team/blob/Test/server/index.js](https://github.com/nanhthu638-coder/traveller-team/blob/Test/server/index.js) | Done |
| NThư | Gửi biểu mẫu liên hệ/thắc mắc | Test/featured-tours.js  | [https\://github.com/nanhthu638-coder/traveller-team/blob/Test/src/features/featured-tours.js](https://github.com/nanhthu638-coder/traveller-team/blob/Test/src/features/featured-tours.js) | Done |

# **4\. Kiểm thử, ghi nhận lỗi và sửa lỗi**

Viết test cases bám Acceptance Criteria. Mỗi chức năng có ít nhất một trường hợp hợp lệ và một trường hợp không hợp lệ/biên (nếu phù hợp). Ghi lỗi vào GitHub Issues và kiểm thử lại sau khi sửa.

| TC ID | Chức năng / bước kiểm thử | Dữ liệu test | Expected | Actual | Pass/Fail |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC01 | Xem trang chủ – truy cập `/` | http\://localhost:5173/\#home | Banner, tour nổi bật, thông tin hiển thị | Banner, tour nổi bật và thông tin hiển thị đầy đủ, trang tải trong \~1.5s | **Pass** |
| TC02 | Đăng ký – email đã tồn tại | Name:Nguyễn Trân, Email: `bt12@gmail.com`, Password: `12345678,` Confirm: `12345678` | Thông báo “**Email này đã được đăng ký”** | Hệ thống hiển thị đúng thông báo "Email này đã được đăng ký", form không submit | **Pass** |
| TC03 | Đăng ký – password không khớp | Name:Nguyễn Trân, Email: `bt12@gmail.com`, Password: `12345678,` Confirm: Abc`12345` | Thông báo "**Mật khẩu nhập lại chưa khớp**" | Hệ thống hiển thị đúng thông báo "Mật khẩu nhập lại chưa khớp", form không submit | **Pass** |
| TC04 | Đăng ký – dữ liệu hợp lệ | Name:Nguyễn Trân, Email: `bt12@gmail.com`, Password: `12345678,` Confirm: `12345678` | Tạo tài khoản thành công, thông báo thành công | Tài khoản được tạo thành công, chuyển hướng sang trang đăng nhập, thông báo "Đăng ký thành công" | **Pass** |
| TC05 | Đăng ký – email sai định dạng | Name:Nguyễn Trân, Email: `bt@gmail.com`, Password: `12345678,` Confirm: `12345678` | Thông báo "**Email hoặc mật khẩu không chính xác.**" | Hệ thống hiển thị thông báo "Email không hợp lệ", form không submit | **Pass** |
| TC06 | Đăng nhập – đúng thông tin | Email: `bt12@gmail.com`, Password: `12345678` | Đăng nhập thành công, chuyển về trang chủ | Đăng nhập thành công, chuyển hướng về trang chủ, hiển thị tên người dùng | **Pass** |
| TC07 | Đăng nhập – sai mật khẩu | Email: `bt12@gmail.com`, Password: `Abc45678` | Thông báo "**Email hoặc mật khẩu không chính xác.**" | Hệ thống hiển thị đúng thông báo "Email hoặc mật khẩu không chính xác.", form không submit | **Pass** |
| TC08 | Xem danh sách tour – truy cập `/tours` | http\://localhost:5173/tour-list.html | Danh sách tour có hình, tên, giá, ngày khởi hành; phân trang | Hiển thị tour/trang, đầy đủ hình ảnh, tên, giá, ngày khởi hành; phân trang hoạt động | **Pass** |
| TC09 | Xem chi tiết tour – click vào tour bất kỳ(yêu cầu đăng nhập tài khoản) | http\://localhost:5173/tour-detail.html?id=ha-long-3n2d | Lịch trình, hình ảnh, chính sách, nút đặt tour hiển thị đúng | Lịch trình, hình ảnh, chính sách hiển thị đầy đủ; nút đặt tour không phản hồi khi nhấn | **Fail** |
| TC10 | Tìm kiếm tour – nhập từ khóa hợp lệ | “Vịnh Hạ Long” | Kết quả trả về các tour có tên/địa điểm chứa “Vịnh Hạ Long” | Hiển thị tour liên quan đến Vịnh Hạ Long, đúng thông tin | **Pass** |
| TC11 | Tìm kiếm tour – từ khóa rỗng | “ “ | Hiển thị tất cả tour | Hiển thị toàn bộ danh sách tour, không lọc | **Pass** |
| TC12 | Tìm kiếm tour – từ khóa không tồn tại | “nsja” | Thông báo "**Không tìm thấy tour phù hợp**" | Hệ thống hiển thị đúng thông báo "Không tìm thấy tour phù hợp" | **Pass** |
| TC13 | Lọc tour theo khoảng giá | Min \= 2.000.000, Max \= 5.000.000 | Danh sách tour trong khoảng giá, có số lượng kết quả | Hiển thị tour trong khoảng giá, có số lượng kết quả | **Pass** |
| TC14 | Lọc tour theo ngày khởi hành | Từ 01/10/2026 đến 31/10/2026 | Danh sách tour khởi hành trong khoảng ngày | Hiển thị tour khởi hành trong khoảng ngày | **Pass** |
| TC15 | Lọc tour kết hợp giá \+ ngày | Giá 3-7 triệu, ngày 15/10 – 15/11/2026 | Kết quả thỏa cả 2 điều kiện | Hiển thị tour thỏa cả 2 điều kiện | **Pass** |
| TC16 | Gửi liên hệ – dữ liệu hợp lệ | Tên, email, nội dung đầy đủ | Thông báo gửi thành công | Hệ thống thông báo "Gửi liên hệ thành công" nhưng không có email/tin nhắn phản hồi | **Fail** |
| TC17 | Gửi liên hệ – thiếu trường bắt buộc | Bỏ trống nội dung | Thông báo "Vui lòng điền vào trường này" | Hệ thống hiển thị đúng thông báo "Vui lòng điền vào trường này", form không submit | **Pass** |

| Bug ID / Issue | Mô tả lỗi | Mức độ | Người sửa | Trạng thái / retest |
| :---- | :---- | :---- | :---- | :---- |
| BUG01 | Không thể nhấn xem chi tiết, mặc dù đã đăng ký thành công | 50 | Qanh | To do |
| BUG02 | Sau khi đăng ký thành công, người dùng chưa được tự động đăng nhập mà phải đăng nhập lại thủ công | 30 | NThư | In Progress |
| BUG03 | Gửi liên hệ thành công nhưng không có tin nhắn hoặc email phản hồi | 20 | BTrân | To do |

# **5\. Công việc riêng của Sprint**

A. Đóng gói và chạy thử Sprint 1: ghi cách cài đặt/chạy; tạo bản demo hoặc bản triển khai nếu dự án cho phép.

\# 1\. Clone repository

git clone https\://github.com/nanhthu638-coder/traveller-team.git

cd traveller-team

\# 2\. Cài đặt dependencies

npm install

\# 3\. Cấu hình môi trường

cp .env.example .env

\# Chỉnh sửa file .env với thông tin DB và API keys

\# 4\. Khởi tạo database

npm run migrate

npm run seed

\# 5\. Chạy server backend

cd server

npm start

\# Server chạy tại http\://localhost:3000

\# 6\. Chạy frontend (terminal khác)

cd ../traveller-team-Test

npm install

npm run dev

\# Frontend chạy tại http\://localhost:5173

B. Cập nhật tài liệu: yêu cầu, thiết kế, hướng dẫn chạy, test report, trạng thái công việc.

| Loại tài liệu | Đường dẫn | Trạng thái |
| :---- | :---- | :---- |
| Yêu cầu hệ thống | `docs/requirements.md` | Đã cập nhật |
| Thiết kế (ERD, wireframe) | `docs/design.md` | Đã cập nhật |
| Hướng dẫn chạy | `README.md` | Đã cập nhật |
| Test report Sprint 1 | `docs/test-report-sprint1.md` | Đã cập nhật |

C. Sprint Review: demo chức năng hoàn thành; chỉ ra Acceptance Criteria đã đạt/chưa đạt.

| User Story | Chức năng demo | Acceptance Criteria đạt | Ghi chú |
| :---- | :---- | :---- | :---- |
| US01 | Xem Trang chủ | ✅ Đạt | Banner, tour nổi bật, thông tin hiển thị đầy đủ |
| US02 | Xem danh sách Tour | ✅ Đạt | 12 tour/trang, phân trang hoạt động |
| US03 | Xem chi tiết Tour | ⚠️ Chưa đạt hoàn toàn | Hiển thị đúng nhưng nút "Đặt tour" không phản hồi (BUG01) |
| US04 | Tìm kiếm Tour | ✅ Đạt | Tìm theo tên/địa điểm, xử lý từ khóa rỗng và không tồn tại |
| US05 | Lọc Tour | ✅ Đạt | Lọc theo giá, ngày, kết hợp nhiều bộ lọc |
| US06 | Đăng nhập/Đăng ký/Đăng xuất | ✅ Đạt | Validation đầy đủ, thông báo lỗi rõ ràng |
| US07 | Gửi biểu mẫu liên hệ | ⚠️ Chưa đạt hoàn toàn | Gửi thành công nhưng chưa có phản hồi tự động (BUG03) |

D. Retrospective: mỗi nhóm nêu ít nhất 1 điều làm tốt, 1 khó khăn và 1 cải tiến cho Sprint 2\.

a. Điều làm tốt:

* Phân công công việc rõ ràng, mỗi thành viên có branch riêng (`Test/server`, `tour_detail/tour-list`, `search/tours.js`).  
* Quy trình review chéo qua Pull Request được thực hiện nghiêm túc.  
* Hoàn thành 5/7 User Stories đúng hạn, chất lượng code ổn định.

b. Khó khăn:

* Chưa thống nhất API contract sớm dẫn đến việc tích hợp frontend–backend mất thời gian.  
* Một số bug validation (BUG02) phát sinh muộn, ảnh hưởng đến tiến độ kiểm thử.  
* Chức năng gửi liên hệ chưa có cơ chế phản hồi tự động (BUG03).

c. Cải tiến cho Sprint 2:

* Thống nhất API contract (request/response format) ngay từ đầu Sprint.  
* Viết unit test tự động cho các hàm validation để phát hiện lỗi sớm.  
* Họp sync ngắn (15 phút) hàng ngày để cập nhật tiến độ và tháo gỡ vướng mắc.  
* Ưu tiên sửa BUG01 và BUG03 trong tuần đầu Sprint 2\.

# **6\. Nhật ký tiến độ và minh chứng**

| Buổi | Đã hoàn thành | Vướng mắc / Bug | Minh chứng (Issue, PR, commit, ảnh, URL) |
| :---- | :---- | :---- | :---- |
| Buổi 1 | \- Khởi tạo repository GitHub \- Tạo Sprint Backlog và phân công task \- Hoàn thành US01 (Xem Trang chủ) \- Bắt đầu US02, US03 (Qanh); US04, US05 (BTrân); US06, US07 (NThư) | \- Chưa thống nhất API response format giữa các thành viên \- BUG01 phát sinh: nút "Đặt tour" không phản hồi | \- Repo: [https\://github.com/nanhthu638-coder/traveller-team](https://github.com/nanhthu638-coder/traveller-team) \- Branch `Test/server`: [https\://github.com/nanhthu638-coder/traveller-team/tree/Test/server](https://github.com/nanhthu638-coder/traveller-team/tree/Test/server)  |
| Buổi 2 | \- Hoàn thành US02, US03 (Qanh) \- Hoàn thành US04, US05 (BTrân) \- Hoàn thành US06, US07 (NThư) \- Viết 17 test cases và chạy kiểm thử \- Fix BUG02 (đang In Progress) \- Cập nhật tài liệu và quay demo | \- BUG01: nút "Đặt tour" không hoạt động (Qanh đang sửa) \- BUG02: chưa tự động đăng nhập sau khi đăng ký (NThư đang sửa) \- BUG03: gửi liên hệ không có phản hồi (BTrân đang sửa) | \- Branch `tour_detail/tour-list`: [https\://github.com/nanhthu638-coder/traveller-team/blob/tour\_detail/tour-list/traveller-team-Test/src/tour-list.js](https://github.com/nanhthu638-coder/traveller-team/blob/tour_detail/tour-list/traveller-team-Test/src/tour-list.js) \- Branch `search/tours.js`: [https\://github.com/nanhthu638-coder/traveller-team/blob/search/server/tours.js](https://github.com/nanhthu638-coder/traveller-team/blob/search/server/tours.js) \- Branch `Test/index.js`: [https\://github.com/nanhthu638-coder/traveller-team/blob/Test/server/index.js](https://github.com/nanhthu638-coder/traveller-team/blob/Test/server/index.js) \- Branch `Test/featured-tours.js`: [https\://github.com/nanhthu638-coder/traveller-team/blob/Test/src/features/featured-tours.js](https://github.com/nanhthu638-coder/traveller-team/blob/Test/src/features/featured-tours.js) \- Test report: `docs/test-report-sprint1.md` |

# **7\. Báo cáo Sprint**

| Tiêu chí | Nội dung nhóm điền |
| :---- | :---- |
| Sprint Goal đạt/chưa đạt | Chưa đạt hoàn toàn – Hoàn thành 5/7 User Stories; 2 User Stories (US03, US07) chưa đạt do còn bug BUG01 và BUG03 |
| User Stories hoàn thành / chưa hoàn thành | Hoàn thành: US01, US02, US04, US05, US06 (5/7) Chưa hoàn thành: US03 (BUG01), US07 (BUG03) |
| Các chức năng demo được | \- Xem Trang chủ \- Xem danh sách Tour \- Xem chi tiết Tour (hiển thị đúng, nút đặt tour chưa hoạt động) \- Tìm kiếm Tour \- Lọc Tour theo giá và ngày \- Đăng nhập / Đăng ký / Đăng xuất \- Gửi biểu mẫu liên hệ (chưa có phản hồi tự động) |
| Số test cases Pass / Fail | Pass: 15/17 Fail: 2/17 (TC09 – BUG01, TC16 – BUG03) |
| Bug còn mở và hướng xử lý | \- BUG01 (Mức độ 50): Nút "Đặt tour" không phản hồi → Qanh kiểm tra sự kiện click và quyền truy cập, dự kiến sửa trong Sprint 2 tuần 1\. \- BUG02 (Mức độ 30): Chưa tự động đăng nhập sau đăng ký → NThư đang xử lý (In Progress), dự kiến hoàn thành cuối Sprint 1\. \- BUG03 (Mức độ 20): Gửi liên hệ không có phản hồi → BTrân bổ sung cơ chế gửi email tự động, dự kiến sửa trong Sprint 2 tuần 1\. |
| Cải tiến cho Sprint tiếp theo | \- Thống nhất API contract sớm hơn (trước khi code). \- Viết unit test tự động cho validation. \- Họp sync 15 phút hàng ngày. \- Ưu tiên sửa BUG01 và BUG03 trong tuần đầu Sprint 2\. \- Bổ sung test case cho các trường hợp biên (edge cases). |

# **8\. Sản phẩm cần nộp**

**☑** Phiếu thực hành LAB 4 đã điền đầy đủ.

**☑** Link GitHub repository và bảng Issue/Project (Sprint Backlog).

**☑** Source code/bản chạy được; lịch sử branch, commit, Pull Request, review/merge.

**☑** Test cases, Bug Report/Issues, minh chứng sửa lỗi và kiểm thử lại.

**☑** Tài liệu cập nhật và Sprint Report; bản demo/hướng dẫn chạy.

Lưu ý: Không đánh dấu “Done” nếu chức năng chưa đáp ứng Acceptance Criteria hoặc chưa được kiểm thử. Mỗi thành viên phải giải thích được đóng góp của mình qua Issue, commit hoặc PR.
