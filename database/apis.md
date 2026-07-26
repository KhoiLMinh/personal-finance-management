### 1. Nhóm API Xác thực & Người dùng (Authentication & User - UC-01)
*Lưu ý: Nhóm này BẮT BUỘC dùng DTO (như `UserDTO`) để giấu password khi trả về. Các API (ngoại trừ login/register) yêu cầu Header: `Authorization: Bearer <JWT_TOKEN>`*

| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Đăng ký tài khoản mới | `{ "username", "email", "password", "fullName" }` | `{ "message", "userId" }` |
| **POST** | `/api/auth/login` | Đăng nhập hệ thống | `{ "username", "password" }` | `{ "token", "user": UserDTO }` |
| **POST** | `/api/auth/google` | Đăng nhập bằng Google | `{ "googleToken" }` | `{ "token", "user": UserDTO }` |
| **GET** | `/api/users/me` | Lấy thông tin tài khoản hiện tại | - | `UserDTO` |
| **PUT** | `/api/users/me` | Cập nhật hồ sơ (Avatar, Tên...) | `{ "fullName", "avatar" }` | `UserDTO` |
| **POST** | `/api/users/change-password` | Thay đổi password | `{ "oldPassword", "newPassword" }` | `{ "message" }` |

---

### 2. Nhóm API Quản lý Ví (Wallet)

| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/wallets` | Lấy danh sách ví của người dùng | - | `List<Wallet>` |
| **POST** | `/api/wallets` | Tạo ví mới | `{ "name", "balance", "icon", "color" }` | `Wallet` |
| **PUT** | `/api/wallets/{id}` | Cập nhật thông tin ví | `{ "name", "icon", "color" }` | `Wallet` |
| **DELETE** | `/api/wallets/{id}` | Xóa ví | - | `{ "message" }` |

---

### 3. Nhóm API Quản lý Giao dịch (Transaction - UC-02)
| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/transactions` | Lọc DS giao dịch | Query params: `?walletId=&startDate=&endDate=&type=` | Bảng phân trang `Page<Transaction>` |
| **POST** | `/api/transactions` | Thêm giao dịch mới | `{ "amount", "type", "date", "wallet_id", "category_id", "description" }` | `Transaction` |
| **GET** | `/api/transactions/{id}` | Xem chi tiết 1 giao dịch | - | `Transaction` |
| **PUT** | `/api/transactions/{id}` | Cập nhật giao dịch | Cùng Request của POST | `Transaction` |
| **DELETE** | `/api/transactions/{id}` | Xóa giao dịch | - | `{ "message" }` |

---

### 4. Nhóm API Nhập Dữ Liệu (Import Data - UC-03)
| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/imports/csv` | Import file CSV sao kê | `multipart/form-data`: `file`, `walletId` | `ImportBatch` (Kèm ds lỗi/trùng lặp) |
| **POST** | `/api/imports/image` | Nhận diện hóa đơn (OCR) | `multipart/form-data`: `image`, `walletId` | Thông tin giao dịch bóc tách từ ảnh |
| **GET** | `/api/imports/batches` | Xem lịch sử các lần Import | - | `List<ImportBatch>` |

---

### 5. Nhóm API Quản lý Danh mục (Category & Rule - UC-07)
*(Sử dụng trực tiếp Entity `Category` và `CategoryRule`)*

| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/categories` | Lấy cây danh mục (Cha/Con) | Query param: `?type=INCOME/EXPENSE` | `List<Category>` |
| **POST** | `/api/categories` | Tạo danh mục mới | `{ "name", "type", "icon", "color", "parent_id" }` | `Category` |
| **PUT** | `/api/categories/{id}` | Cập nhật danh mục | `{ "name", "icon", "color", "hidden" }` | `Category` |
| **POST** | `/api/categories/{id}/rules` | Thêm quy tắc nhận diện danh mục | `{ "keyword", "priority" }` | `CategoryRule` |

---

### 6. Nhóm API Ngân sách (Budget - UC-04)

| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/budgets` | Lấy danh sách ngân sách | Query param: `?month=&year=` | `List<Budget>` |
| **POST** | `/api/budgets` | Thiết lập ngân sách mới | `{ "month", "year", "limitAmount", "warningPercent", "category_id" }` | `Budget` |
| **PUT** | `/api/budgets/{id}` | Cập nhật ngân sách | `{ "limitAmount", "warningPercent" }` | `Budget` |

---

### 7. Nhóm API Thống kê & Phân tích (Analytics - UC-05)
| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/analytics/summary` | Tổng quan Thu/Chi/Số dư | Query param: `?startDate=&endDate=` | `{ "totalIncome", "totalExpense", "balance" }` |
| **GET** | `/api/analytics/categories` | Cơ cấu chi tiêu theo danh mục | Query param: `?month=&year=` | Danh sách tổng tiền theo Category |
| **GET** | `/api/analytics/trends` | Xu hướng thu chi | Query param: `?year=` | Danh sách dữ liệu thu/chi 12 tháng |
| **GET** | `/api/analytics/ai-insights` | Lấy nhận xét thói quen từ AI | Query param: `?month=&year=` | `{ "content": "Phân tích từ AI..." }` |

---

### 8. Nhóm API Chia sẻ & Gia đình (Family Sharing - UC-06)
| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/families` | Tạo nhóm Gia đình | `{ "name" }` | `Family` kèm `inviteCode` |
| **POST** | `/api/families/invite` | Thêm thành viên vào nhóm | `{ "email" }` hoặc `{ "inviteCode" }` | `FamilyMember` |
| **POST** | `/api/wallets/{id}/share` | Cấp quyền ví cho người khác | `{ "userId", "permission" }` (VIEW/EDIT) | `WalletMember` |

---

### 9. Nhóm API Mục tiêu Tiết kiệm (Saving Goal - FR-10)
| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/goals` | Lấy danh sách mục tiêu | - | `List<SavingGoal>` |
| **POST** | `/api/goals` | Tạo mục tiêu mới | `{ "title", "targetAmount", "deadline" }` | `SavingGoal` |
| **POST** | `/api/goals/{id}/deposit` | Thêm tiền vào mục tiêu | `{ "amount" }` | `SavingGoal` |

---

### 10. Nhóm API Thông báo (Notification - FR-11)
| Method | Endpoint | Mô tả | Yêu cầu (Request) | Phản hồi (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/notifications` | Lấy danh sách thông báo | - | `List<Notification>` |
| **PATCH** | `/api/notifications/{id}/read` | Đánh dấu đã đọc | - | `{ "message": "Success" }` |