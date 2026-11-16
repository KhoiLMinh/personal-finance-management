# Newman

| File | Trạng thái | Ghi chú |
|---|---|---|
| `regression.postman_collection.json` | **Dùng cái này** | Tự chứa: mỗi lần chạy tự đăng ký user mới, đăng nhập lấy token, tạo dữ liệu và dùng ID trả về; có assertion (status + nội dung) cho từng request; tự dọn dữ liệu đã tạo |
| `user.json`, `admin.json` | Lỗi thời | Không có assertion, token viết cứng đã hết hạn, ID viết cứng, body hóa đơn sai định dạng giờ. Giữ lại để tham khảo request mẫu (xem INT-08 trong `../integration-test-report.md`) |

Chạy (backend đang chạy ở cổng 8080):

```
newman run regression.postman_collection.json --env-var baseUrl=http://localhost:8080/api/v1
```

Chỉ chạy trên môi trường dev/QA: collection tạo user thật trong DB đang trỏ tới.
