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
├── backend/                   # Spring Boot project
│   ├── src/main/java/...
│   │   ├── controller/        # REST controllers
│   │   ├── service/           # Business logic (import, phân loại, ngân sách...)
│   │   ├── repository/        # Spring Data JPA repositories
│   │   ├── entity/            # JPA entities
│   │   ├── dto/                # Request/response DTO
│   │   ├── security/          # Cấu hình JWT, Spring Security
│   │   └── config/
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
├── frontend/                  # ReactJS project
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/          # gọi API backend
│   │   └── App.jsx
│   └── package.json
├── docs/                      # Tài liệu đồ án (BRD, SRS, ERD...)
├── docker-compose.yml
└── README.md
```

## Yêu cầu môi trường

- Java 17+
- Node.js 18+ và npm/yarn
- MySQL 8+
- Maven 3.8+
- Docker & Docker Compose (nếu chạy bằng container)

## Cài đặt & chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/<your-username>/personal-finance-management.git
cd personal-finance-management
```

### 2. Chạy bằng Docker (khuyến nghị)

```bash
docker-compose up --build
```

Mặc định:

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- MySQL: cổng `3306`

### 3. Chạy thủ công (không dùng Docker)

**Backend**

```bash
cd backend
# Tạo database MySQL trước, ví dụ: personal_finance_db
cp src/main/resources/application-example.yml src/main/resources/application.yml
# Cập nhật thông tin kết nối DB trong application.yml
mvn spring-boot:run
```

**Frontend**

```bash
cd frontend
npm install
npm start
```

## Biến môi trường

Backend (`application.yml` hoặc biến môi trường):

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/personal_finance_db
    username: root
    password: yourpassword

jwt:
  secret: your-secret-key
  expiration: 86400000 # 24h
```

Frontend (`.env`):

```
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

## API Documentation

Các API được kiểm thử bằng **Postman**. Collection Postman được đính kèm tại `docs/postman/`.

Một số nhóm endpoint chính (tham khảo, chi tiết xem trong collection):

| Method   | Endpoint                 | Mô tả                                    |
| -------- | ------------------------ | ---------------------------------------- |
| POST     | `/api/auth/login`        | Đăng nhập, trả về JWT                    |
| GET      | `/api/accounts`          | Danh sách tài khoản của người dùng       |
| GET/POST | `/api/transactions`      | Tra cứu / tạo giao dịch                  |
| POST     | `/api/imports`           | Upload và import sao kê CSV/Excel        |
| GET/POST | `/api/budgets`           | Quản lý ngân sách theo danh mục          |
| GET/POST | `/api/savings-goals`     | Quản lý mục tiêu tiết kiệm               |
| GET      | `/api/reports/trend`     | Dữ liệu biểu đồ xu hướng thu/chi         |
| GET      | `/api/reports/breakdown` | Dữ liệu biểu đồ cơ cấu chi theo danh mục |

## Kiểm thử

- **Unit test**: JUnit + Mockito cho tầng Service.
- **API test**: Postman collection (`docs/postman/`).
- **E2E test**: Selenium

```bash
# Chạy unit test backend
cd backend
mvn test
```

## Giấy phép

Dự án được thực hiện với mục đích học tập trong khuôn khổ đồ án ngành. Vui lòng liên hệ tác giả trước khi sử dụng cho mục đích khác.
