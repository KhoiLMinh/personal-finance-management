# Personal Finance Management System

Hệ thống quản lý chi tiêu và tài chính cá nhân — cho phép import sao kê ngân hàng (CSV), tự động phân loại giao dịch và phân tích thói quen chi tiêu để người dùng ra quyết định tài chính tốt hơn.

> **Đồ án ngành** — Ngành Công nghệ thông tin  
> **GVHD:** Th.S Võ Việt Khoa

---

## Giới thiệu

Nhiều người gặp khó khăn trong việc kiểm soát dòng tiền vì không nắm rõ tiền của mình đi đâu mỗi tháng. Ghi chép thủ công dễ bỏ sót, còn sao kê ngân hàng thì rời rạc và khó tổng hợp. Các ứng dụng hiện có như Money Lover hay Sổ Thu Chi hỗ trợ ghi chép nhưng khả năng phân tích và tự động hóa còn hạn chế.

Dự án xây dựng một hệ thống quản lý chi tiêu cá nhân cho phép:

- **Import sao kê ngân hàng (CSV)** và tự động chuẩn hóa dữ liệu từ nhiều định dạng khác nhau.
- **Tự động phân loại giao dịch** theo danh mục dựa trên quy tắc/từ khóa.
- **Khử trùng lặp giao dịch** khi import nhiều lần hoặc từ nhiều nguồn.
- **Thiết lập ngân sách** theo danh mục theo tháng, cảnh báo khi có nguy cơ vượt ngân sách.
- **Trực quan hóa** xu hướng thu/chi và cơ cấu chi tiêu qua biểu đồ.
- **Đặt và theo dõi** tiến độ mục tiêu tiết kiệm.
- **Chia sẻ tài khoản** chi tiêu chung cho các thành viên trong gia đình.

---

## Tính năng chính

| Nhóm chức năng             | Mô tả                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Tài khoản & Giao dịch**  | Quản lý nhiều ví/tài khoản (ngân hàng, tiền mặt, ví điện tử); ghi nhận, chỉnh sửa, tra cứu lịch sử giao dịch. |
| **Danh mục thu/chi**       | Tạo và tùy biến danh mục, danh mục con, gán màu sắc và biểu tượng.                                            |
| **Import sao kê**          | Import CSV, ánh xạ cột linh hoạt theo từng định dạng ngân hàng.                                               |
| **Tự động phân loại**      | Áp quy tắc/từ khóa để gán danh mục tự động cho giao dịch.                                                     |
| **Khử trùng lặp**          | Phát hiện và loại bỏ giao dịch trùng khi import.                                                              |
| **Ngân sách**              | Đặt hạn mức theo danh mục theo tháng, theo dõi tiến độ sử dụng.                                               |
| **Mục tiêu tiết kiệm**     | Đặt mục tiêu, theo dõi tiến độ tích lũy.                                                                      |
| **Báo cáo & biểu đồ**      | Xu hướng thu/chi theo thời gian, cơ cấu chi theo danh mục, so sánh theo kỳ.                                   |
| **Nhắc nhở**               | Cảnh báo vượt ngân sách, nhắc hóa đơn định kỳ và mục tiêu sắp đến hạn.                                        |
| **Tài khoản gia đình**     | Chia sẻ tài khoản, phân quyền theo vai trò cho từng thành viên.                                               |
| **Đăng nhập & phân quyền** | Xác thực bằng JWT, phân quyền theo vai trò người dùng và admin.                                               |

---

## Công nghệ sử dụng

### Backend

- Java 17
- Spring Boot
- Spring Data JPA / Hibernate
- Spring Security
- JWT Authentication
- MySQL 8
- Maven

### Frontend

- ReactJS
- Vite
- TypeScript
- React Bootstrap
- Axios
- React Router
- Recharts
- Lucide React

### Công cụ hỗ trợ

- Postman / Newman — Kiểm thử API
- Docker — Container hóa ứng dụng
- Docker Compose — Triển khai toàn bộ hệ thống
- Git / GitHub — Quản lý mã nguồn

---

## Kiến trúc hệ thống

Hệ thống được xây dựng theo mô hình **Client-Server**:

```text
┌─────────────────────┐
│      Frontend       │
│  ReactJS + Vite     │
│      :5173          │
└──────────┬──────────┘
           │
           │ REST API
           │ JSON + JWT
           ▼
┌─────────────────────┐
│       Backend       │
│    Spring Boot      │
│       :8080         │
└──────────┬──────────┘
           │
           │ JPA / Hibernate
           ▼
┌─────────────────────┐
│       MySQL 8       │
│       :3306         │
└─────────────────────┘
```

Backend theo kiến trúc phân tầng:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Entity (JPA)
    ↓
MySQL
```

---

## Cấu trúc thư mục

```text
personal-finance-management/
│
├── src/
│   ├── backend/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── mvnw
│   │
│   └── frontend/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
│
├── database/
│
├── docs/
│   ├── assets/
│   ├── baocao/
│   ├── phan-tich/
│   ├── thiet-ke/
│   ├── kiem-thu/
│   └── weekly/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

# ⚙️ Cài đặt & Khởi chạy

Dự án hỗ trợ 2 cách chạy:

- **Cách 1:** Chạy thủ công, không sử dụng Docker.
- **Cách 2:** Chạy toàn bộ hệ thống bằng Docker Compose.

---

# Cách 1: Chạy thủ công

## Yêu cầu môi trường

- Java 17+
- Node.js 18+
- npm
- MySQL 8+
- Maven 3.8+

### Bước 1: Clone repository

```bash
git clone https://github.com/<your-username>/personal-finance-management.git
cd personal-finance-management
```

### Bước 2: Khởi tạo Database

Mở MySQL Workbench hoặc công cụ quản lý MySQL của bạn.

Tạo database:

```sql
CREATE DATABASE financial_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Bước 3: Chạy Backend (Spring Boot)

1. Mở terminal mới và di chuyển vào thư mục backend:

```bash
cd src/backend
```

2. Đảm bảo thông tin kết nối DB trong file `src/main/resources/application-local.yaml` khớp với MySQL trên máy bạn.

3. Chạy lệnh sau để khởi động Backend với cấu hình local.

**Windows PowerShell:**

```powershell
$env:SPRING_PROFILES_ACTIVE="local"
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

> **Lưu ý:** Ở lần chạy đầu tiên, Hibernate sẽ tự động tạo các bảng và DataSeeder sẽ tự động nạp các tài khoản demo vào database.

**API Server sẽ chạy tại:** `http://localhost:8080`

**Swagger UI:** `http://localhost:8080/swagger-ui/index.html`

### Bước 4: Chạy Frontend (ReactJS)

1. Mở terminal mới và di chuyển vào thư mục frontend:

```bash
cd src/frontend
```

2. Cài đặt các thư viện cần thiết:

```bash
npm install
```

3. Chạy Frontend:

```bash
npm run dev
```

> **Lưu ý:** Đảm bảo Backend đã được khởi động trước để Frontend có thể kết nối và sử dụng các API.

**Frontend sẽ chạy tại:** `http://localhost:5173`

---

# Cách 2: Chạy bằng Docker Compose

Hệ thống được đóng gói bằng **Docker Compose**, bao gồm 3 container:

| Container    | Image                                  | Port        |
| ------------ | -------------------------------------- | ----------- |
| **mysql-db** | `mysql:8.0`                            | `3307:3306` |
| **backend**  | `personal-finance-management-backend`  | `8080:8080` |
| **frontend** | `personal-finance-management-frontend` | `3000:80`   |

Với cách này, người dùng không cần cài đặt riêng Java, Node.js hoặc MySQL trên máy.

## Yêu cầu

Chỉ cần cài đặt:

- **Docker Desktop**

> **Lưu ý:** Mở Docker Desktop và đảm bảo Docker Engine đang ở trạng thái **Running** trước khi thực hiện các bước bên dưới.

### Bước 1: Clone repository

```bash
git clone https://github.com/<your-username>/personal-finance-management.git
cd personal-finance-management
```

### Bước 2: Kiểm tra cấu hình môi trường

Nếu project sử dụng file `.env`, tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

Trên Linux / macOS:

```bash
cp .env.example .env
```

Sau đó kiểm tra các thông tin cấu hình trong `.env` như:

- Database username
- Database password
- Database name
- JWT Secret
- Các API Key cần thiết

> **Lưu ý:** Không commit file `.env` chứa thông tin bảo mật lên GitHub.

### Bước 3: Build và khởi động hệ thống

Tại thư mục gốc của project, nơi chứa file `docker-compose.yml`, chạy:

```bash
docker compose up -d --build
```

Docker Compose sẽ tự động:

1. Build Backend.
2. Build Frontend.
3. Khởi tạo MySQL.
4. Tạo network giữa các container.
5. Khởi động các service.
6. Kết nối Backend với MySQL.
7. Phục vụ Frontend thông qua Nginx.

### Bước 4: Kiểm tra trạng thái các container

```bash
docker compose ps
```

Các service cần ở trạng thái đang chạy (`Up` / `Running`).

Nếu cần xem log:

```bash
docker compose logs -f
```

Hoặc xem log riêng từng service:

```bash
docker compose logs -f backend
```

```bash
docker compose logs -f frontend
```

```bash
docker compose logs -f mysql
```

### Bước 5: Truy cập hệ thống

Sau khi các container khởi động thành công:

**Frontend:**

```text
http://localhost:3000
```

**Backend API:**

```text
http://localhost:8080
```

**Swagger UI:**

```text
http://localhost:8080/swagger-ui/index.html
```

### Bước 6: Dừng hệ thống

Để dừng các container:

```bash
docker compose down
```

> Lệnh trên dừng và xóa các container nhưng thông thường vẫn giữ lại Docker volumes.

Nếu muốn **xóa cả database volume và toàn bộ dữ liệu database**:

```bash
docker compose down -v
```

> **Cảnh báo:** Không sử dụng `docker compose down -v` nếu muốn giữ lại dữ liệu database.

### Khởi động lại hệ thống

Sau khi đã build thành công, lần sau có thể chạy:

```bash
docker compose up -d
```

Không cần `--build` nếu Dockerfile hoặc source code chưa có thay đổi cần build lại.

---

# Danh sách tài khoản Demo

Hệ thống đã tích hợp `DataSeeder` để tự động tạo các tài khoản demo khi khởi động.

| Vai trò   | Tên đăng nhập | Mật khẩu | Chức năng kiểm thử                             |
| --------- | ------------- | -------- | ---------------------------------------------- |
| **ADMIN** | `admin`       | `123`    | Quản trị hệ thống, quản lý danh mục mẫu chung. |
| **USER**  | `user_demo`   | `123`    | Quản lý ví, giao dịch, ngân sách, nhập CSV.    |

> Mật khẩu của các tài khoản được mã hóa bằng **BCrypt** trong cơ sở dữ liệu. Pass mặc định là 123

> Các tài khoản trên chỉ phục vụ mục đích **Demo / Testing**.

---

# 🧪 Kiểm thử (Testing)

Dự án sử dụng **JUnit 5** và **Mockito** cho kiểm thử Backend.

## Unit Test

Di chuyển vào thư mục Backend:

```bash
cd src/backend
```

### Windows

```powershell
.\mvnw.cmd test
```

### Linux / macOS

```bash
./mvnw test
```

Chi tiết các testcase Unit Test được khai báo trong:

```text
docs/kiem-thu/testcase.md
```

## Integration Test

Integration Test được thực hiện thông qua **Postman / Newman**.

Các file kiểm thử được lưu tại:

```text
docs/kiem-thu/newman/
```

Có thể khởi động toàn bộ hệ thống trước:

```bash
docker compose up -d
```

Sau đó thực hiện các Integration Test bằng Newman theo Collection được cung cấp trong thư mục kiểm thử.

---

# 📡 API Documentation

Backend cung cấp REST API dưới dạng JSON.

Sau khi Backend được khởi động, có thể truy cập Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

Swagger cung cấp danh sách các API endpoint và hỗ trợ thực hiện request trực tiếp để kiểm thử.

---

# Giấy phép

Dự án được thực hiện với mục đích học tập trong khuôn khổ **Đồ án ngành Công nghệ thông tin**.

Vui lòng liên hệ tác giả trước khi sử dụng cho mục đích khác.
