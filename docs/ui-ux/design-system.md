# Design System – FinManage

Nguồn thật: các token trong `src/frontend/src/index.css` (`:root`). Tài liệu này giải thích lý do và cách dùng. Mọi token đều map sang biến CSS của Bootstrap 5.3, nên các component React Bootstrap có sẵn tự nhận token mới mà không phải sửa từng trang.

## Nguyên tắc

1. **Con số là giao diện.** Số tiền dùng chữ số đều cột (`.num`, tabular-nums), căn phải trong danh sách, luôn kèm đơn vị và kỳ ("Tháng 11/2026").
2. **Đỏ nghĩa là có vấn đề, không phải "khoản chi".** Khoản chi hiển thị màu `--ink`; khoản thu dùng `--income` kèm dấu "+"; màu đỏ `--danger` chỉ dành cho vượt ngân sách, số dư âm, lỗi và thao tác xóa.
3. **Phân cấp bằng viền và khoảng trắng, không bằng bóng.** Panel dùng viền 1px `--line`; bóng chỉ dành cho lớp nổi (dropdown, modal, offcanvas).
4. **Một điểm nhấn cho mỗi trang.** Dashboard có dải dòng tiền (Thu − Chi = Còn lại); các phần còn lại giữ tiết chế.
5. **Nội dung do AI tạo luôn được gắn nhãn** và đặt tách biệt với số liệu thật từ backend.

## Màu

| Token | Hex | Dùng cho |
|---|---|---|
| `--canvas` | `#F4F6F8` | Nền ứng dụng |
| `--surface` | `#FFFFFF` | Panel, modal |
| `--ink` | `#162032` | Chữ chính, số tiền khoản chi |
| `--ink-muted` | `#5A6474` | Chữ phụ, nhãn (tương phản 5.9:1 trên trắng) |
| `--line` | `#E2E6EB` | Viền, đường chia |
| `--brand` / `--brand-strong` / `--brand-tint` | `#2348C9` / `#1B389F` / `#EBEFFB` | Hành động chính, trạng thái active |
| `--income` / `--income-tint` | `#0F7F4F` / `#E6F4EC` | Khoản thu, trạng thái tốt |
| `--danger` / `--danger-tint` | `#B42318` / `#FCEDEB` | Vượt ngân sách, âm, lỗi, xóa |
| `--warning` / `--warning-tint` | `#A15C07` / `#FDF3E2` | Gần chạm ngưỡng |

Các biến cũ (`--color-primary`, `--color-text-muted`…) được trỏ sang token mới, nên các style inline có sẵn vẫn chạy.

## Typography

- Font: **Be Vietnam Pro** (Google Fonts, các weight 400/500/600/700), fallback `system-ui`.
- Thang chữ: 12 (`--fs-xs`), 14 (`--fs-sm`, chữ mặc định trong bảng và form), 16 (body), 20 (tiêu đề panel), 28 (số chính), 40 (số dư tổng).
- Weight: 400 cho chữ thường, 500 cho nhãn, 600 cho tiêu đề và số, 700 chỉ cho số dư tổng.
- Câu viết dạng sentence case, không viết hoa toàn bộ nhãn.

## Khoảng cách, bo góc, bóng

- Khoảng cách theo thang 4px; dùng tiện ích của Bootstrap (`gap-2`=8, `gap-3`=16, `p-4`=24). Khoảng cách giữa các panel là 16px (`g-3`).
- Bo góc phân cấp: control `6px`, panel `10px`, badge trạng thái dạng pill.
- Bóng: `--shadow-overlay` chỉ dùng cho dropdown, modal, offcanvas.

## Component

| Thành phần | Quy ước |
|---|---|
| Button | `btn-primary` (`--brand`) cho một hành động chính mỗi vùng; `btn-outline-secondary` cho hành động phụ; `btn-outline-danger` cho xóa. Chiều cao 38px, bo 6px |
| Input / Select | Viền `--line`, focus là viền `--brand` + ring 3px `--brand-tint` (bàn phím luôn thấy được focus) |
| Panel (`.panel`) | Nền `--surface`, viền 1px, bo 10px, tiêu đề 16px/600 + hành động bên phải |
| Modal | Bootstrap Modal, bo 10px, bóng overlay |
| Table / danh sách | Hàng cao 52px, đường chia `--line`, số căn phải `.num` |
| Sidebar | 248px từ `lg` trở lên; nhỏ hơn `lg` thì là Offcanvas mở bằng nút menu trên Header. Mục active nền `--brand-tint`, chữ `--brand-strong` |
| Navbar (Header) | Cao 64px: nút menu (mobile), tên trang, thông báo |
| Trạng thái | `LoadingState`, `EmptyState` (kèm hành động), `ErrorState` (kèm Thử lại) trong `components/ui/PageState.tsx` |
| Bộ chọn kỳ | `components/ui/PeriodPicker.tsx`: Tháng/Năm + nút ‹ › |
