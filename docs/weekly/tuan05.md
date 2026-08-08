# Báo cáo tiến độ - Tuần 5 (02/08 - 08/08)

## Đã hoàn thành

### 1. Phát triển Backend với Spring Boot

- Tiếp tục xây dựng Backend cho hệ thống quản lý chi tiêu và tài chính cá nhân bằng **Spring Boot**.
- Hoàn thiện cấu trúc Backend theo mô hình:
  - Controller
  - Service
  - Repository
  - Entity
  - DTO
  - Mapper
  - Configuration
- Xây dựng các Entity phục vụ các chức năng chính:
  - User
  - Wallet
  - WalletMember
  - Transaction
  - Category
  - CategoryRule
  - Budget
  - SavingGoal
  - Family
  - FamilyMember
  - ImportBatch
  - Notification
- Xây dựng lớp `Base` dùng chung cho các Entity, bao gồm:
  - ID tự tăng.
  - Thời gian tạo.
  - Thời gian cập nhật.
- Sử dụng **JPA/Hibernate** để ánh xạ Entity với cơ sở dữ liệu MySQL.

### 2. Xây dựng chức năng Authentication

- Hoàn thiện chức năng đăng ký tài khoản.
- Hoàn thiện chức năng đăng nhập bằng tài khoản nội bộ.
- Hoàn thiện chức năng đổi mật khẩu.
- Kiểm tra username và email trước khi đăng ký.
- Mã hóa mật khẩu bằng `BCryptPasswordEncoder`.
- Kiểm tra mật khẩu khi đăng nhập bằng BCrypt.
- Xây dựng DTO cho các request và response liên quan đến Authentication.

Các API chính:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
PUT  /api/v1/auth/change-password
```

### 3. Tích hợp JWT và Spring Security

- Cấu hình **Spring Security** cho hệ thống.
- Thiết lập cơ chế Stateless Session.
- Tích hợp JWT Authentication Filter vào Security Filter Chain.
- Xây dựng cơ chế tạo JWT sau khi đăng nhập thành công.
- JWT chứa các thông tin cần thiết phục vụ xác thực và phân quyền người dùng.
- Bảo vệ các API yêu cầu xác thực.
- Cho phép truy cập công khai đối với API đăng ký, đăng nhập và Swagger/OpenAPI.
- Sử dụng `UserDetailsService` để lấy thông tin người dùng từ cơ sở dữ liệu.
- Thiết lập role cho người dùng thông qua `GrantedAuthority`.

### 4. Xây dựng chức năng quản lý người dùng

Hoàn thiện các API cơ bản cho User:

- Lấy danh sách người dùng.
- Lấy thông tin profile của người dùng hiện tại.
- Cập nhật thông tin cá nhân.
- Xóa người dùng.

Các thành phần đã xây dựng:

- `UserDTO`
- `UserMapper`
- `UserRepository`
- `UserService`
- `UserServiceImpl`
- `UserController`

### 5. Xây dựng chức năng quản lý Wallet

Hoàn thiện các chức năng CRUD cho ví tài chính:

- Tạo ví.
- Lấy danh sách các ví mà người dùng có quyền truy cập.
- Xem chi tiết ví.
- Cập nhật ví.
- Xóa ví.

Các API chính:

```text
POST   /api/v1/wallets
GET    /api/v1/wallets
GET    /api/v1/wallets/{id}
PUT    /api/v1/wallets/{id}
DELETE /api/v1/wallets/{id}
```

Bên cạnh đó, xây dựng cơ chế kiểm tra quyền truy cập ví thông qua:

- Chủ sở hữu ví.
- Thành viên được chia sẻ ví.
- Quyền truy cập của thành viên.

### 6. Validation và xử lý Exception

- Sử dụng Jakarta Validation để kiểm tra dữ liệu đầu vào.
- Áp dụng các annotation:
  - `@NotBlank`
  - `@NotNull`
  - `@Email`
  - `@Positive`
  - `@PositiveOrZero`
  - `@Min`
  - `@Max`
- Xây dựng `GlobalExceptionHandler` để xử lý lỗi tập trung.
- Xử lý lỗi validation từ `MethodArgumentNotValidException`.
- Xử lý lỗi không có quyền truy cập bằng `AccessDeniedException`.
- Chuẩn hóa cấu trúc response lỗi trả về cho Client.

### 7. Xây dựng tài liệu API

- Tích hợp **OpenAPI/Swagger** cho Backend.
- Cấu hình thông tin API và server.
- Chuẩn hóa API theo version `/api/v1`.
- Chuẩn bị Swagger để phục vụ quá trình kiểm thử và tài liệu hóa API.

### 8. Cấu hình môi trường và bảo mật thông tin

- Tách các thông tin cấu hình như:
  - Database URL.
  - Database username.
  - Database password.
  - JWT secret.
  - JWT expiration.
  - Server port.
- Sử dụng Environment Variable trong `application.yaml`.
- Loại bỏ việc phụ thuộc trực tiếp vào các thông tin nhạy cảm trong source code.
- Tạo `.env.example` để cung cấp cấu trúc biến môi trường mẫu.
- Bổ sung `.gitignore` để tránh đưa các file chứa thông tin nhạy cảm và file build lên Git.
- Bổ sung quy tắc loại bỏ thư mục Maven `target/` khỏi Git.

### 9. Quản lý mã nguồn bằng Git

- Tiếp tục sử dụng Git để quản lý source code.
- Chuẩn hóa nội dung commit theo Conventional Commits.
- Thực hiện commit cho các thay đổi liên quan đến API versioning và bảo mật cấu hình môi trường:

```text
chore: version APIs and secure environment config
```

---

## Kết quả đạt được

Sau tuần 5, Backend đã hình thành được các thành phần nền tảng quan trọng:

- Authentication và Authorization cơ bản.
- JWT Authentication.
- Spring Security.
- BCrypt Password Encryption.
- User Management.
- Wallet Management.
- Wallet Access Control.
- DTO và Mapper.
- Validation.
- Global Exception Handling.
- Swagger/OpenAPI.
- Environment Configuration.
- API Versioning.
- Git Repository Management.

Các thành phần trên tạo nền tảng để tiếp tục phát triển các chức năng nghiệp vụ chính của hệ thống trong các tuần tiếp theo.

---

## Nội dung còn lại

Một số chức năng vẫn đang được tiếp tục hoàn thiện:

- Hoàn thiện xác thực đăng nhập bằng Google OAuth2.
- Bổ sung Unit Test và Integration Test cho các API.
- Hoàn thiện kiểm thử toàn bộ Authentication và Wallet API.
- Tiếp tục xây dựng các API quản lý Transaction.
- Xây dựng chức năng quản lý Category và Category Rule.
- Xây dựng chức năng Import dữ liệu giao dịch từ CSV.

---

## Kế hoạch tuần tiếp theo

### Backend

- Hoàn thiện và kiểm thử JWT Authentication.
- Bổ sung Unit Test và Integration Test.
- Phát triển API quản lý giao dịch (Transaction).
- Xây dựng CRUD cho Category.
- Xây dựng cơ chế tự động phân loại giao dịch dựa trên CategoryRule.

### Import dữ liệu

- Nghiên cứu và xây dựng chức năng import dữ liệu giao dịch từ file CSV.
- Xử lý mapping dữ liệu từ CSV vào Transaction.
- Kiểm tra dữ liệu trùng lặp.
- Chuẩn hóa dữ liệu trước khi lưu vào cơ sở dữ liệu.

### Frontend

- Bắt đầu kết nối ReactJS với các API Backend.
- Xây dựng luồng đăng ký/đăng nhập.
- Lưu trữ và gửi JWT trong các request.
- Xây dựng giao diện quản lý Wallet.
