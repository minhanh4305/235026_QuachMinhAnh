// Cấu hình runtime — được nginx entrypoint ghi đè khi container khởi động
// Không sửa file này trực tiếp; truyền biến môi trường VITE_API_URL khi chạy container
window.__API_URL__ = "http://localhost:5000";
