# Báo cáo kiểm thử tích hợp – Personal Finance Management

Ngày chạy: 2026-11-16 · Người thực hiện: Claude (QA) · Mã nguồn: commit `db1abe1` ("audit 1", gồm các bản sửa backend trong `docs/logic-review/project-logic-audit.md`) + thay đổi **chưa commit** của UI giai đoạn 2 (`src/frontend/index.html`, `src/frontend/src/index.css`: token màu/font theo `docs/ui-ux/design-system.md`).

Nguyên tắc tuân thủ: không sửa code ứng dụng; không đụng MySQL thật trên máy (cổng 3306); mọi dữ liệu là dữ liệu kiểm thử trên DB cô lập; mỗi kết quả đều có bằng chứng từ lần chạy thật.

## 1. Môi trường và phương pháp

| Thành phần | Cấu hình thực tế |
|---|---|
| Backend | Spring Boot chạy thật (`spring-boot:run`, test classpath), cổng 8080, JWT secret riêng cho QA |
| Database | **H2 file (`MODE=MySQL`) trong thư mục scratchpad**, schema do Hibernate `ddl-auto=update` tạo, Flyway tắt. Không dùng MySQL vì Docker daemon tắt và không có cấu hình MySQL local (BLK-01) |
| Frontend | Vite dev server `http://localhost:5173` trỏ vào backend trên |
| Trình duyệt | Playwright (Chromium), viewport 1366×860 và 390×844 |
| API test | Kịch bản Python gọi HTTP thật (91 case), Newman với `docs/kiem-thu/newman/user.json` |
| Email | SMTP trỏ `127.0.0.1:1` để không gửi mail ra ngoài |
| Gemini | Không có API key; chỉ kiểm nhánh lỗi |

Các luồng nghiệp vụ dùng 3 user mới (A chủ ví; B và C thuộc cùng gia đình với A, được chia sẻ ví với quyền VIEW hoặc EDIT), cùng 1 user ngoài gia đình và tài khoản seed `user_demo`.

## 2. Tổng quan kết quả

| Trạng thái | Số case |
|---|---|
| PASS | 88 |
| FAIL | 13 |
| BLOCKED | 3 |
| NOT TESTED | 6 |
| **Tổng** | **110** |

13 case FAIL quy về **11 bug** (một số case cùng nguyên nhân):

| Mức độ | Số bug |
|---|---|
| Critical | 1 |
| High | 2 |
| Medium | 5 |
| Low | 3 |

Tự động hóa: backend `./mvnw test` **107/107 pass** (gồm 6 test tích hợp mới chạy qua HTTP); frontend `vite build` thành công; frontend **không có unit test**.

## 3. Danh sách bug

| ID | Module | Test case | Expected Result | Actual Result | Status | Severity |
|---|---|---|---|---|---|---|
| INT-01 | AI Assistant / Bảo mật | UI-03: A chat → đăng xuất → C đăng nhập trên cùng trình duyệt | C không thấy hội thoại của A | C thấy nguyên tin nhắn của A. Lịch sử lưu ở `localStorage['finmanage_chat_history']` (`frontend/src/pages/AiAssistantPage.tsx:13,30,50`), không gắn theo user và không bị xóa khi `logout()` (`frontend/src/context/AuthContext.tsx:64-69`) | FAIL | **Critical** (lộ dữ liệu tài chính giữa các tài khoản) |
| INT-02 | Auth / Axios | UI-04: thành viên VIEW thêm giao dịch vào ví chia sẻ | Hiện "không đủ quyền", vẫn đăng nhập | Backend trả đúng `403 {"error":{"code":"FORBIDDEN","message":"Bạn không có quyền thêm giao dịch vào ví này!"}}`, nhưng interceptor xóa token và chuyển về `/login` với **mọi** 403 (`frontend/src/services/api.ts:25-36`). Thao tác thiếu quyền nào cũng làm người dùng bị đăng xuất | FAIL | **High** |
| INT-03 | Auth / Security | AUTH-06/07/08, AI-04: không token / token sai / token hết hạn | 401 Unauthorized | `403` với body rỗng. `SecurityConfig` không cấu hình `authenticationEntryPoint` (`backend/.../security/SecurityConfig.java:74-83`), nên frontend không phân biệt được "hết phiên" với "thiếu quyền", và đây là lý do có INT-02 | FAIL | **Medium** |
| INT-04 | Wallet / Shared Wallet | SHW-05 + UI-04: UI phân biệt ví cá nhân với ví được chia sẻ | `WalletDTO` có thông tin chủ sở hữu / quyền; UI ẩn các thao tác không được phép | `WalletDTO` chỉ có `balance,color,icon,id,name`. Form giao dịch vẫn cho thành viên VIEW chọn ví chia sẻ; menu Sửa/Chia sẻ/Xóa hiển thị với mọi ví (backend chặn đúng, nhưng UX dẫn người dùng thẳng vào INT-02) | FAIL | **High** |
| INT-05 | Backup / Restore | DB-05: khôi phục file backup vào user mới | Khôi phục đủ 7/7 giao dịch; số dư khớp với giao dịch | Chỉ khôi phục **6/7**: giao dịch do thành viên B tạo trong ví chia sẻ dùng danh mục của B, danh mục này không có trong file nên bị bỏ qua âm thầm (`DataBackupServiceImpl.java:175`). Số dư ví lấy nguyên từ file (`:122`), nên số dư không khớp với tổng giao dịch đã khôi phục | FAIL | **Medium** (mất dữ liệu khi khôi phục, không có cảnh báo) |
| INT-06 | Category / Error handling | DB-02: xóa danh mục cha, trong đó danh mục con đã có giao dịch/ngân sách | 400 với thông báo nghiệp vụ, không xóa | 400 nhưng message là **lỗi SQL thô**: `could not execute statement [Referential integrity constraint violation: "fkrme3v2iww4j9qkxv4f93vv4mt: public.budget FOREIGN KEY(category_id)…` (`GlobalExceptionHandler.java:36` trả `ex.getMessage()`; cascade ở `Category.java:53`). Dữ liệu không mất (rollback) nhưng lộ cấu trúc DB | FAIL | **Medium** |
| INT-07 | UI / Responsive | UI-05: Dashboard ở 390×844 | Dùng được trên mobile | Sidebar cố định 260px (`Sidebar.tsx:28`), vùng nội dung chỉ còn 131px, chữ vỡ từng từ; không có nút thu gọn menu | FAIL | **Medium** (chức năng không dùng được trên điện thoại) |
| INT-08 | Kiểm thử / Newman | NM-01, NM-02: chạy `docs/kiem-thu/newman/user.json` | Collection có assertion và chạy lại được | 60 request, **0 assertion**; token viết cứng đã hết hạn nên 57/60 trả 403 mà Newman vẫn báo "0 failed"; ID viết cứng (`/wallets/1`…) thuộc user khác; body hóa đơn dùng `"08:00:00"` trong khi API yêu cầu `HH:mm`. Kết quả "85/85 PASS" trong `test-report.md` **không tái lập được bằng automation** | FAIL | **Medium** (rủi ro chất lượng, không phải lỗi runtime) |
| INT-09 | Category / Contract | CAT-02: JSON `CategoryDTO` | Có key `isSystem` mà `CategoriesPage.tsx:54,213,232,360` đọc | Jackson + Lombok serialize field `boolean isSystem` (`CategoryDTO.java:17`) thành **`system`**. Frontend đọc `isSystem` nên luôn `undefined`. Ảnh hưởng thực tế nhỏ vì user chỉ thấy danh mục của chính mình (luôn `false`), nhưng guard này là code chết | FAIL | **Low** |
| INT-10 | AI / Bill API | AI-01/02, NM-03 | Lỗi upstream → 502/503; tạo tài nguyên → 201 | Gemini không khả dụng → `400 BAD_REQUEST` (lỗi phía server bị báo như lỗi client); `POST /recurring-bills` trả `200` (`RecurringBillController.java:25`) trong khi các API tạo khác trả 201 | — | **Low** |
| INT-11 | Dashboard / AI | UI-01 | Không gọi AI khi người dùng chưa yêu cầu | Mỗi lần mở Dashboard tự gọi `/ai/analyze-report` (`DashboardPage.tsx:50`); ở môi trường dev quan sát thấy 2 lần/lượt tải (StrictMode). Tốn quota Gemini | — | **Low** |

Các vấn đề đã nêu trong 2 audit trước, nay được **xác nhận lại bằng chạy thật**: INT-01 (UI audit G-03/A-01), INT-02 (G-02), INT-04 (W-01), INT-05 (backend H-07), INT-06 (backend M-07/M-08), INT-07 (G-01).

## 4. Các luồng hoạt động tốt (đã kiểm chứng bằng chạy thật)

- **Đăng ký / đăng nhập / phân quyền:** đăng ký, chặn trùng username, validation, đăng nhập trả `{token, user}` đúng contract mà FE dùng, sai mật khẩu bị từ chối, USER không gọi được API admin (403), CORS chỉ cho `localhost:5173` và chặn origin lạ.
- **Chuỗi nhất quán Giao dịch → Số dư → Ngân sách → Dashboard/Báo cáo:** tạo/sửa/xóa thu chi cập nhật số dư chính xác (1.000.000 → 800.000 → 1.300.000 → 1.200.000 → 700.000); lịch sử sửa được ghi (BR-06); `totalIncome/totalExpense/netSavings/totalBalance`, tổng theo danh mục và trendData đều khớp đúng tổng giao dịch; **số liệu UI Dashboard khớp API**; ví có 2 thành viên không còn bị nhân số liệu.
- **Ngân sách:** cảnh báo đúng tại 80% (thông báo "Sắp vượt ngân sách"), EXCEED tại đúng 100%, xóa giao dịch thì trạng thái trở về ACTIVE, chặn ngân sách trùng.
- **Rollback:** chi vượt số dư (TRX-06), file import có dòng lỗi (IMP-06), import vượt số dư (IMP-08): không lưu gì và số dư giữ nguyên.
- **Import CSV:** preview header, chặn sai định dạng, import 2 dòng đúng số dư, **import lại cùng file thì 0 dòng mới và 2 dòng trùng**, rule tự phân loại, dòng không khớp vào "Chưa phân loại", thành viên VIEW bị chặn import.
- **Ví chia sẻ:** chỉ chia sẻ được trong cùng gia đình; VIEW xem được ví và giao dịch nhưng không tạo/sửa/xóa được; EDIT tạo được giao dịch và số dư của chủ ví cập nhật đúng; người ngoài không xem được danh sách thành viên.
- **Cô lập dữ liệu:** user khác không thấy/sửa/xóa được ví, giao dịch, lịch sử, ngân sách hay số liệu dashboard của A.
- **Database:** xóa ví thì giao dịch xóa theo (cascade, không còn bản ghi mồ côi); không cho xóa danh mục đang được dùng; **dữ liệu còn nguyên sau khi restart backend** (số dư, số giao dịch, ngân sách, báo cáo); khôi phục backup 2 lần không nhân đôi dữ liệu.
- **Mục tiêu tiết kiệm:** nộp đủ thì chuyển COMPLETE và ví bị trừ tiền; chặn nộp thêm khi đã hoàn thành; chặn deadline trong quá khứ.
- **AI (nhánh lỗi):** thiếu key thì trả thông báo chung, **không lộ URL hay key**; message rỗng bị chặn; không có token bị chặn.
- **API contract (kiểm tra tĩnh):** cả 76 lời gọi trong `frontend/src/services/*.ts` khớp URL và HTTP method với controller backend; multipart import/restore khớp tham số.

## 5. Các luồng chưa được kiểm chứng

| ID | Nội dung | Lý do / điều kiện để kiểm |
|---|---|---|
| BLK-01 | MySQL 8 thật + Flyway `V1__Init_schema.sql` | Docker daemon tắt, không có `application-local.yaml`. Bật Docker Desktop rồi `docker compose up mysql-db` (cổng 3307) là chạy lại được toàn bộ kịch bản |
| BLK-02 | Gemini thật (phân tích, hỏi đáp, phân loại AI) | Cần `GEMINI_API_KEY` |
| BLK-03 | Đăng nhập Google | Cần `GOOGLE_CLIENT_ID` |
| NT-01 | Gửi email | Cố ý tắt SMTP |
| NT-02 | Import `.xlsx/.xls` | Chỉ kiểm CSV |
| NT-03 | Scheduler theo cron | Chỉ có unit test |
| NT-04 | Giao dịch đồng thời trên cùng ví | Chưa có kịch bản song song |
| NT-05 | Collection admin (khóa/xóa user, cấu hình, backup) | Ngoài phạm vi lượt này |
| — | Frontend unit test | Dự án chưa có framework test |

## 6. Đề xuất thứ tự sửa

1. **INT-01** (Critical): xóa `finmanage_chat_history` trong `logout()` và gắn key theo user. Sửa nhỏ, chỉ trong frontend.
2. **INT-02 + INT-03** (High + Medium, cùng gốc): backend trả 401 cho request chưa xác thực (cấu hình `authenticationEntryPoint`); frontend chỉ đăng xuất khi gặp 401 (hoặc khi tài khoản bị khóa), còn 403 thì hiển thị thông báo.
3. **INT-04** (High): bổ sung field (chỉ thêm, không phá contract) `ownedByMe`/`myPermission` vào `WalletDTO`; UI ẩn các thao tác không được phép và lọc ví VIEW khỏi form giao dịch. Cần xác nhận vì đổi API.
4. **INT-06**: không trả `ex.getMessage()` của exception không phải lỗi nghiệp vụ; kiểm tra danh mục con trước khi xóa.
5. **INT-05**: khi khôi phục backup, báo số dòng bị bỏ qua; quyết định nghiệp vụ về số dư (xem audit backend H-07).
6. **INT-07**: sidebar responsive (đã có trong kế hoạch UI giai đoạn 3).
7. **INT-08**: viết lại collection Newman: login lấy token động, tạo dữ liệu rồi dùng ID trả về, thêm `pm.test` cho status và body; đưa `FinanceFlowIntegrationTest` vào CI.
8. **INT-09, INT-10, INT-11** (Low).

## 7. Tài sản kiểm thử để lại

- `src/backend/src/test/java/com/personal/finance/backend/integration/FinanceFlowIntegrationTest.java`: 6 test tích hợp qua HTTP thật, không mock (chuỗi nhất quán, rollback, cô lập, quyền VIEW/EDIT + không nhân số liệu, import trùng lặp, request không có token). Chạy bằng `./mvnw test`.
- Kịch bản API và kết quả thô (JSON) của lượt chạy nằm trong scratchpad của phiên làm việc; bảng chi tiết bên dưới được sinh từ các file đó.

## 8. Danh sách test case chi tiết

| ID | Module | Test case | Expected | Actual | Status |
|---|---|---|---|---|---|
| AUTH-01 | Auth | Đăng ký tài khoản mới | 2xx | HTTP 201 Đăng ký thành công! | **PASS** |
| AUTH-02 | Auth | Đăng ký trùng username bị từ chối | 4xx, không tạo user | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Tên đăng nhập đã tồn tại!"}} | **PASS** |
| AUTH-03 | Auth | Đăng ký thiếu trường / email sai | 400 VALIDATION_ERROR | HTTP 400 {"error": {"message": "Du lieu gui len khong hop le", "code": "VALIDATION_ERROR", "details": [{"issue": "must not be blank", "field": "username"}, {"issue": "must be a well-formed email address", "field": "email"}, {"iss… | **PASS** |
| AUTH-04 | Auth | Đăng nhập đúng trả token + user (khớp AuthResponse FE dùng response.user/response.token) | 200, có token và user | HTTP 200 keys=['token', 'user'] | **PASS** |
| AUTH-05 | Auth | Đăng nhập sai mật khẩu | 401 (hoặc 4xx), không có token | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Sai tên đăng nhập hoặc mật khẩu!"}} | **PASS** |
| AUTH-06 | Auth | Gọi API bảo vệ không có token | 401 | HTTP 403 null | **FAIL** |
| AUTH-07 | Auth | Token không hợp lệ | 401 | HTTP 403 null | **FAIL** |
| AUTH-08 | Auth | Token hết hạn (token trong collection Newman) | 401 | HTTP 403 null | **FAIL** |
| AUTH-09 | Auth | USER gọi API admin GET /users | 403 | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Access Denied"}} | **PASS** |
| AUTH-10 | Auth | Lấy profile của chính mình | 200, đúng username | HTTP 200 username=qa_a_28c5e6 | **PASS** |
| AUTH-11 | CORS | Preflight từ http://localhost:5173 | 200 + cho phép origin | HTTP 200 | **PASS** |
| AUTH-12 | CORS | Preflight từ origin lạ bị chặn | 403 | HTTP 403 | **PASS** |
| CAT-01 | Category | User mới được clone danh mục mặc định | 200, danh sách ≥1 | HTTP 200 count=7 | **PASS** |
| CAT-02 | Category | JSON CategoryDTO có field `isSystem` mà FE (CategoriesPage) đọc | có key isSystem | keys=['color', 'hidden', 'icon', 'id', 'name', 'parentId', 'system', 'type'] | **FAIL** |
| CAT-03 | Category | Tạo danh mục chi cha | 201 | HTTP 201 {"id": 82, "name": "QA Ăn uống 28c5e6", "type": "EXPENSE", "icon": null, "color": "#ff0000", "hidden": false, "parentId": null, "system": false} | **PASS** |
| CAT-04 | Category | Tạo danh mục con cùng loại | 201, parentId đúng | HTTP 201 parentId=82 | **PASS** |
| CAT-05 | Category | Danh mục con khác loại với cha bị từ chối | 400 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Danh mục con phải cùng loại với danh mục cha!"}} | **PASS** |
| CAT-06 | Category | User B dùng danh mục cha của A | 4xx | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Không tìm thấy danh mục!"}} | **PASS** |
| WAL-01 | Wallet | Tạo ví với số dư ban đầu 1.000.000 | 201, balance=1000000 | HTTP 201 {"id": 5, "name": "QA Ví A 28c5e6", "balance": 1000000, "icon": "Wallet", "color": "#123456"} | **PASS** |
| WAL-02 | Wallet | Tạo ví số dư âm | 400 | HTTP 400 {"error": {"message": "Du lieu gui len khong hop le", "code": "VALIDATION_ERROR", "details": [{"issue": "must be greater than or equal to 0", "field": "balance"}]}} | **PASS** |
| WAL-03 | Wallet | Sửa ví kèm field balance → balance KHÔNG đổi | 200, balance vẫn 1000000 | HTTP 200 balance=1000000.0 | **PASS** |
| WAL-04 | Wallet | User B sửa ví của A | 403 | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền thao tác trên ví này!"}} | **PASS** |
| WAL-05 | Wallet | User B xóa ví của A | 403 | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền thao tác trên ví này!"}} | **PASS** |
| WAL-06 | Isolation | User B không thấy ví riêng của A | không có ví A | HTTP 200 ids=[] | **PASS** |
| WAL-07 | Wallet | Chủ ví xóa ví | 204 và biến mất khỏi danh sách | HTTP 204 | **PASS** |
| TRX-01 | Transaction | Tạo khoản chi 200.000 → số dư 800.000 | 201, balance=800000 | HTTP 201 balance=800000.0 | **PASS** |
| TRX-02 | Transaction | Tạo khoản thu 500.000 → 1.300.000 | 201, balance=1300000 | HTTP 201 balance=1300000.0 | **PASS** |
| TRX-03 | Transaction | Sửa chi 200.000→300.000 → 1.200.000 | 200, balance=1200000 | HTTP 200 balance=1200000.0 | **PASS** |
| TRX-04 | Audit | Lịch sử sửa giao dịch được ghi (BR-06) | 1 bản ghi old=200000 new=300000 | HTTP 200 [{"id": 2, "transactionId": 41, "oldAmount": 200000.0, "newAmount": 300000.0, "oldType": "EXPENSE", "newType": "EXPENSE", "oldDate": "2026-11-16", "newDate": "2026-11-16", "oldDescription": "QA chi 1", "newDescription": … | **PASS** |
| TRX-05 | Transaction | Xóa khoản thu 500.000 → 700.000 | 204, balance=700000 | HTTP 204 balance=700000.0 | **PASS** |
| TRX-06 | Rollback | Chi vượt số dư bị từ chối, không lưu giao dịch, số dư giữ nguyên | 400; số dư và số giao dịch không đổi | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Giao dịch bị từ chối: Số dư ví không đủ để thực hiện khoản chi này!"}} balance=700000.0 txCount=1 | **PASS** |
| TRX-07 | Transaction | Số tiền 0 | 400 VALIDATION_ERROR | HTTP 400 {"error": {"message": "Du lieu gui len khong hop le", "code": "VALIDATION_ERROR", "details": [{"issue": "Số tiền giao dịch phải lớn hơn 0", "field": "amount"}]}} | **PASS** |
| TRX-08 | Transaction | Danh mục thu gán cho khoản chi | 400 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Danh mục không phù hợp với loại giao dịch (thu/chi)!"}} | **PASS** |
| TRX-09 | Transaction | Ví không tồn tại | 403/404 | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền thêm giao dịch vào ví này!"}} | **PASS** |
| TRX-10 | Isolation | User B sửa giao dịch của A | 403/404, không đổi | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Không tìm thấy giao dịch hoặc truy cập trái phép!"}} | **PASS** |
| TRX-11 | Isolation | User B xóa giao dịch của A | 403/404 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Không tìm thấy giao dịch hoặc truy cập trái phép!"}} | **PASS** |
| TRX-12 | Isolation | User B xem lịch sử giao dịch của A | 403/404 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Không tìm thấy giao dịch hoặc truy cập trái phép!"}} | **PASS** |
| TRX-13 | Isolation | User B liệt kê giao dịch không thấy của A | 0 phần tử | HTTP 200 total=0 | **PASS** |
| TRX-14 | Transaction | Lọc theo keyword + ngày + ví | 1 kết quả | HTTP 200 total=1 | **PASS** |
| BUD-01 | Budget | Tạo ngân sách 1.000.000 (cảnh báo mặc định 80%) | 201, warningPercent=80 | HTTP 201 {"id": 2, "categoryId": 83, "categoryName": "QA Cafe 28c5e6", "month": 11, "year": 2026, "limitAmount": 1000000, "warningPercent": 80.0, "status": "ACTIVE"} | **PASS** |
| BUD-02 | Budget | Tạo trùng ngân sách cùng danh mục/tháng | 400 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Bạn đã thiết lập ngân sách cho danh mục này trong tháng 11/2026"}} | **PASS** |
| BUD-03 | Budget | Chi đúng 80% hạn mức → thông báo cảnh báo | có thông báo 'Sắp vượt ngân sách' | titles=['⚠️ Sắp vượt ngân sách!'] | **PASS** |
| BUD-04 | Budget | Ở 80% trạng thái vẫn ACTIVE | ACTIVE | status=['ACTIVE'] | **PASS** |
| BUD-05 | Budget | Chi đúng 100% hạn mức → EXCEED + thông báo vượt | EXCEED, có 'Vượt ngân sách' | status=['EXCEED'] titles=['Vượt ngân sách chi tiêu!', '⚠️ Sắp vượt ngân sách!'] | **PASS** |
| BUD-06 | Budget | Xóa giao dịch làm chi giảm còn 80% → trạng thái trở lại ACTIVE | ACTIVE | status=['ACTIVE'] | **PASS** |
| BUD-07 | Isolation | User B sửa ngân sách của A | 4xx | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Không tìm thấy ngân sách hoặc bạn không có quyền truy cập!"}} | **PASS** |
| REP-01 | Report | Tổng thu/chi Dashboard = tổng giao dịch | income=2000000.0 expense=800000.0 | income=2000000.0 expense=800000.0 | **PASS** |
| REP-02 | Report | totalBalance = tổng số dư các ví | 2200000.0 | 2200000.0 | **PASS** |
| REP-03 | Report | Tổng chi theo danh mục = totalExpense; netSavings = thu − chi | khớp | sumCat=800000.0 net=1200000.0 | **PASS** |
| REP-04 | Report | Tổng trendData = totals | khớp | trend=[{"date": "2026-11-16", "income": 2000000.0, "expense": 800000.0}] | **PASS** |
| REP-05 | Report | startDate > endDate | 400 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Ngày bắt đầu không được lớn hơn ngày kết thúc!"}} | **PASS** |
| REP-06 | Report | Xuất Excel | 200 file | HTTP 200 | **PASS** |
| REP-07 | Report | Xuất PDF | 200 file | HTTP 200 | **PASS** |
| REP-08 | Isolation | Dashboard của B không chứa số liệu của A | 0 | expense=0.0 balance=0 | **PASS** |
| SHW-01 | Family | A tạo gia đình, B tham gia bằng mã mời | 2xx | create=201 join=200 {"id": 1, "name": "QA Fam 28c5e6", "inviteCode": "5D6D2F09", "ownerId": 10, "ownerUsername": "qa_a_28c5e6"} | **PASS** |
| SHW-02 | SharedWallet | Chia sẻ cho người ngoài gia đình | 400 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Chỉ có thể chia sẻ ví cho các thành viên trong cùng một Gia đình!"}} | **PASS** |
| SHW-03 | SharedWallet | Chia sẻ ví cho B quyền VIEW | 200, permission=VIEW | HTTP 200 {"id": 1, "userId": 11, "username": "qa_b_28c5e6", "email": "qa_b_28c5e6@qa.local", "fullName": "QA B", "permission": "VIEW"} | **PASS** |
| SHW-04 | SharedWallet | B (VIEW) thấy ví được chia sẻ | có ví A | ids=[5] | **PASS** |
| SHW-05 | SharedWallet | WalletDTO cho FE phân biệt ví được chia sẻ / quyền | có field owner/permission | keys=['balance', 'color', 'icon', 'id', 'name'] | **FAIL** |
| SHW-06 | SharedWallet | B (VIEW) tạo giao dịch | 403 | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền thêm giao dịch vào ví này!"}} | **PASS** |
| SHW-07 | SharedWallet | B (VIEW) xem được giao dịch của ví chia sẻ | >0 | total=3 | **PASS** |
| SHW-08 | SharedWallet | B (VIEW) sửa giao dịch trong ví chia sẻ | 4xx | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền sửa giao dịch trong ví này!"}} | **PASS** |
| SHW-09 | SharedWallet | B (VIEW) xóa ví được chia sẻ | 403 | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền thao tác trên ví này!"}} | **PASS** |
| SHW-10 | SharedWallet | Nâng B lên EDIT → B tạo giao dịch, số dư ví A giảm 10.000 | 201, balance giảm 10000 | HTTP 201 before=2200000.0 after=2190000.0 | **PASS** |
| SHW-11 | Report | Ví có 2 thành viên: tổng số dư/chi của chủ ví không bị nhân | totalBalance = tổng ví; expense tăng đúng 10000 | totalBalance=2190000.0 sumWallets=2190000.0 expense=810000.0 (trước 800000.0) | **PASS** |
| SHW-12 | SharedWallet | Thành viên xem danh sách thành viên ví | 200, 2 thành viên | HTTP 200 n=2 | **PASS** |
| SHW-13 | Isolation | Người ngoài xem thành viên ví | 403 | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền truy cập ví này!"}} | **PASS** |
| IMP-01 | Import | Preview đọc header CSV | headers = [Ngày, Số tiền, Nội dung] | HTTP 200 {"headers": ["Ngày", "Số tiền", "Nội dung"], "filename": "sao_ke.csv"} | **PASS** |
| IMP-02 | Import | File sai định dạng (.txt) | 400 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Vui lòng tải lên file định dạng .csv hoặc .xlsx / .xls"}} | **PASS** |
| IMP-03 | Import | Import 2 dòng (chi 45.000, thu 1.500.000) | 201, success=2, số dư +1.455.000 | HTTP 201 {"id": 1, "fileName": "sao_ke.csv", "totalRows": 2, "successRows": 2, "duplicatedRows": 0, "status": true, "createAt": "2026-11-16T01:33:15.4912799"} balance 2190000.0->3645000.0 | **PASS** |
| IMP-04 | Import | Import lại cùng file → phát hiện trùng, không ghi thêm | duplicated=2, success=0, số dư không đổi | HTTP 201 {"id": 2, "fileName": "sao_ke.csv", "totalRows": 2, "successRows": 0, "duplicatedRows": 2, "status": true, "createAt": "2026-11-16T01:33:15.9570473"} balance=3645000.0 | **PASS** |
| IMP-05 | Import | Dòng không khớp rule/AI → 'Chưa phân loại' (BR-03) | Dòng khớp rule → danh mục của rule; dòng không khớp → 'Chưa phân loại' | 'QA Highlands' → 'Ăn uống' (rule mặc định 'Highlands'); 'QA Hoàn tiền' → 'Chưa phân loại'. (Kỳ vọng ban đầu của script sai, đã điều chỉnh) | **PASS** |
| IMP-06 | Rollback | File có 1 dòng lỗi → toàn bộ batch rollback | 400; không lưu dòng hợp lệ; số dư không đổi | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Phát hiện dòng sai định dạng số tiền hoặc ngày tháng!"}} savedOk=0 balance=3645000.0 | **PASS** |
| IMP-07 | SharedWallet | C (VIEW) import vào ví chia sẻ | 403 | HTTP 403 {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền import dữ liệu vào ví này!"}} | **PASS** |
| IMP-08 | Rollback | Import khoản chi lớn hơn số dư | 400, số dư không đổi | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Import bị từ chối: số dư ví sẽ bị âm sau khi ghi nhận các khoản chi trong file!"}} balance=3645000.0 | **PASS** |
| SAV-01 | SavingGoal | Nộp đủ tiền vào mục tiêu → COMPLETE, ví trừ tiền | 200, status=COMPLETE, balance−100000 | HTTP 200 {"id": 2, "title": "QA Mua xe 28c5e6", "targetAmount": 100000.0, "currentAmount": 100000.0, "deadline": "2027-01-01", "status": "COMPLETE"} balance 3645000.0->3545000.0 | **PASS** |
| SAV-02 | SavingGoal | Nộp thêm vào mục tiêu đã hoàn thành | 400 | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Mục tiêu này đã hoàn thành, không thể nộp thêm tiền!"}} | **PASS** |
| SAV-03 | SavingGoal | Deadline trong quá khứ | 400 | HTTP 400 {"error": {"message": "Du lieu gui len khong hop le", "code": "VALIDATION_ERROR", "details": [{"issue": "Thời hạn phải từ hôm nay trở đi", "field": "deadline"}]}} | **PASS** |
| AI-01 | AI | Chat khi không có GEMINI_API_KEY: lỗi rõ ràng, không lộ URL/key | 4xx/5xx, message chung, không chứa 'key='/'googleapis' | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Trợ lý AI tạm thời không khả dụng, vui lòng thử lại sau!"}} | **PASS** |
| AI-02 | AI | Phân tích báo cáo khi không có key | lỗi được xử lý, không lộ key | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "Trợ lý AI tạm thời không khả dụng, vui lòng thử lại sau!"}} | **PASS** |
| AI-03 | AI | Chat message rỗng | 400 | HTTP 400 {"error": {"message": "Du lieu gui len khong hop le", "code": "VALIDATION_ERROR", "details": [{"issue": "Câu hỏi không được để trống", "field": "message"}]}} | **PASS** |
| AI-04 | AI | Chat không có token | 401 | HTTP 403 | **FAIL** |
| BAK-01 | Backup | Export dữ liệu | 200 | HTTP 200 | **PASS** |
| DB-01 | Category/DB | Xóa danh mục đang có giao dịch | 400, danh mục vẫn còn | HTTP 400 {'error': {'code': 'BAD_REQUEST', 'message': 'Danh mục đã có giao dịch hoặc ngân sách liên quan, không thể xoá. Hãy ẩn danh mục thay vì xoá!'}} | **PASS** |
| DB-02 | Category/DB | Xóa danh mục CHA (cha không có giao dịch, con có giao dịch) | 400 nghiệp vụ, không xóa con | HTTP 400 {"error": {"code": "BAD_REQUEST", "message": "could not execute statement [Referential integrity constraint violation: \"fkrme3v2iww4j9qkxv4f93vv4mt: public.budget FOREIGN KEY(category_id) REFERENCES  | **FAIL** |
| DB-03 | Wallet/DB | Xóa ví có giao dịch → giao dịch bị xóa theo (cascade), không còn bản ghi mồ côi | 204; 0 giao dịch còn lại | HTTP 204 remaining=0 | **PASS** |
| DB-04 | Backup | Export chứa ví/giao dịch/ngân sách/mục tiêu của A | có dữ liệu | wallets=1 tx=7 goals=1 | **PASS** |
| DB-05 | Backup | Restore file backup vào user mới (có mục tiêu tiết kiệm) | 200; khôi phục đủ mục tiêu, ví và 7/7 giao dịch | HTTP 200 goals=1/1 wallets=1 tx=6/7 — thiếu giao dịch 'QA B edit' (dùng danh mục của thành viên B, không có trong file backup) và không có cảnh báo | **FAIL** |
| DB-06 | Backup | Restore lần 2 cùng file không nhân đôi giao dịch | số giao dịch không đổi | before=6 after=6 | **PASS** |
| DB-07 | Backup/Isolation | File export của A chỉ chứa dữ liệu A có quyền | chỉ ví A sở hữu/được chia sẻ | tx in shared/own wallets=7 | **PASS** |
| DB-08 | DB | Sau khi restart backend: đăng nhập lại, số dư/giao dịch/ngân sách/báo cáo giữ nguyên | {'balanceA': 3545000.0, 'txCountA': 7, 'budgets': 1, 'expense': 955000.0} | balance=3545000.0 tx=7 budgets=1 expense=955000.0 | **PASS** |
| UI-01 | UI/Integration | Đăng nhập qua UI và mở 11 trang người dùng | Không có lỗi API ngoài AI (thiếu key) | 11/11 trang tải được; lỗi API duy nhất: 400 /ai/analyze-report (không có GEMINI_API_KEY) | **PASS** |
| UI-02 | UI/Dashboard | Số liệu thẻ Dashboard = API /report/overview | 3.545.000 / 3.500.000 / 955.000 / 2.545.000 | UI: 3.545.000 đ, 3.500.000 đ, 955.000 đ, 2.545.000 đ | **PASS** |
| UI-03 | UI/AI | A chat → đăng xuất → C đăng nhập cùng trình duyệt | C không thấy hội thoại của A | C thấy tin 'BI-MAT-CUA-A…'; localStorage 'finmanage_chat_history' vẫn còn sau logout | **FAIL** |
| UI-04 | UI/SharedWallet | C (VIEW) thêm giao dịch vào ví chia sẻ qua form | Báo không đủ quyền, vẫn đăng nhập | Form cho chọn ví chia sẻ; POST 403 'Bạn không có quyền thêm giao dịch vào ví này!' → bị xóa token, chuyển về /login | **FAIL** |
| UI-05 | UI/Responsive | Dashboard ở viewport 390×844 | Nội dung dùng được, không bị sidebar chiếm chỗ | Sidebar 260px, vùng nội dung còn 131px, chữ vỡ dòng từng từ (ảnh ui_mobile.png) | **FAIL** |
| NM-01 | Newman | Chạy docs/kiem-thu/newman/user.json nguyên trạng | Có assertion, phản ánh đúng kết quả | 60 request, 0 assertion; 57/60 trả 403 (token hết hạn) nhưng Newman báo 0 failed | **FAIL** |
| NM-02 | Newman | Chạy user.json với token mới của user_demo | Các request hợp lệ thành công | 200×19, 201×4, 204×6, 400×24, 403×7 — do ID viết cứng (ví/danh mục id=1 của user khác) và body hóa đơn cũ ('08:00:00' ≠ HH:mm) | **FAIL** |
| NM-03 | Bill | Tạo hóa đơn với định dạng FE gửi ('08:00') | Tạo thành công | HTTP 200, notificationTime='08:00' (lưu ý: trả 200 thay vì 201 như các API tạo khác) | **PASS** |
| AUTO-01 | Automation | Backend unit + integration test (./mvnw test) | Tất cả pass | 107/107 pass (gồm 6 test tích hợp HTTP mới FinanceFlowIntegrationTest) | **PASS** |
| AUTO-02 | Automation | Frontend build (vite build) | Build thành công | Thành công (cảnh báo chunk > 500 kB) | **PASS** |
| AUTO-03 | Automation | Frontend unit test | Có bộ test | Không có framework/script test trong package.json | **NOT TESTED** |
| BLK-01 | DB/MySQL | Chạy trên MySQL 8 thật + Flyway V1__Init_schema.sql | — | Docker daemon tắt; không có application-local.yaml (không có thông tin MySQL). Đã chạy trên H2 MODE=MySQL, schema do Hibernate tạo (ddl-auto) chứ không qua Flyway | **BLOCKED** |
| BLK-02 | AI | Gemini thật: phân tích báo cáo, hỏi đáp, phân loại giao dịch bằng AI | — | Không có GEMINI_API_KEY; chỉ kiểm được nhánh lỗi (AI-01/02) và fallback 'Chưa phân loại' | **BLOCKED** |
| BLK-03 | Auth | Đăng nhập Google | — | Không có GOOGLE_CLIENT_ID | **BLOCKED** |
| NT-01 | Notification | Gửi email cảnh báo | — | SMTP cố ý trỏ 127.0.0.1:1 để không gửi mail ra ngoài; chỉ kiểm thông báo trong app | **NOT TESTED** |
| NT-02 | Import | Import file .xlsx/.xls | — | Chỉ kiểm CSV | **NOT TESTED** |
| NT-03 | Scheduler | Nhắc hóa đơn / mục tiêu theo lịch (cron) | — | Chỉ có unit test; không chạy chờ cron | **NOT TESTED** |
| NT-04 | Concurrency | Hai giao dịch đồng thời trên cùng ví | — | Chưa có kịch bản song song | **NOT TESTED** |
| NT-05 | Admin | Bộ collection admin.json (khóa/xóa user, cấu hình, backup) | — | Chỉ kiểm USER bị chặn khỏi /users (AUTH-09) | **NOT TESTED** |
## 9. Trạng thái sửa lỗi (cập nhật 2026-11-16, sau lượt sửa)

| Bug | Trạng thái | Thay đổi | Kiểm chứng |
|---|---|---|---|
| INT-01 | ✅ Đã sửa | Lịch sử chat lưu theo key `finmanage_chat_history_<userId>`; `logout()` xóa key của user và key cũ (`AuthContext.tsx`, `AiAssistantPage.tsx`) | Playwright: A chat → đăng xuất → không còn key chat nào; C đăng nhập chỉ thấy lời chào |
| INT-02 | ✅ Đã sửa | Interceptor chỉ đăng xuất khi 401 (`services/api.ts`) | 403 hiển thị thông báo, không bị đẩy về `/login` |
| INT-03 | ✅ Đã sửa | `HttpStatusEntryPoint(401)` cho request chưa xác thực; tài khoản bị khóa trả 401 `ACCOUNT_LOCKED` (`SecurityConfig`, `JwtAuthenticationFilter`) | `FinanceFlowIntegrationTest.protectedEndpointWithoutTokenIsRejected` (401 không token / token sai, 403 khi thiếu quyền); Newman 401 |
| INT-04 | ✅ Đã sửa (đã được duyệt) | `WalletDTO.myPermission` = `OWNER`/`EDIT`/`VIEW` (thêm field, không đổi field cũ). UI: ẩn Sửa/Chia sẻ/Xóa với ví không sở hữu, lọc ví VIEW khỏi form giao dịch / nộp tiết kiệm / import, nhãn quyền trên thẻ ví, danh sách thành viên trong hộp thoại chia sẻ | Unit test `getWalletsForUser_ReportsCallersPermissionPerWallet`; integration test kiểm tra VIEW/EDIT/OWNER; Playwright với user VIEW: 0 nút Sửa/Xóa, nút "Thêm giao dịch" bị vô hiệu |
| INT-05 | ✅ Đã sửa | Restore: giao dịch dùng danh mục của thành viên khác được gán vào danh mục cùng tên của user (tạo nếu chưa có) thay vì bị bỏ qua (`DataBackupServiceImpl`) | `importUserData_TransactionWithForeignCategory_IsRestoredUnderSameNamedCategory`. Quyết định nghiệp vụ về số dư khi restore (audit backend H-07) vẫn chờ xác nhận |
| INT-06 | ✅ Đã sửa | Handler riêng cho `DataIntegrityViolationException` (409, thông báo chung) và `HttpMessageNotReadableException` (400, thông báo chung); `deleteCategory` kiểm tra cả danh mục con | `deleteCategory_ChildHasTransactions_ThrowsBusinessErrorInsteadOfFkViolation`; Newman "JSON sai định dạng → 400 không lộ chi tiết parser" |
| INT-07 | ✅ Đã sửa | Sidebar `Offcanvas responsive="lg"` + nút menu trên Header | Playwright 12 trang × 1366/820/390 px: không tràn ngang, menu mở/đóng đúng |
| INT-08 | ✅ Đã sửa | `newman/regression.postman_collection.json`: 33 request, 50 assertion, tự tạo dữ liệu, tự dọn; `newman/README.md` | Chạy 3 lần liên tiếp: 0 failed |
| INT-09 | ✅ Đã sửa ở FE | `CategoriesPage` đọc `system` (đúng tên Jackson xuất ra) thay vì `isSystem`; type `Category.system` trong `types/finance.ts`. Không đổi API | Kiểm tra tĩnh + build |
| INT-10, INT-11 | INT-11 ✅ (Dashboard chỉ gọi AI khi bấm); INT-10 chưa sửa | — | — |

Kết quả chạy lại sau sửa: backend `./mvnw test` **110/110 pass**; Newman regression **33/33 request, 50/50 assertion**; frontend `vite build` thành công, `tsc` còn 5 lỗi có sẵn ở file chưa chạm (trước là 34).
