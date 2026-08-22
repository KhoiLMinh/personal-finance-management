# Personal Finance Management System

Hệ thống quản lý chi tiêu và tài chính cá nhân — cho phép import sao kê ngân hàng (CSV), tự động phân loại giao dịch và phân tích thói quen chi tiêu để người dùng ra quyết định tài chính tốt hơn.

> Đồ án ngành — Ngành Công nghệ thông tin
> GVHD: Th.S Võ Việt Khoa

---

## Giới thiệu

Nhiều người gặp khó khăn trong việc kiểm soát dòng tiền vì không nắm rõ tiền của mình đi đâu mỗi tháng. Ghi chép thủ công dễ bỏ sót, còn sao kê ngân hàng thì rời rạc và khó tổng hợp. Các ứng dụng hiện có như Money Lover hay Sổ Thu Chi hỗ trợ ghi chép nhưng khả năng phân tích và tự động hóa còn hạn chế.

Dự án xây dựng một hệ thống quản lý chi tiêu cá nhân cho phép:

- Import sao kê ngân hàng (CSV) và tự động chuẩn hóa dữ liệu từ nhiều định dạng khác nhau.
- Tự động phân loại giao dịch theo danh mục dựa trên quy tắc/từ khóa.
- Khử trùng lặp giao dịch khi import nhiều lần hoặc từ nhiều nguồn.
- Thiết lập ngân sách theo danh mục theo tháng, cảnh báo khi có nguy cơ vượt ngân sách.
- Trực quan hóa xu hướng thu/chi và cơ cấu chi tiêu qua biểu đồ.
- Đặt và theo dõi tiến độ mục tiêu tiết kiệm.
- Chia sẻ tài khoản chi tiêu chung cho các thành viên trong gia đình.

## Tính năng chính

| Nhóm chức năng         | Mô tả                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Tài khoản & giao dịch  | Quản lý nhiều ví/tài khoản (ngân hàng, tiền mặt, ví điện tử); ghi nhận, chỉnh sửa, tra cứu lịch sử giao dịch |
| Danh mục thu/chi       | Tạo và tùy biến danh mục, danh mục con, gán màu sắc và biểu tượng                                            |
| Import sao kê          | Import CSV, ánh xạ cột linh hoạt theo từng định dạng ngân hàng                                               |
| Tự động phân loại      | Áp quy tắc/từ khóa để gán danh mục tự động cho giao dịch                                                     |
| Khử trùng lặp          | Phát hiện và loại bỏ giao dịch trùng khi import                                                              |
| Ngân sách              | Đặt hạn mức theo danh mục theo tháng, theo dõi tiến độ sử dụng                                               |
| Mục tiêu tiết kiệm     | Đặt mục tiêu, theo dõi tiến độ tích lũy                                                                      |
| Báo cáo & biểu đồ      | Xu hướng thu/chi theo thời gian, cơ cấu chi theo danh mục, so sánh theo kỳ                                   |
| Nhắc nhở               | Cảnh báo vượt ngân sách, nhắc hóa đơn định kỳ và mục tiêu sắp đến hạn                                        |
| Tài khoản gia đình     | Chia sẻ tài khoản, phân quyền theo vai trò cho từng thành viên                                               |
| Đăng nhập & phân quyền | Xác thực bằng JWT, phân quyền theo vai trò (người dùng, thành viên gia đình, admin)                          |

## Công nghệ sử dụng

**Backend**

- Java · Spring Boot
- Spring Data JPA (Hibernate)
- Spring Security + JWT (xác thực & phân quyền)
- MySQL 8

**Frontend**

- ReactJS
- Recharts / Tremor (biểu đồ trực quan hóa)

**Công cụ hỗ trợ**

- Postman — kiểm thử API
- Docker — đóng gói & triển khai

## Kiến trúc hệ thống

Hệ thống được xây dựng theo mô hình **Client-Server**:

```
┌─────────────────┐        REST API (JSON)        ┌──────────────────────┐
│   Frontend       │ <───────────────────────────> │   Backend             │
│   ReactJS        │           HTTPS + JWT          │   Spring Boot         │
└─────────────────┘                                 └──────────┬───────────┘
                                                                 │
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │   MySQL Database  │
                                                        └──────────────────┘
```

Backend theo kiến trúc phân tầng:

```
Controller  →  Service  →  Repository  →  Entity (JPA)
```

## Cấu trúc thư mục

```
personal-finance-management/
├── src/
│   ├── backend/
│   │   └── src/
│   └── frontend/
│       └── src/
├── database/
├── docs/
│   ├── assets/
│   ├── baocao/
│   ├── phan-tich/
│   ├── thiet-ke/
│   ├── kiem-thu/
│   └── weekly/
├── .env.example
├── .gitignore
├── LICENSE
└── README.md

```

## Yêu cầu môi trường

- Java 17+
- Node.js 18+ và npm/yarn
- MySQL 8+
- Maven 3.8+

## Cài đặt & chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/<your-username>/personal-finance-management.git
cd personal-finance-management
```

### Bước 2: Khởi tạo Database

1. Mở MySQL Workbench (hoặc công cụ quản lý MySQL của bạn).
2. Tạo một database trống với tên `financial_db`:

```sql
CREATE DATABASE financial_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Bước 3: Chạy Backend (Spring Boot)

1. Mở terminal mới và di chuyển vào thư mục backend:

```bash
cd src/backend
```

2. Đảm bảo thông tin kết nối DB (username/password) trong file `src/main/resources/application-local.yaml` khớp với MySQL trên máy bạn.

3. Chạy lệnh sau để khởi động Backend với cấu hình local:

```bash
$env:SPRING_PROFILES_ACTIVE="local"
.\mvnw.cmd spring-boot:run
```

> **Lưu ý:** Ở lần chạy đầu tiên, Hibernate sẽ tự động tạo các bảng và DataSeeder sẽ tự động nạp các tài khoản demo vào database.

**API Server sẽ chạy tại:** `http://localhost:8080` và có thể vào `http://localhost:8080/swagger-ui/index.html` để xem chi tiết các api đã được cài đặt

### Bước 4: Chạy Frontend (ReactJS) (updating)

## Updating: chưa hoàn thành frontend

## Danh sách tài khoản Demo (Seed Data)

Hệ thống đã tích hợp `backend/config/DataSeeder` tự động tạo sẵn các tài khoản dưới đây ở lần khởi động đầu tiên để phục vụ cho việc kiểm thử và chấm điểm:

| **Vai trò (Role)** | **Tên đăng nhập (Username)** | **Mật khẩu (Password)** | **Chức năng kiểm thử**                        |
| ------------------ | ---------------------------- | ----------------------- | --------------------------------------------- |
| **ADMIN**          | `admin`                      | `123`                   | Quản trị hệ thống, quản lý danh mục mẫu chung |
| **USER**           | `user_demo`                  | `123`                   | Quản lý ví, giao dịch, ngân sách, nhập CSV    |

> Mật khẩu của các tài khoản này đã được mã hóa an toàn bằng BCrypt trong cơ sở dữ liệu.

## Kiểm thử (Testing)

Dự án tuân thủ quy trình kiểm thử tự động với JUnit 5 và Mockito. Để chạy toàn bộ Unit Test của Backend:

```bash
cd src/backend
.\mvnw.cmd test
```

_Kết quả kiểm thử chi tiết và Postman Collection được lưu trữ tại thư mục `docs/kiem-thu/`._
(updating...)

## Giấy phép

Dự án được thực hiện với mục đích học tập trong khuôn khổ đồ án ngành. Vui lòng liên hệ tác giả trước khi sử dụng cho mục đích khác.
