# BÁO CÁO TUẦN 09

## Thời gian

**31/08/2026 - 06/09/2026**

## Nội dung thực hiện

### 1. Hoàn thiện chức năng Budget

- Bổ sung chức năng **lưu và xem lịch sử Budget**.
- Xây dựng giao diện hiển thị **Budget History**.
- Cải thiện việc theo dõi quá trình thay đổi và sử dụng ngân sách.
- Kiểm tra lại logic xử lý Budget sau khi bổ sung lịch sử.

### 2. Hoàn thiện chức năng Report

- Cho phép người dùng **tự lựa chọn khoảng thời gian** khi xem báo cáo tài chính.
- Sửa lỗi liên quan đến dữ liệu và logic của Report.
- Kiểm tra lại các số liệu thống kê sau khi chuyển đổi kiểu dữ liệu tiền tệ sang `BigDecimal`.
- Cải thiện giao diện hiển thị Report và đảm bảo dữ liệu thống kê chính xác.

### 3. Hoàn thiện chức năng Recurring Bill

- Sửa logic thông báo hóa đơn định kỳ để có thể **thông báo đúng thời gian đã thiết lập**.
- Cho phép người dùng **chỉnh sửa và xóa** hóa đơn định kỳ.
- Bổ sung **mức độ ưu tiên (Priority)** cho Recurring Bill.
- Sửa lỗi xử lý thời gian của hóa đơn định kỳ.
- Kiểm tra lại quá trình tạo, chỉnh sửa, xóa và thông báo hóa đơn.

### 4. Hoàn thiện chức năng Category

- Cho phép **người dùng thông thường chỉnh sửa Category của cá nhân**.
- Điều chỉnh logic đối với Category do Admin quản lý.
- Category mặc định của Admin được **clone cho từng người dùng** để đảm bảo người dùng có thể tùy chỉnh Category của mình mà không ảnh hưởng đến dữ liệu chung.
- Kiểm tra lại logic phân quyền giữa Category của User và Category của Admin.

### 5. Cải thiện User Profile và Authentication

- Bổ sung chức năng **upload avatar** cho User Profile.
- Điều chỉnh chức năng đổi mật khẩu đối với tài khoản đăng nhập bằng Google.
- Người dùng đăng nhập bằng Google **không được phép thay đổi mật khẩu theo cơ chế đăng nhập thông thường**.
- Cải thiện giao diện và logic quản lý thông tin cá nhân.

### 6. Cải thiện Family

- Sửa logic xóa Family.
- Đảm bảo việc xóa Family được xử lý đúng theo quyền và trạng thái của Family.
- Kiểm tra lại các trường hợp liên quan đến thành viên và dữ liệu Family.

### 7. Cải thiện chức năng Admin

- Điều chỉnh giao diện để **User thông thường không thể truy cập Admin UI**.
- Cải thiện logic quản lý User dành cho Admin.
- Sửa API Admin liên quan đến thao tác **xóa, active và inactive User**.
- Điều chỉnh logic để Admin không cần truyền trực tiếp `userId` trên parameter đối với một số thao tác quản lý User.
- Kiểm tra lại quyền truy cập giữa User và Admin.

### 8. Cập nhật Database

- Điều chỉnh cấu trúc Database để đáp ứng các chức năng mới.
- Cập nhật các quan hệ và trường dữ liệu liên quan đến Budget History, Category, Family và các chức năng khác.
- Kiểm tra khả năng tương thích giữa Database và Backend sau khi thay đổi cấu trúc.

### 9. Docker và môi trường triển khai

- Bắt đầu chuẩn hóa môi trường chạy hệ thống bằng **Docker**.
- Xây dựng Docker configuration cho các thành phần của hệ thống.
- Đóng gói Backend và các dịch vụ cần thiết để giảm sự phụ thuộc vào môi trường máy cá nhân.
- Thiết lập và kiểm tra các container phục vụ cho hệ thống.
- Kiểm tra kết nối giữa Backend, Database và các service thông qua Docker.
- Hướng tới việc sử dụng Docker Compose để có thể khởi động toàn bộ hệ thống bằng một cấu hình thống nhất.

### 10. Kiểm thử và CI/CD

- Sửa và cập nhật các **test case** sau khi thay đổi logic Backend.
- Bổ sung **Newman test** để kiểm thử API.
- Kiểm tra lại các API chính sau khi cập nhật chức năng.
- Sửa các lỗi liên quan đến test và CI/CD.
- Kiểm tra trạng thái CI/CD sau khi hoàn thiện các thay đổi.
- Xóa các đoạn comment code không cần thiết để cải thiện chất lượng mã nguồn.

## Kết quả đạt được

- Hoàn thiện chức năng **Budget History** và giao diện hiển thị lịch sử Budget.
- Cho phép người dùng lựa chọn khoảng thời gian khi xem **Report**.
- Cải thiện và hoàn thiện **Recurring Bill**, bao gồm thông báo đúng thời gian, chỉnh sửa, xóa và Priority.
- Hoàn thiện logic **Category cá nhân và Category mặc định của Admin**.
- Bổ sung chức năng **upload avatar**.
- Điều chỉnh logic mật khẩu đối với tài khoản đăng nhập bằng Google.
- Sửa và hoàn thiện logic **Family**.
- Cải thiện phân quyền và giao diện dành cho **Admin/User**.
- Cập nhật cấu trúc Database để hỗ trợ các chức năng mới.
- Bắt đầu chuẩn hóa môi trường triển khai bằng **Docker**.
- Cập nhật test case, bổ sung **Newman API test** và cải thiện CI/CD.

## Khó khăn và vấn đề gặp phải

- Không có

## Kế hoạch tuần tiếp theo

- Hoàn thiện báo cáo
