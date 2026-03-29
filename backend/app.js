const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes    = require('./routes/authRoutes');
const userRoutes    = require('./routes/userRoutes');
const postRoutes    = require('./routes/postRoutes');
const chatRoutes    = require('./routes/chatRoutes');
const videoRoutes   = require('./routes/videoRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const reportRoutes   = require('./routes/reportRoutes');

const app = express();

// ── Connect to MongoDB ─────────────────────────────────────────────────────
connectDB();

// ── CORS ───────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000']
  : true; // In dev, allow all

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors({ origin: ALLOWED_ORIGINS, credentials: true }));

// ── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/video',    videoRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/reports',  reportRoutes);

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Zedify API is running 🚀' });
});

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
