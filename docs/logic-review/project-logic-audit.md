# Rà soát logic nghiệp vụ – Personal Finance Management

Ngày rà soát: 2026-11-16 · Phạm vi: `src/backend` (Spring Boot 3.5, Java 17), `src/frontend` (React 19 + Vite) · Nhánh: `main` (cebc2b2)

## 0. Tóm tắt

| Mức độ | Số vấn đề | Đã sửa | Cần xác nhận / đề xuất |
|---|---|---|---|
| CRITICAL | 3 | 3 | 0 |
| HIGH | 7 | 5 | 2 |
| MEDIUM | 13 | 1 + 1 phần (M-02) | 11 |
| LOW | 7 | 0 | 7 |
| **Tổng** | **30** | **9 sửa xong + 1 phần** | **20** |

Kết quả kiểm thử sau khi sửa: backend **101/101 test pass** (86 test cũ + 15 test mới), frontend `vite build` thành công, `tsc` không thêm lỗi mới (34 lỗi cũ, trước và sau đều như nhau).

### Khác biệt giữa tài liệu và code

- `docs/kiem-thu/CLAUDE.md` không tồn tại; hướng dẫn QA nằm ở `src/backend/src/test/claude.md`.
- CLAUDE.md nói "danh tính lấy từ Spring Security Context". Thực tế `JwtAuthenticationFilter` parse JWT và gắn `userId` vào `request attribute`; controller đọc nó qua `@RequestAttribute("userId")`. Giá trị này lấy từ JWT đã xác thực, nên vẫn an toàn (không tin userId do client gửi), chỉ khác về cơ chế.
- BR-03 yêu cầu "xem lại và xác nhận giao dịch import". Thực tế `/import-batches/preview` chỉ trả về **tên cột**, còn `/upload` ghi thẳng vào DB (xem H-06).
- Có `ddl-auto: update` chạy song song với Flyway (chỉ có `V1__Init_schema.sql`), nên schema thực tế có thể lệch so với migration (L-07).

---

## 1. Bảng tổng hợp vấn đề

| ID | Mức | Module | Vấn đề | Trạng thái |
|---|---|---|---|---|
| C-01 | CRITICAL | Báo cáo / Ví / Ngân sách | Tổng thu, chi và số dư bị **nhân theo số thành viên** của ví chia sẻ | ✅ Đã sửa |
| C-02 | CRITICAL | Giao dịch / Import | Lần cập nhật số dư bị bỏ qua khi số dư không đủ → giao dịch và số dư lệch nhau | ✅ Đã sửa |
| C-03 | CRITICAL | AI | Gemini API key nằm trong URL, có thể bị trả về client qua thông báo lỗi | ✅ Đã sửa |
| H-01 | HIGH | Ngân sách | Trạng thái EXCEED / cờ đã cảnh báo không bao giờ được đặt lại; sửa hoặc xóa giao dịch không tính lại ngân sách cũ; import không kích hoạt cảnh báo | ✅ Đã sửa |
| H-02 | HIGH | Giao dịch / Import | Không kiểm tra danh mục có cùng loại (thu/chi) với giao dịch | ✅ Đã sửa |
| H-03 | HIGH | Backup | Phục hồi luôn thất bại nếu file có mục tiêu tiết kiệm mới (danh sách bất biến) | ✅ Đã sửa |
| H-04 | HIGH | Backup / Bảo mật | Phục hồi ghi giao dịch vào ví **của người khác** (kể cả khi chỉ có quyền VIEW) nếu trùng tên ví | ✅ Đã sửa |
| H-05 | HIGH | Frontend | `toISOString()` làm lệch ngày ở UTC+7: tiến độ ngân sách lấy sai khoảng ngày, ngày mặc định sai trước 7h sáng | ✅ Đã sửa |
| H-06 | HIGH | Import | Không có bước xem trước từng dòng và xác nhận trước khi ghi (BR-03) | ⏸ Cần xác nhận (thay đổi API) |
| H-07 | HIGH | Backup | Phục hồi vào ví đã có thì thêm giao dịch mà không cập nhật số dư; ví mới lấy số dư tùy ý từ file | ⏸ Cần xác nhận (nghiệp vụ) |
| M-01 | MEDIUM | Import / Backup | Kiểm tra trùng lặp truyền `Double` cho cột `DECIMAL` | ✅ Đã sửa |
| M-02 | MEDIUM | AI / Import | Gọi Gemini không có timeout, lại nằm trong DB transaction của import | ✅ Timeout · ⏸ Tách khỏi transaction |
| M-03 | MEDIUM | Báo cáo | Xu hướng theo `MONTH` chỉ gom theo số tháng, nên gộp lẫn các năm khác nhau | ⏸ Cần xác nhận |
| M-04 | MEDIUM | Ngân sách | `warningPercent` không có giới hạn trên (>100 thì không bao giờ cảnh báo) | ⏸ Cần xác nhận |
| M-05 | MEDIUM | Ngân sách | Ngân sách chỉ tính danh mục chính xác, không cộng danh mục con | ⏸ Cần xác nhận nghiệp vụ |
| M-06 | MEDIUM | Tiết kiệm | Nộp tiền vào mục tiêu CANCELLED được; không có rút hay hoàn tiền; chuyển tiết kiệm không kích hoạt cảnh báo ngân sách | ⏸ Cần xác nhận |
| M-07 | MEDIUM | Danh mục | Xóa danh mục cha sẽ cascade xóa danh mục con; nếu con đã có giao dịch thì lỗi FK thô | ⏸ Đề xuất |
| M-08 | MEDIUM | Xử lý lỗi | Mọi `RuntimeException` → 400 và trả `ex.getMessage()` thô (có thể lộ lỗi SQL/nội bộ); không có 404 | ⏸ Cần xác nhận (API contract) |
| M-09 | MEDIUM | Báo cáo / AI | Ngày mặc định dùng `LocalDate.now()` theo timezone của server | ⏸ Đề xuất cấu hình |
| M-10 | MEDIUM | Import | "Chưa phân loại" có loại EXPENSE nhưng cũng được gán cho dòng INCOME | ⏸ Cần xác nhận |
| M-11 | MEDIUM | Import | Hai dòng giống hệt nhau trong cùng một file đều được ghi | ⏸ Cần xác nhận |
| M-12 | MEDIUM | Import | Ô Excel dạng công thức trả về chuỗi công thức; số có đúng 3 chữ số thập phân bị hiểu là dấu phân cách nghìn | ⏸ Đề xuất |
| M-13 | MEDIUM | Ngân sách / Frontend | Số đã chi của ngân sách do frontend tự ghép từ báo cáo; `BudgetDTO` không có `spentAmount` | ⏸ Đề xuất (API bổ sung) |
| L-01 | LOW | Chung | Dùng lẫn `jakarta.transaction.Transactional` và `org.springframework...Transactional` | Đề xuất |
| L-02 | LOW | Ngân sách | `checkAndAlertBudget` tải toàn bộ ngân sách của user rồi mới lọc trong bộ nhớ | Đề xuất |
| L-03 | LOW | Báo cáo | % thay đổi tính bằng `double` (chỉ để hiển thị) | Đề xuất |
| L-04 | LOW | AI | Chat không có lịch sử và tool; model chỉ biết tổng số dư | Lộ trình (mục 3) |
| L-05 | LOW | Giao dịch | `TransactionHistory` không lưu lần đổi danh mục | Đề xuất (cần schema) |
| L-06 | LOW | Frontend | `package-lock.json` lệch với `package.json`; 34 lỗi `tsc` có sẵn; `build` không chạy `tsc` | Đề xuất |
| L-07 | LOW | DB | `ddl-auto: update` chạy song song với Flyway | Đề xuất |

---

## 2. Chi tiết

### C-01 – Tổng hợp tài chính bị nhân theo số thành viên ví chia sẻ (ĐÃ SỬA)

- **File:** `transactions/repository/TransactionRepository.java` (`getTotalAmountByType`, `getExpenseByCategory`, `getTrendData`, `sumExpenseByCategoryAndMonth`, `filterTransactions`, `findByIdAndAccessibleByUser`), `wallets/repository/WalletRepository.java#getTotalBalanceAccessibleByUser`.
- **Logic cũ:** `LEFT JOIN w.members wm WHERE (w.owner.id = :userId OR wm.user.id = :userId)`, sau đó `SUM(...)`.
- **Nguyên nhân:** phép JOIN sinh một dòng cho mỗi thành viên của ví. Với chủ ví, điều kiện `owner` đúng trên mọi dòng, nên mỗi giao dịch bị cộng N lần (N = số thành viên).
- **Hậu quả:** Dashboard (tổng thu, chi, số dư), biểu đồ, tổng chi theo danh mục, **cảnh báo ngân sách** (báo vượt sớm) và dữ liệu đưa vào AI đều sai ngay khi ví có từ 2 thành viên trở lên. Đã tái hiện bằng test: số liệu bị gấp đôi.
- **Logic mới:** `JOIN t.wallet w WHERE (w.owner.id = :userId OR EXISTS (SELECT 1 FROM WalletMember wm WHERE wm.wallet = w AND wm.user.id = :userId))`. Điều kiện quyền truy cập giữ nguyên, chỉ không còn nhân dòng.
- **Ảnh hưởng:** chỉ đổi cách viết truy vấn; chữ ký method, API và schema giữ nguyên.
- **Test:** `SharedWalletAggregationTest` (`@DataJpaTest` trên H2, 5 case: tổng, số dư, danh sách/lookup, người ngoài không thấy gì, kiểm tra trùng với BigDecimal).

### C-02 – Số dư ví lệch với giao dịch (ĐÃ SỬA)

- **File:** `TransactionServiceImpl#updateTransaction`, `#deleteTransaction`, `ImportBatchServiceImpl#importData`.
- **Logic cũ:** `walletRepository.updateBalance(...)` trả về 0 khi số dư mới < 0 (điều kiện trong SQL), nhưng chỉ `createTransaction` kiểm tra giá trị này. Ở update, delete và import thì kết quả bị bỏ qua.
- **Hậu quả:** (a) sửa một khoản chi thành số lớn hơn số dư thì giao dịch vẫn được lưu nhưng số dư không đổi; (b) xóa một khoản thu đã tiêu hết thì giao dịch bị xóa nhưng số dư không bị trừ; (c) import file có tổng chi lớn hơn số dư thì các giao dịch được lưu nhưng số dư không đổi. Cả ba trường hợp đều vi phạm BR-02.
- **Logic mới:** nếu `updateBalance == 0` thì ném lỗi, transaction rollback, không lưu gì. Quy tắc "số dư không âm" vốn có trong SQL được giữ nguyên; đây không phải quy tắc mới.
- **Ảnh hưởng:** người dùng sẽ nhận lỗi 400 với thông báo rõ ràng thay vì dữ liệu bị lệch âm thầm.
- **Test:** `deleteTransaction_RevertWouldMakeBalanceNegative_Rejected`, `updateTransaction_InsufficientBalance_Rejected`, `importData_InsufficientBalance_ThrowsSoTransactionRollsBack`.

### C-03 – Lộ Gemini API key (ĐÃ SỬA)

- **File:** `AiAssistantServiceImpl#callGeminiTextApi`.
- **Logic cũ:** gắn `?key=<API_KEY>` vào URL, rồi `throw new RuntimeException("Gemini API error: " + e.getMessage())`. Với lỗi mạng (`ResourceAccessException`), message chứa **toàn bộ URL kèm key**, và `GlobalExceptionHandler` trả nguyên message đó cho client.
- **Logic mới:** gửi key qua header `x-goog-api-key`; client chỉ nhận thông báo chung "Trợ lý AI tạm thời không khả dụng…"; chi tiết vẫn được log phía server (URL không còn chứa key). Thêm timeout: kết nối 10s, đọc 30s.
- **Khuyến nghị:** nếu key từng xuất hiện trong log hoặc response, hãy **thu hồi và cấp lại key**.

### H-01 – Trạng thái ngân sách bị "kẹt" (ĐÃ SỬA)

- **File:** `BudgetServiceImpl#checkAndAlertBudget` (tách ra thành `evaluateBudget`), `#updateBudget`, `TransactionServiceImpl`, `ImportBatchServiceImpl`.
- **Logic cũ:** khi đã EXCEED hoặc đã gửi cảnh báo thì không bao giờ quay lại ACTIVE, kể cả khi giao dịch bị sửa/xóa hoặc hạn mức được tăng. Sửa giao dịch sang danh mục hoặc tháng khác chỉ kiểm tra ngân sách mới. Xóa giao dịch không kiểm tra lại. Import không kiểm tra.
- **Logic mới:** mỗi lần đánh giá, nếu số đã chi đã giảm xuống dưới ngưỡng thì đặt lại `status=ACTIVE` / `warningSent=false`, nhờ đó cảnh báo có thể gửi lại khi vượt ngưỡng lần nữa. Ngân sách được tính lại khi: xóa giao dịch chi; sửa giao dịch (ngân sách mới, và cả ngân sách cũ nếu đổi danh mục/loại/tháng); sửa hạn mức; import (mỗi cặp danh mục–tháng có khoản chi). Ngưỡng cảnh báo vẫn lấy từ `warningPercent` hoặc `DEFAULT_BUDGET_WARNING_PERCENT`, không hardcode.
- **Test:** `checkAndAlertBudget_SpendingDroppedAfterEditOrDelete_ResetsStaleFlags`, `updateBudget_RaiseLimitAboveSpending_ClearsExceed`, `updateTransaction_MoveToAnotherMonth_RechecksBothBudgets`, và assert `checkAndAlertBudget` trong test import.

### H-02 – Danh mục không cùng loại với giao dịch (ĐÃ SỬA)

- **Logic cũ:** có thể tạo khoản thu gắn danh mục chi (thực tế đã xảy ra vì form mặc định chọn `categories[0]` mà không xét loại). Import áp rule hoặc kết quả AI mà không kiểm tra loại.
- **Logic mới:**
  - Tạo giao dịch: bắt buộc `category.type == transaction.type`.
  - Sửa giao dịch: chỉ kiểm tra khi **đổi danh mục**. Dữ liệu cũ (ví dụ khoản thu đã import nằm ở "Chưa phân loại" loại EXPENSE) vẫn sửa được số tiền hoặc ghi chú mà không bị chặn.
  - Import: rule và AI chỉ được chọn danh mục cùng loại, nếu không thì rơi về "Chưa phân loại" (đúng BR-03).
  - Frontend `TransactionModal`: mặc định không chọn danh mục, và xóa danh mục đã chọn khi đổi Thu/Chi.
- **Test:** `createTransaction_CategoryTypeMismatch_Rejected`, `importData_RuleOfWrongType_NotAppliedToIncome`.

### H-03, H-04 – Phục hồi backup (ĐÃ SỬA)

- **File:** `DataBackupServiceImpl#importUserData`.
- **H-03:** `Page.getContent()` trả về danh sách bất biến, nên `existingGoals.add(...)` ném `UnsupportedOperationException`. Mọi file backup có mục tiêu tiết kiệm mới đều thất bại với thông báo "File sao lưu không hợp lệ". **Sửa:** dùng `new ArrayList<>(...)`.
- **H-04:** ví được tìm theo tên trong `findAllWalletAccessByUser`, tức là bao gồm cả ví người khác chia sẻ (kể cả quyền VIEW). Giao dịch trong backup bị ghi vào ví đó mà không kiểm tra quyền EDIT, vi phạm BR-05. **Sửa:** chỉ khớp với ví mà user **sở hữu**; nếu không có thì tạo ví mới.
- **Test:** `importUserData_NewSavingGoal_RestoredWithoutError`, `importUserData_SameNameWalletOnlySharedWithUser_NotReused`.

### H-05 – Lệch ngày ở frontend (ĐÃ SỬA)

- **File:** `pages/BudgetsPage.tsx`, `components/transactions/TransactionModal.tsx`, `components/saving-goals/CreateGoalModal.tsx`.
- **Nguyên nhân:** `new Date(y, m, 1).toISOString()` đổi sang UTC. Ở UTC+7, 00:00 ngày 1/11 thành `2026-10-31T17:00Z`.
- **Hậu quả:** tiến độ ngân sách tháng 11 lấy khoảng 31/10–29/11, tức là tính thêm ngày cuối tháng trước và bỏ sót ngày cuối tháng này. Ngày mặc định khi tạo giao dịch hoặc mục tiêu trước 7h sáng bị lùi một ngày.
- **Sửa:** thêm helper `toLocalISODate()` trong `utils/format.ts` và dùng ở cả 3 chỗ.

### H-06 – Import chưa có xem trước và xác nhận (CẦN XÁC NHẬN)

- **Hiện tại:** `POST /preview` chỉ trả `headers`; `POST /upload` parse và ghi luôn. Người dùng không thấy được dòng nào trùng, dòng nào chưa phân loại trước khi dữ liệu vào DB.
- **Phương án đề xuất (thêm mới, không phá API cũ):** `POST /import-batches/dry-run` dùng cùng tham số với `/upload` nhưng **không ghi DB**, trả về danh sách dòng `{date, amount, type, description, categoryId, duplicate:boolean, error?}`. Frontend hiển thị bảng, người dùng xác nhận thì gọi `/upload` như hiện nay. Code parse hiện có được tách ra dùng chung, không viết lại.
- **Ảnh hưởng:** thêm endpoint, frontend `ImportPage` cần thêm bước xem trước. Có thể giữ hoặc bỏ việc gọi AI ở bước dry-run (tốn quota).

### H-07 – Số dư sau khi phục hồi backup (CẦN XÁC NHẬN)

- Phục hồi vào ví **đã có**: giao dịch được thêm nhưng `balance` không đổi. Phục hồi ví **mới**: `balance` lấy từ file (đã bao gồm các giao dịch), nhưng file có thể bị sửa tay, nghĩa là người dùng có thể đặt số dư tùy ý.
- **Cần chọn:** (a) ví mới tạo với số dư 0 rồi cộng dần theo giao dịch được phục hồi, hoặc (b) giữ nguyên cách làm hiện tại và ghi rõ là chấp nhận.

### Các vấn đề MEDIUM còn lại (đề xuất, chưa sửa)

- **M-02:** đã thêm timeout. Đề xuất tiếp: gọi AI phân loại **trước** khi mở DB transaction (tách `importData` thành bước parse + phân loại và bước ghi có `@Transactional`), tránh giữ kết nối DB tới 30 giây.
- **M-03:** đổi key xu hướng thành `"Tháng m/yyyy"` khi khoảng ngày vượt qua một năm. Việc này thay đổi nhãn biểu đồ nên cần xác nhận.
- **M-04:** thêm `@Max(100)` cho `warningPercent` ở Create/UpdateBudgetRequest. Request đang hợp lệ có thể bị từ chối, nên cần xác nhận.
- **M-05:** ngân sách cho danh mục cha có cần cộng chi tiêu của các danh mục con không? Đây là quyết định nghiệp vụ.
- **M-06:** chặn `addFunds` với mục tiêu CANCELLED; quyết định xem khi xóa hoặc hủy mục tiêu có hoàn tiền về ví không.
- **M-07:** `deleteCategory` nên kiểm tra cả giao dịch và ngân sách của danh mục con trước khi xóa.
- **M-08:** thêm exception riêng (NotFound → 404) và trả thông báo chung cho các exception không phải lỗi nghiệp vụ. Frontend hiện đang đọc `error.message`, nên cần làm cẩn thận.
- **M-09:** đặt `TZ=Asia/Ho_Chi_Minh` (hoặc `-Duser.timezone`) khi deploy, nếu không thì "đầu tháng" tính theo timezone của server.
- **M-10:** tạo thêm danh mục "Chưa phân loại (thu)" loại INCOME. Đây là thay đổi dữ liệu và nghiệp vụ.
- **M-11:** hai giao dịch giống hệt nhau trong cùng một file có thể là hợp lệ (hai ly cà phê trong cùng ngày), nên cần quyết định nghiệp vụ.
- **M-12:** dùng `FormulaEvaluator` cho ô công thức; cho phép người dùng chọn định dạng số.
- **M-13:** thêm `spentAmount` (backend tính) vào `BudgetDTO` để frontend không phải tự ghép. Thay đổi này chỉ bổ sung, không phá API.

---

## 3. Đánh giá AI Assistant và lộ trình Single Agent

### Hiện trạng (`ai_assistant`)

| Tiêu chí | Hiện tại |
|---|---|
| Gọi Gemini | `RestTemplate` → `gemini-3.1-flash-lite:generateContent`, chỉ text, một lượt |
| Lịch sử hội thoại | Không có (mỗi `/chat` là độc lập) |
| Dữ liệu cung cấp cho model | `chatWithAi`: chỉ tổng số dư. `analyzeReport`: tổng thu/chi và chi theo danh mục, do `ReportService` tính (đúng nguyên tắc) |
| Tool calling | Không có, nên model không thể trả lời "tháng trước tôi chi bao nhiêu cho ăn uống" |
| Phân loại import | Gửi danh sách mô tả và danh mục; ID trả về được kiểm tra thuộc danh mục của user và (sau khi sửa) cùng loại thu/chi |
| Timeout / lỗi | Đã thêm timeout; lỗi trả về thông báo chung (C-03) |
| Prompt injection | Mô tả giao dịch được đưa thẳng vào prompt phân loại. Rủi ro thấp vì đầu ra bị ràng buộc vào tập ID hợp lệ |

### Thiết kế đề xuất (chờ xác nhận, chưa triển khai)

Mở rộng ngay trong `ai_assistant`, không tạo assistant thứ hai:

```
AiAssistantController /api/v1/ai/chat  (userId từ JWT filter)
  └─ AgentOrchestrator (mới, trong AiAssistantServiceImpl hoặc class cạnh đó)
       ├─ Gemini generateContent + tools.functionDeclarations
       ├─ vòng lặp tối đa 4 lượt tool-call, rồi buộc trả lời
       └─ ToolRegistry (allowlist, read-only)
            ├─ get_income_expense_summary(startDate,endDate) → ReportService.getDashboardOverview
            ├─ get_expense_by_category(startDate,endDate)    → ReportService.getDashboardOverview
            ├─ get_wallet_balances()                          → WalletService.getWalletsForUser
            ├─ get_budget_progress(month,year)                → BudgetService.getBudgets + spent (M-13)
            └─ get_saving_goals()                             → SavingGoalService.getSavingGoals
```

Quy tắc bắt buộc, kiểm soát bằng code chứ không chỉ bằng prompt:

1. `userId` **không** nằm trong schema tham số của tool. Orchestrator tự gắn từ request đã xác thực.
2. Tool chỉ gọi Service (các Service hiện tại đã lọc theo quyền truy cập nhờ truy vấn `ACCESSIBLE_BY_USER` sau khi sửa C-01). Không gọi Repository trực tiếp, không có SQL.
3. Kiểm tra tham số: ngày phải là ISO, `start <= end`, khoảng tối đa 366 ngày, tháng trong 1–12. Tham số sai thì trả `{error}` cho model chứ không ném exception ra ngoài.
4. Chỉ có tool đọc (giai đoạn 1). Nếu sau này cần ghi dữ liệu: model chỉ tạo *đề xuất* có cấu trúc, frontend hiển thị và người dùng bấm xác nhận rồi mới gọi API thật (không đi qua LLM).
5. Mỗi tool có timeout riêng; tối đa 4 lượt; kết quả tool đóng gói dưới dạng `functionResponse` (dữ liệu chứ không phải chỉ thị), nên mô tả giao dịch không thể ghi đè system prompt.
6. Lịch sử hội thoại chỉ dùng để hiểu ngữ cảnh ("tháng đó", "danh mục ấy"). Mọi con số phải lấy lại qua tool ở từng lượt.
7. Câu trả lời ghi rõ khoảng ngày và đơn vị VNĐ; nếu không có dữ liệu thì phải nói là không có.

Thứ tự thực hiện theo `docs/agent/CLAUDE.md`: (1) `get_monthly_expense`, sau đó (2) `get_expense_by_category` và `get_budget_progress`, cuối cùng (3) `compare_financial_periods` và `get_wallet_balance`.

---

## 4. Kế hoạch xử lý theo thứ tự ưu tiên

| # | Việc | Trạng thái |
|---|---|---|
| 1 | C-01, C-02, C-03 | ✅ Xong |
| 2 | H-01 → H-05, M-01, timeout M-02 | ✅ Xong |
| 3 | **Thu hồi và cấp lại Gemini key** nếu từng bị lộ | Việc vận hành, người dùng tự làm |
| 4 | H-06 dry-run import, H-07 số dư khi phục hồi | Chờ xác nhận |
| 5 | M-13 `spentAmount`, M-08 exception, M-04 `@Max(100)` | Chờ xác nhận |
| 6 | AI Agent giai đoạn 1 (tool `get_monthly_expense`) | Chờ xác nhận thiết kế mục 3 |
| 7 | M-03, M-05, M-06, M-10, M-11 (nghiệp vụ) | Chờ quyết định |
| 8 | LOW, M-07, M-09, M-12, đồng bộ `package-lock.json`, dọn lỗi `tsc` | Khi có thời gian |

## 5. Danh sách file đã thay đổi

Backend (main):
- `transactions/repository/TransactionRepository.java` – C-01, M-01
- `wallets/repository/WalletRepository.java` – C-01
- `transactions/service/impl/TransactionServiceImpl.java` – C-02, H-01, H-02
- `budgets/service/impl/BudgetServiceImpl.java` – H-01
- `importBatch/service/impl/ImportBatchServiceImpl.java` – C-02, H-01, H-02, M-01
- `backup/service/impl/DataBackupServiceImpl.java` – H-03, H-04, M-01
- `ai_assistant/service/impl/AiAssistantServiceImpl.java` – C-03, M-02

Backend (test):
- mới: `transactions/repository/SharedWalletAggregationTest.java`
- cập nhật và bổ sung: `TransactionServiceImplTest`, `ImportBatchServiceImplTest`, `BudgetServiceImplTest`, `DataBackupServiceImplTest`. Fixture được bổ sung `category.type`, vì cột này là `nullable=false` trong dữ liệu thật; ngoài ra mock `updateBalance` trả về thành công. Không có test nào bị xóa hoặc nới assert.

Frontend:
- `utils/format.ts`, `pages/BudgetsPage.tsx`, `components/transactions/TransactionModal.tsx`, `components/saving-goals/CreateGoalModal.tsx` – H-05, H-02

## 6. Kiểm thử đã chạy

| Lệnh | Kết quả |
|---|---|
| `./mvnw test` (trước khi sửa) | 86 test, 0 lỗi |
| `./mvnw test -Dtest=SharedWalletAggregationTest` (trước khi sửa truy vấn) | 2/5 **fail**: tổng bị gấp đôi (đã tái hiện C-01) |
| `./mvnw test` (sau khi sửa) | **101 test, 0 failure, 0 error** |
| `npm run build` (vite) | Thành công |
| `tsc -p tsconfig.app.json --noEmit` | 34 lỗi trước và 34 lỗi sau, toàn bộ là lỗi có sẵn (import `React` thừa…), không có lỗi mới |

Chưa chạy được:
- Integration test với **MySQL thật**: test dùng H2; JPQL `EXISTS` chuẩn nên dự kiến tương thích, nhưng chưa kiểm chứng trên MySQL.
- Kiểm tra API bằng Postman/Newman (`docs/kiem-thu/postman`) vì không có backend đang chạy.
- Kiểm thử UI thủ công.
- Gọi Gemini thật.
