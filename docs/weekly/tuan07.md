# BÁO CÁO TUẦN 7

## 1. Công việc đã thực hiện

Trong tuần 7, tập trung hoàn thiện các chức năng nghiệp vụ chính của hệ thống quản lý tài chính cá nhân, đồng thời phát triển giao diện Frontend bằng ReactJS và tăng cường kiểm thử Backend. Bên cạnh đó, tiếp tục hoàn thiện các chức năng nâng cao như báo cáo, xuất dữ liệu, hỗ trợ AI, quản lý gia đình và quản trị hệ thống.

### 1.1. Phát triển Backend

- Hoàn thiện chức năng **cập nhật giao dịch (Transaction)**.
- Hoàn thiện và kiểm thử chức năng **Budget**, bao gồm:
  - Quản lý ngân sách.
  - Kiểm tra mức chi tiêu so với ngân sách.
  - Phát hiện trường hợp chi tiêu vượt ngưỡng ngân sách.
  - Gửi thông báo khi ngân sách bị vượt quá giới hạn.
- Hoàn thiện chức năng **Saving Goal**, bao gồm:
  - Quản lý mục tiêu tiết kiệm.
  - Thêm tiền vào mục tiêu tiết kiệm.
  - Điều chỉnh logic cập nhật số tiền đã tiết kiệm.
- Hoàn thiện chức năng **Report**:
  - Thống kê dữ liệu tài chính.
  - So sánh báo cáo.
  - Hỗ trợ xuất dữ liệu báo cáo.
- Bổ sung chức năng **Export PDF và Excel** cho dữ liệu báo cáo.
- Hoàn thiện các chức năng liên quan đến **Family** và chia sẻ ví.
- Bổ sung chức năng **tính lãi suất và chuyển đổi tiền tệ**.
- Tiếp tục hoàn thiện chức năng **Notification** phục vụ cảnh báo và thông báo cho người dùng.
- Bổ sung và hoàn thiện chức năng **AI Assistant**:
  - Hỗ trợ người dùng tương tác với AI.
  - Hỗ trợ phân tích và tư vấn dữ liệu tài chính.
  - Hỗ trợ quét hình ảnh để trích xuất thông tin giao dịch.

### 1.2. Kiểm thử Backend

Trong tuần 7, tiếp tục mở rộng hệ thống Unit Test cho các service và chức năng quan trọng.

Các module đã được bổ sung hoặc mở rộng test:

- Transaction Service.
- Budget Service.
- Category Service.
- Family Service.
- Import Batch Service.
- Notification Service.
- Report Service.
- Saving Goal Service.
- User Service.
- Authentication Service.
- Wallet Service.
- Controller Authentication.
- User Controller.

Ngoài ra:

- Bổ sung test cho chức năng **Import Batch**.
- Bổ sung test cho **Category** và các trường hợp mở rộng.
- Bổ sung test cho **Budget**.
- Bổ sung test cho **Transaction**.
- Bổ sung test cho **Saving Goal**.
- Bổ sung test cho **Family**.
- Bổ sung test cho **Notification**.
- Bổ sung test cho **Report**.
- Tiếp tục xử lý các lỗi phát sinh trong quá trình chạy test và CI/CD.
- Kiểm tra lại khả năng build và chạy test trên môi trường GitHub Actions.

### 1.3. Phát triển Frontend với ReactJS

Tiếp tục xây dựng giao diện và kết nối Frontend với Backend API.

Các chức năng đã triển khai:

- Trang **Login**.
- Trang **Register**.
- Trang **Dashboard**.
- Trang **Transaction**.
- Trang **Wallet**.
- Trang **Budget**.
- Trang **Saving Goal**.
- Trang **Import dữ liệu**.
- Trang **AI Assistant**.
- Trang **Profile**.
- Trang **Change Password**.
- Trang quản trị **User**.
- Trang quản trị **Category**.

Bên cạnh đó, xây dựng và hoàn thiện các component giao diện:

- Transaction List và Transaction Filter.
- Transaction Modal.
- Wallet Card và Wallet Modal.
- Share Wallet Modal.
- Budget Card và Budget Modal.
- Saving Goal Card.
- Create Goal Modal.
- Add Fund Modal.
- Các component biểu đồ và thống kê trên Dashboard.
- AI Advice Card.
- Notification frontend.
- Header, Sidebar và Main Layout.

Tiếp tục cải thiện giao diện và trải nghiệm người dùng, đồng thời xử lý một số vấn đề liên quan đến hiển thị và lazy loading của chức năng AI.

### 1.4. CI/CD và quản lý mã nguồn

- Tiếp tục duy trì và sửa lỗi **CI/CD bằng GitHub Actions**.
- Kiểm tra trạng thái build và test sau mỗi thay đổi.
- Xử lý các lỗi khiến workflow không thể hoàn thành.
- Tiếp tục quản lý source code bằng Git và Pull Request.
- Hoàn thiện Pull Request chứa các chức năng phát triển trong giai đoạn hiện tại.

### 1.5. Tài liệu và quản lý yêu cầu

- Xây dựng **Requirement Traceability Matrix (RTM)**.
- Liên kết các yêu cầu với chức năng và thành phần tương ứng của hệ thống.
- Tiếp tục cập nhật tài liệu dự án nhằm đảm bảo sự thống nhất giữa yêu cầu, thiết kế, source code và kiểm thử.

---

## 2. Kết quả đạt được

Sau tuần 7, hệ thống đã có nhiều chức năng gần hoàn thiện ở cả Backend và Frontend:

- Hoàn thiện các chức năng quản lý giao dịch.
- Hoàn thiện quản lý Wallet và chia sẻ Wallet.
- Hoàn thiện quản lý Budget và cảnh báo vượt ngân sách.
- Hoàn thiện Saving Goal và chức năng thêm tiền vào mục tiêu.
- Hoàn thiện Report và Compare Report.
- Hỗ trợ xuất báo cáo PDF và Excel.
- Bổ sung tính năng tính lãi suất và chuyển đổi tiền tệ.
- Hoàn thiện Notification.
- Phát triển AI Assistant và chức năng quét hình ảnh.
- Xây dựng các giao diện chính bằng ReactJS.
- Bổ sung nhiều Unit Test cho Backend.
- Tiếp tục duy trì CI/CD bằng GitHub Actions.
- Xây dựng Requirement Traceability Matrix.
- Hoàn thiện thêm các chức năng dành cho Admin.

---

## 3. Khó khăn

Trong quá trình phát triển tuần 7, số lượng chức năng của hệ thống tăng lên đáng kể nên việc đảm bảo tính ổn định giữa các module trở nên phức tạp hơn.

Một số vấn đề phát sinh liên quan đến:

- Unit Test và cấu hình môi trường test.
- CI/CD và sự khác biệt giữa môi trường local và GitHub Actions.
- Tích hợp giữa Frontend ReactJS và Backend Spring Boot.
- Xử lý dữ liệu khi xuất báo cáo sang PDF và Excel.
- Tích hợp AI và xử lý dữ liệu hình ảnh.
- Đảm bảo các chức năng mới không ảnh hưởng đến những chức năng đã hoàn thiện trước đó.

Để xử lý, tiến hành kiểm thử từng module, bổ sung test case, sửa lỗi theo kết quả CI và tiếp tục refactor source code khi cần thiết.

---

## 4. Kế hoạch tuần tiếp theo

- Tiếp tục kiểm thử toàn bộ hệ thống.
- Sửa các lỗi còn tồn tại được phát hiện từ Unit Test và CI/CD.
- Hoàn thiện các chức năng Frontend và Backend còn thiếu.
- Kiểm tra toàn bộ luồng nghiệp vụ từ Frontend đến Backend.
- Hoàn thiện chức năng AI Assistant và xử lý các trường hợp lỗi.
- Kiểm tra chức năng xuất PDF và Excel.
- Hoàn thiện phân quyền và các chức năng dành cho Admin.
- Tiếp tục cập nhật Requirement Traceability Matrix.
- Bổ sung tài liệu kiểm thử và minh chứng kiểm thử.
- Rà soát source code, giao diện và tài liệu trước khi hoàn thiện đồ án.
