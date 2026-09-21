# Traveller Team

## Cấu trúc thư mục

```text
traveller-team/
├── index.html       # Khung HTML, nội dung và các biểu mẫu
├── css/
│   └── style.css    # Toàn bộ giao diện và responsive
├── js/
│   └── app.js       # Modal, validation và xử lý ba biểu mẫu
├── src/
│   ├── input.css     # File nguồn Tailwind
│   └── output.css    # CSS được biên dịch
├── server.js         # Server tĩnh chạy trang web
└── README.md        # Ghi chú quản lý dự án
```

## Chạy dự án

```bash
npm start
```

Sau đó mở `http://localhost:5500/`. Nếu cổng 5500 đang được sử dụng, chạy trên cổng khác bằng PowerShell:

```powershell
$env:PORT=5501; npm start
```

Biên dịch Tailwind thủ công:

```bash
npm run build:css
```

Theo dõi và tự biên dịch CSS khi phát triển:

```bash
npm run dev:css
```

## Lưu ý

Đăng ký và đăng nhập hiện là bản frontend demo, dữ liệu tài khoản được lưu trong `localStorage`. Khi triển khai thật, cần thay phần này bằng API backend và mã hóa mật khẩu.
