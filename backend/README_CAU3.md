# Backend Câu 3 — 235007_NguyenVanHuong

Sao chép `models/Book.js`, `routes/bookRoutes.js`, `server.js`, `.env.example` vào `D:\235007_NguyenVanHuong\backend`, giữ nguyên file `.env` cũ và `checkDb.js`.

```powershell
cd D:\235007_NguyenVanHuong\backend
npm.cmd install express cors mongoose dotenv
npm.cmd pkg set "scripts.start=node server.js" "scripts.dev=node --watch server.js"
node checkDb.js
npm.cmd run dev
```

Mở một terminal khác:

```powershell
curl.exe http://localhost:5000/health
curl.exe http://localhost:5000/api/books
curl.exe "http://localhost:5000/api/books?search=Code"
```

Lưu ý: Khi chưa khắc phục lỗi `bad auth : Authentication failed` từ câu 2, backend không thể kết nối Atlas. Đổi mật khẩu MongoDB từng xuất hiện trong ảnh rồi cập nhật `backend/.env`. Không commit `.env`.

API trả JSON và hỗ trợ GET/POST/PUT/DELETE. `:id` là `_id` MongoDB. `POST` và `PUT` yêu cầu đủ 9 trường. `bookId` có unique index, `Book.init()` đảm bảo tạo index xong trước khi listen.
