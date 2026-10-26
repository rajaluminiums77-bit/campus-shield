const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as now');
    res.json({
      success: true,
      message: 'Campus Shield API is running',
      database: 'connected',
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: err.message,
    });
  }
});

// ============================================
// SERVE FRONTEND (catch-all for SPA)
// ============================================
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../index.html'));
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('🛡️  ═══════════════════════════════════════');
  console.log('🛡️   CAMPUS SHIELD — Backend Running');
  console.log('🛡️  ═══════════════════════════════════════');
  console.log(`🚀 Server:     http://localhost:${PORT}`);
  console.log(`📡 API:        http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend:   http://localhost:${PORT}`);
  console.log(`🗄️  Database:   ${process.env.DB_NAME || 'campus_shield'}`);
  console.log('🛡️  ═══════════════════════════════════════');
  console.log('');
});