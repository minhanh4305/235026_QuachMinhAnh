require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8080')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('Nguon frontend khong duoc phep truy cap (CORS)');
    error.status = 403;
    return callback(error);
  }
}));
app.use(express.json({ limit: '20kb' }));

app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: connected ? 'connected' : 'disconnected'
  });
});

app.use('/api/books', bookRoutes);
app.use((req, res) => res.status(404).json({ message: 'Endpoint khong ton tai' }));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === 11000) return res.status(409).json({ message: 'bookId da ton tai' });
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join('; ') });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'JSON khong hop le' });
  }
  if (err.status === 403) return res.status(403).json({ message: err.message });
  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError' || mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Khong the ket noi MongoDB' });
  }
  console.error('API error:', err);
  res.status(500).json({ message: 'Loi may chu' });
});

async function start() {
  if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
    console.error('Thieu MONGODB_URI hoac DB_NAME trong backend/.env');
    process.exitCode = 1;
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 10000
    });
    // Cho Mongoose tao xong index unique bookId truoc khi mo cong API.
    await Book.init();
    console.log('Da ket noi MongoDB:', mongoose.connection.name);
    app.listen(PORT, '0.0.0.0', () => console.log(`Backend dang chay: http://localhost:${PORT}`));
  } catch (err) {
    console.error('Khong khoi dong duoc backend:', err.message);
    process.exitCode = 1;
    await mongoose.disconnect();
  }
}

start();
