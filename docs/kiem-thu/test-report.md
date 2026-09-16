## Bảng kết quả testcase

| Mã / Tên Module                 | Tổng số TC | Pass (Lượt 1) | Fail (Lượt 1) | Pass (Lượt 2) | Fail (Lượt 2) |
| ------------------------------- | ---------: | ------------: | ------------: | ------------: | ------------: |
| 1. Xác thực & Người dùng (AUTH) |         11 |            11 |             0 |            11 |             0 |
| 2. Quản lý Danh mục (CATE)      |          7 |             7 |             0 |             7 |             0 |
| 3. Quản lý Ví (WALL)            |          8 |             8 |             0 |             8 |             0 |
| 4. Quản lý Giao dịch (TRAN)     |          9 |             9 |             0 |             9 |             0 |
| 5. Quản lý Ngân sách (BUDG)     |          8 |             7 |             1 |             8 |             0 |
| 6. Quản lý Gia đình (FAMI)      |         11 |            11 |             0 |            11 |             0 |
| 7. Mục tiêu tiết kiệm (SAVE)    |          7 |             7 |             0 |             7 |             0 |
| 8. Nhập dữ liệu (IMP)           |          5 |             4 |             1 |             5 |             0 |
| 9. Quản lý Thông báo (NOTI)     |          7 |             6 |             1 |             7 |             0 |
| 10. Lên lịch tự động (SCHED)    |          5 |             4 |             1 |             5 |             0 |
| 11. Báo cáo Thống kê (REPO)     |          4 |             3 |             1 |             4 |             0 |
| 12. Sao lưu Phục hồi (BACK)     |          3 |             3 |             0 |             3 |             0 |
| Tổng cộng                       |         85 |            80 |             5 |            85 |             0 |

## Bảng defect

| Mã Defect | GitHub Issue | Nhãn (Labels) | Mô tả lỗi phát hiện (Fail ở Lượt 1)                                                                                  | Cách khắc phục (Fix)                                                                                          | Trạng thái |
| --------- | ------------ | ------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| DF-01     | #24          | bug logic     | (TC-BUDG-006) Cảnh báo vượt ngân sách 100% không chạy khi tiêu đúng bằng số tiền giới hạn. Do dùng dấu > thay vì >=. | Chỉnh sửa biểu thức điều kiện thành: totalSpent >= limitAmount.                                               | Đã đóng    |
| DF-02     | #27          | bug math      | (TC-REPO-002) Bị lỗi ArithmeticException: / by zero (Chia cho 0) ở biểu đồ khi tháng trước chưa có giao dịch nào.    | Thêm lệnh if kiểm tra: Nếu tiền tháng trước = 0 thì tự gán % tăng trưởng là 100%.                             | Đã đóng    |
| DF-03     | #29          | bug api       | (TC-IMP-003) Khi mạng chậm, API Gemini phản hồi lâu làm sập luôn luồng import file Excel (HTTP 500).                 | Thêm khối try/catch bọc hàm gọi AI. Nếu AI lỗi thì tự gán vào danh mục "Chưa phân loại" để file vẫn lưu được. | Đã đóng    |
| DF-04     | #30          | bug security  | (TC-NOTI-005) Lỗi bảo mật: Người dùng A truyền ID lên API có thể xóa được thông báo của người dùng B.                | Sửa hàm truy vấn Database: Phải bắt buộc khớp cả id của thông báo VÀ userId của người đang đăng nhập.         | Đã đóng    |
| DF-05     | #33          | bug unit-test | (TC-SCHED-001) Bị lỗi NullPointerException khi chạy Unit Test cho hàm nhắc nhở hoá đơn định kỳ.                      | Bổ sung hàm mockUser.setId(1L) và gán vào hóa đơn giả lập ở phần Arrange của file Test.                       | Đã đóng    |
