# Audit UI/UX – Personal Finance Management (Frontend)

Ngày: 2026-11-16 · Phạm vi: `src/frontend` (React 19, Vite 8, React Bootstrap 2, Recharts 3, lucide-react) · Giai đoạn 1: chỉ đánh giá, chưa sửa code.

Mức ưu tiên: **P0** là lỗi chức năng/bảo mật thấy được trên UI; **P1** gây hiểu sai số liệu hoặc cản thao tác chính; **P2** là vấn đề nhất quán/khả dụng; **P3** là trau chuốt.

---

## 0. Vấn đề xuyên suốt (ảnh hưởng mọi màn hình)

| ID | Ưu tiên | Vấn đề | Bằng chứng | Hướng cải thiện |
|---|---|---|---|---|
| G-01 | **P0** | **Không dùng được trên mobile/tablet.** Sidebar cố định 260px, không thu gọn; layout `vh-100 overflow-hidden` | `MainLayout.tsx`, `Sidebar.tsx` | Từ `lg` trở xuống, sidebar chuyển thành Offcanvas mở bằng nút menu trên Header |
| G-02 | **P0** | **Mọi phản hồi 403 đều đăng xuất người dùng.** Backend trả 403 cho cả "thiếu quyền" (vd. thành viên VIEW thêm giao dịch), nên người dùng bị đá ra trang login thay vì thấy thông báo | `services/api.ts` interceptor | Chỉ đăng xuất khi 401, khi 403 không có body (chưa xác thực) hoặc khi tài khoản bị khóa; còn lại hiển thị lỗi |
| G-03 | **P0** | **Lịch sử chat AI lưu `localStorage` theo trình duyệt, không theo user và không xóa khi đăng xuất**, nên người dùng sau trên cùng máy thấy hội thoại tài chính của người trước | `AiAssistantPage.tsx` (`finmanage_chat_history`), `AuthContext.logout` | Xóa khi logout và gắn key theo user |
| G-04 | P1 | Không có design token thống nhất: màu viết cứng rải rác (`#f8fafc`, `#e0e7ff`, `#cfd8dc`, `#ef4444`, gradient), bo góc trộn `rounded-3/4/pill`, nút có 4–5 kiểu | grep `style={{` toàn `src` | Bộ token ở `index.css` và class dùng chung (Giai đoạn 2) |
| G-05 | P1 | Trạng thái loading/empty/error không nhất quán: `MySpinner` dùng `min-vh-100` nằm trong vùng đã cuộn, gây cuộn kép; lỗi API phần lớn chỉ `console.error`, nên người dùng thấy trang trống như "không có dữ liệu" | hầu hết page | Component `LoadingState`, `EmptyState`, `ErrorState` (có nút thử lại) |
| G-06 | P1 | Tiêu đề trang bị lặp: Header hiển thị title, mỗi page lại có thêm một Card tiêu đề to + mô tả (Dashboard, Transactions, Budgets, Wallets) | `MainLayout` + từng page | Header giữ tên trang; page chỉ có thanh công cụ (bộ lọc + hành động chính) |
| G-07 | P2 | Thông báo bằng `alert()`/`window.confirm()` của trình duyệt | nhiều page | Giữ `confirm` cho thao tác phá hủy ở giai đoạn đầu; về lâu dài dùng modal xác nhận và toast dùng chung |
| G-08 | P2 | Hầu hết là `any`: `useState<any[]>`, props `any` | page/component | Thêm type theo DTO backend khi chạm tới từng màn hình (`Transaction`, `Wallet`, `Budget`, `SavingGoal`) |
| G-09 | P2 | Số tiền không dùng chữ số đều cột (tabular), nên số trong danh sách/bảng nhảy cột | toàn app | Dùng `font-variant-numeric: tabular-nums` cho số tiền |
| G-10 | P2 | `index.html` có `lang="en"`, `title="frontend"`, nên trình đọc màn hình đọc sai tiếng Việt và tab trình duyệt không có tên | `index.html` | `lang="vi"`, title "FinManage" |
| G-11 | P3 | Lỗi TypeScript có sẵn (34 lỗi: import thừa…), lệnh `build` không chạy `tsc`; `package-lock.json` lệch với `package.json` | — | Dọn dần theo từng file được chạm |
| G-12 | P2 | Khả năng truy cập: nút toàn icon (bánh răng, chuông, đăng xuất) không có `aria-label`; một số phần tử `span`/`div` có `onClick` mà không truy cập được bằng bàn phím | `Header`, `Sidebar`, các Card | Dùng `button` thật + `aria-label` |

---

## 1. Dashboard – `pages/DashboardPage.tsx`

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| D-01 | P1 | **Nhãn sai kỳ:** ở chế độ "Theo Tháng" dữ liệu là cả năm, nhưng thẻ vẫn ghi "Thu nhập tháng này", "Chi tiêu tháng này" | Nhãn sinh theo kỳ đang chọn ("Tháng 11/2026", "Năm 2026") |
| D-02 | P1 | "Tổng tiền cá nhân" thực chất là tổng số dư **mọi ví có quyền truy cập, kể cả ví được chia sẻ**, và không phụ thuộc kỳ đang chọn | Đổi thành "Tổng số dư các ví" + ghi chú "hiện tại" |
| D-03 | P1 | Thẻ AI (gradient lớn) chiếm vị trí đầu trang và **tự gọi Gemini mỗi lần đổi bộ lọc** (tốn quota, chậm, đẩy số liệu thật xuống dưới). Văn bản AI không được đánh dấu là nội dung do AI tạo | Số liệu thật lên đầu; AI chuyển xuống dưới, chỉ gọi khi người dùng bấm, có nhãn "Do AI tạo, có thể chưa chính xác" |
| D-04 | P1 | Thiếu **giao dịch gần đây**, **cảnh báo ngân sách** và **mục tiêu tiết kiệm sắp đến hạn** (yêu cầu dashboard) | Thêm 2 panel dùng API có sẵn: `GET /transactions?size=5`, `GET /budgets`, `GET /saving-goals` |
| D-05 | P2 | % thay đổi không có màu theo ý nghĩa (chi tiêu tăng là xấu, thu nhập tăng là tốt) | Tô màu theo ý nghĩa cho từng chỉ số |
| D-06 | P2 | Biểu đồ tròn + legend dễ rối khi có nhiều danh mục; không thấy tỷ lệ % hay số tiền nếu không hover | Danh sách xếp hạng có thanh ngang: tên, số tiền, % trên tổng chi |
| D-07 | P2 | Xu hướng dùng line chart cho dữ liệu dạng ngăn (Tuần 1–5, Tháng 1–12); trục Y ghi "tr" nhưng không có chú thích đơn vị | Biểu đồ cột nhóm thu/chi + chú thích "Đơn vị: triệu đồng" |
| D-08 | P2 | Năm cố định `[2024…2028]`; lặp tiêu đề "Tổng quan tài chính" (G-06) | Danh sách năm sinh từ năm hiện tại; bộ chọn kỳ có nút ‹ › |
| D-09 | P2 | Lỗi tải dữ liệu hiển thị là "Không có dữ liệu hiển thị" | `ErrorState` + Thử lại |
| D-10 | P3 | `calculatePercentageChange` ở backend trả 100% khi kỳ trước bằng 0, nên UI hiện "+100%" gây hiểu lầm | Ghi chú; cần backend trả `null` (để ngoài phạm vi, không đổi API) |

## 2. Transactions – `pages/TransactionsPage.tsx`

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| T-01 | **P1** | **Chỉ tải 100 giao dịch đầu** rồi lọc/tìm kiếm phía client, nên giao dịch cũ hơn không bao giờ tìm thấy. Không có phân trang | Dùng tham số backend có sẵn `walletId, categoryId, startDate, endDate, keyword, page, size` |
| T-02 | P1 | Thiếu lọc theo **ví, danh mục, khoảng thời gian** | Thanh lọc: khoảng ngày, ví, danh mục, loại |
| T-03 | P1 | Lọc "Thu/Chi" làm client-side; backend chưa có tham số `type` | Giữ lọc client trong trang hiện tại và ghi chú; đề xuất thêm `type` cho API (cần xác nhận) |
| T-04 | P2 | Header mỗi nhóm ngày nền xanh đậm `bg-primary`, quá nặng khi lặp lại nhiều lần | Header nhóm nhẹ (chữ muted + tổng ròng của ngày) |
| T-05 | P2 | Icon giống nhau cho mọi giao dịch (`CircleDollarSign`), không phân biệt thu/chi hay danh mục | Icon/màu chấm theo danh mục, mũi tên thu/chi |
| T-06 | P2 | Hành động nằm trong dropdown bánh răng, cần 2 click | Desktop: icon sửa/xóa hiện trực tiếp; mobile: giữ menu |
| T-07 | P2 | Mô tả bị cắt cứng 150px | Cắt theo không gian thực tế (`text-truncate` + `min-width:0`) |

## 3. Wallets – `pages/WalletsPage.tsx`

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| W-01 | **P1** | **Không phân biệt ví cá nhân và ví được chia sẻ, không hiện quyền VIEW/EDIT.** Mọi ví đều có menu Sửa/Chia sẻ/Xóa, nên thành viên được chia sẻ bấm vào sẽ bị backend từ chối (và bị đăng xuất do G-02). `WalletDTO` hiện chỉ có `id, name, balance, icon, color` | **Cần bổ sung API** (thêm field, không phá contract): `ownedByMe`/`myPermission` vào `WalletDTO`. Chờ xác nhận |
| W-02 | P1 | Card ví màu xám `#cfd8dc` cố định, bỏ qua `wallet.color` của người dùng; dòng phụ "Tài khoản chính" viết cứng cho mọi ví | Dùng màu ví làm điểm nhấn; bỏ nhãn sai |
| W-03 | P2 | Hai card tổng (ví, tiết kiệm) to, chiếm nửa màn hình; tổng tính ở client | Một dải tóm tắt gọn |
| W-04 | P2 | Nút "Tùy chỉnh danh mục" đặt ở trang Ví, trong khi Sidebar không có mục Danh mục | Thêm "Danh mục" vào Sidebar |

## 4. Categories – `pages/CategoriesPage.tsx` (420 dòng)

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| C-01 | P2 | Không có lối vào từ Sidebar (G/W-04) | Thêm vào nav |
| C-02 | P2 | File lớn, gộp danh sách + form + rule; trùng nhiều với `admin/AdminCategoriesPage.tsx` (361 dòng) | Tách component dùng chung khi tới lượt màn hình này |

## 5. Budgets – `pages/BudgetsPage.tsx`, `components/budgets/BudgetCard.tsx`

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| B-01 | **P1** | % dùng `Math.round` rồi `min(100)`, nên 99,6% được làm tròn thành 100% và hiện "Đã vượt ngân sách!" dù chưa vượt; khi vượt thật thì không hiển thị số tiền vượt | Tính trên số thực, tách "đã vượt X đ"; trạng thái vượt ưu tiên `status=EXCEED` từ backend |
| B-02 | P1 | Chỉ xem được ngân sách **tháng hiện tại**, không có điều hướng tháng | Bộ chọn tháng |
| B-03 | P2 | Số đã chi do frontend ghép từ `expenseByCategory` (xem audit backend M-13) | Giữ nguyên; tách logic % ra helper dùng chung với Dashboard; đề xuất `spentAmount` từ backend |
| B-04 | P2 | Màu: vàng `warning` của Bootstrap có độ tương phản chữ thấp trên nền trắng | Token `--warning` đậm hơn |

## 6. Savings Goals – `pages/SavingGoalsPage.tsx`, `SavingGoalCard.tsx`

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| S-01 | P1 | Nút "+ Nộp thêm" màu **đỏ** cho hành động tích cực, dễ nhầm với hành động nguy hiểm | Nút primary |
| S-02 | P1 | Không hiển thị **quá hạn** (deadline đã qua mà chưa đủ), không có "còn N ngày" hay tốc độ cần đạt | Badge trạng thái: Đang tiết kiệm / Sắp đến hạn / Quá hạn / Hoàn thành |
| S-03 | P3 | Tổng tiết kiệm hiển thị ở trang Ví thay vì trang Mục tiêu | Chuyển hoặc thêm vào trang Mục tiêu |

## 7. Reports

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| R-01 | P1 | **Không có màn hình Báo cáo riêng**; xuất Excel/PDF nằm trong thẻ AI ở Dashboard | Giai đoạn 3: tách trang `/reports` (khoảng ngày tùy chọn, lọc ví khi xuất file vì API có `walletId`), dùng lại biểu đồ của Dashboard |
| R-02 | P2 | Không chọn được khoảng ngày tùy ý (chỉ tháng/năm) | Bộ chọn khoảng ngày |

## 8. Import – `pages/ImportPage.tsx`

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| I-01 | P1 | Không có bước **xem trước các dòng** trước khi ghi (cần backend dry-run, xem audit backend H-06) | Chờ backend; giao diện chuẩn bị stepper 3 bước |
| I-02 | P2 | Không có chỉ báo bước (1 chọn file → 2 ánh xạ cột → kết quả) | Stepper |
| I-03 | P2 | Kết quả chỉ có tổng/thành công/trùng; không có liên kết sang giao dịch vừa import | Link "Xem giao dịch" |

## 9. AI Assistant – `pages/AiAssistantPage.tsx`

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| A-01 | **P0** | G-03 (lịch sử chat lộ giữa các tài khoản) | Xóa khi logout, key theo user |
| A-02 | P1 | UI giống hội thoại có ngữ cảnh, nhưng backend xử lý **mỗi câu độc lập** (không gửi lịch sử), nên câu hỏi nối tiếp ("còn tháng trước?") trả lời sai mà người dùng không biết | Ghi chú rõ dưới ô nhập; gợi ý câu hỏi đầy đủ; khi backend có agent/tool thì hiển thị nguồn dữ liệu |
| A-03 | P2 | Không có câu hỏi gợi ý, không có timestamp; lỗi có giọng xin lỗi chung chung | Chip gợi ý, thông báo lỗi nói rõ nguyên nhân + nút gửi lại |
| A-04 | P2 | Markdown chỉ render `**bold**`; danh sách `-`/`1.` của Gemini hiện thô | Render tối thiểu: in đậm, gạch đầu dòng, xuống dòng |

## 10. Profile & Settings – `ProfilePage.tsx`, `ChangePasswordPage.tsx`, `admin/AdminConfigsPage.tsx`

| ID | Ưu tiên | Vấn đề | Hướng cải thiện |
|---|---|---|---|
| P-01 | P2 | `ProfilePage` có state đổi mật khẩu không dùng (`passSaving`, `passMsg`, `handleChangePassword`) trùng với `ChangePasswordPage` | Gộp: tab "Hồ sơ / Bảo mật / Sao lưu" |
| P-02 | P3 | Sidebar gọi mục này là "Cài đặt tài khoản" còn Header là "Hồ sơ cá nhân" | Thống nhất tên gọi |

---

## 11. Component cần tạo hoặc tái sử dụng

| Component | Trạng thái | Dùng cho |
|---|---|---|
| `ui/StatCard` | Có sẵn, giữ lại, đổi sang token | Dashboard, Wallets, Goals |
| `ui/PageState` (`LoadingState`, `EmptyState`, `ErrorState`) | **Mới** | Mọi màn hình (thay `MySpinner` toàn trang trong layout) |
| `ui/PeriodPicker` (tháng/năm + ‹ ›) | **Mới** | Dashboard, Budgets, Reports |
| `ui/Panel` (card có tiêu đề + hành động) | **Mới**, mỏng | Dashboard, Reports |
| `utils/budget.ts` `getBudgetUsage()` | **Mới** (tách từ BudgetCard) | BudgetCard, Dashboard |
| `utils/format.ts` `formatCurrency`, `toLocalISODate`, + `formatCompact` | Có sẵn + mở rộng | Biểu đồ, thẻ |
| `Sidebar` / `Header` / `MainLayout` | Sửa cho responsive | Toàn app |
| `TransactionList`, `TransactionModal`, `BudgetCard`, `SavingGoalCard`, `WalletCard` | Có sẵn, chỉnh dần theo từng màn hình | — |

## 12. Thứ tự triển khai

1. Design system (token + PageState) và app shell responsive (G-01, G-02, G-03, G-05, G-06, G-10) → **Dashboard** (D-01…D-09).
2. Transactions (T-01, T-02 là P1) → Wallets (W-02; W-01 chờ API) → Budgets (B-01, B-02) → Reports (R-01) → Savings Goals (S-01, S-02) → Import (I-02, I-03) → AI (A-02…A-04) → Profile.

Mỗi màn hình đều được build, chạy `tsc` và có báo cáo riêng trước khi chuyển sang màn hình tiếp theo.

---

## 13. Trạng thái triển khai Giai đoạn 3 (cập nhật 2026-11-16)

| Màn hình | Đã khắc phục | Còn lại |
|---|---|---|
| App shell | G-01 (sidebar responsive), G-02, G-03, G-05 (`PageState`, `MySpinner` không còn `min-vh-100`), G-06 (bỏ tiêu đề trùng), G-10, G-12 (aria-label cho nút icon ở Header/Sidebar), thêm mục Danh mục và Báo cáo vào nav | G-07 (toast/modal xác nhận dùng chung thay `alert/confirm`) |
| Dashboard | D-01 → D-09: dải dòng tiền, nhãn theo kỳ, AI theo yêu cầu + nhãn "Do AI tạo", giao dịch gần đây, panel "Cần chú ý", màu % theo ý nghĩa, danh mục dạng xếp hạng, biểu đồ cột có đơn vị, `PeriodPicker`, error/empty/loading theo từng panel | D-10 (cần backend trả `null` khi kỳ trước = 0) |
| Transactions | T-01 (lọc + phân trang phía server), T-02, T-04 → T-07; ẩn Sửa/Xóa theo quyền ví | T-03: lọc Thu/Chi vẫn ở client trong trang hiện tại (API chưa có `type`, cần xác nhận) |
| Wallets | W-01 (sau khi có `myPermission`), W-02, W-03, W-04; danh sách thành viên + quyền trong hộp thoại chia sẻ | `WalletModal` chưa làm lại giao diện |
| Budgets | B-01 (`utils/budget.ts`, floor %, hiện số tiền vượt), B-02 (chọn tháng, lập trước được tháng sau), B-04 | B-03 (`spentAmount` từ backend, audit M-13) |
| Reports | R-01 (trang `/reports` mới, tái sử dụng component Dashboard), R-02 (khoảng ngày + mốc nhanh), lọc ví khi xuất file | Biểu đồ/overview chưa lọc được theo ví (API overview không có `walletId`) |
| Savings Goals | S-01, S-02 (`utils/goal.ts`: Đang tiết kiệm / Sắp đến hạn / Quá hạn / Hoàn thành, gợi ý số tiền/tháng), S-03 | `CreateGoalModal` chưa làm lại giao diện |
| Import | I-02 (stepper), I-03 (link xem giao dịch), sửa số "Bỏ qua" dùng `duplicatedRows` | I-01 chờ backend dry-run (audit backend H-06) |
| AI Assistant | A-01, A-02 (ghi chú phạm vi dữ liệu thật của backend), A-03 (gợi ý, lỗi rõ ràng + Gửi lại), A-04 (render danh sách) | Hiển thị nguồn dữ liệu khi backend có agent/tool |
| Profile | P-01 (xóa code đổi mật khẩu trùng), nút đổi mật khẩu không còn màu đỏ, bỏ tiêu đề trùng | Gộp tab Hồ sơ/Bảo mật/Sao lưu; Categories, Bills, Family, Admin chưa làm lại (chỉ nhận token mới) |

Component mới/dùng chung: `ui/PageState`, `ui/PeriodPicker`, `dashboard/RecentTransactions`, `dashboard/DashboardAlerts`, `pages/ReportsPage`, `utils/budget.ts`, `utils/goal.ts`, `utils/wallet.ts`, `types/finance.ts`. Đã xóa: `Footer.tsx`, `ui/StatCard.tsx` (không còn nơi dùng).

### Bổ sung: các màn hình còn lại (2026-11-16)

| Màn hình | Đã làm |
|---|---|
| Danh mục | Tab Chi/Thu, danh sách cha–con trong panel, gom danh mục đã ẩn sau công tắc, modal có bảng màu, từ khóa hiển thị dạng thẻ; khi xóa không được thì hiện đúng lý do từ backend rồi mới đề nghị ẩn |
| Danh mục mặc định (Admin) | Dùng chung `CategoriesPage` ở chế độ `admin` (danh mục mẫu sửa/xóa được, giữ cảnh báo "chỉ ảnh hưởng người đăng ký sau"); xóa ~360 dòng trùng lặp (C-02) |
| Hóa đơn định kỳ | Bảng → danh sách responsive; sửa nhãn "Thứ 8 hằng tuần" thành "Chủ nhật"; ghi chú ngày 29–31 rơi vào cuối tháng (đúng logic `FinanceTaskScheduler`) |
| Gia đình | Thống nhất vai trò (Chủ gia đình / Quản lý / Thành viên); phân biệt "chưa có gia đình" với lỗi mạng; hộp thoại xác nhận nói rõ quyền ví chia sẻ bị thu hồi khi rời/xóa/mời ra |
| Người dùng (Admin) | Tìm kiếm, danh sách responsive, nhãn trạng thái; giữ nguyên chặn thao tác với admin gốc và chính mình |
| Cấu hình hệ thống (Admin) | Danh sách + modal; tham số `*_PERCENT` chỉ nhận số 1–100 |
| Modal tạo/sửa ví | Chọn loại ví bằng nút, bảng màu, số dư chỉ đọc khi sửa, lỗi hiển thị trong modal |
| Modal mục tiêu | `min` ngày = hôm nay (khớp `@FutureOrPresent` của backend), lỗi trong modal |
| Token | `--bs-body-bg` = `--surface` (modal, input, dropdown, card nền trắng); nền trang `--canvas` đặt trên `body` |

Đã xóa: `MySpinner.tsx` (không còn nơi dùng). Chưa làm lại: trang Đăng nhập / Đăng ký (chỉ nhận token mới).
