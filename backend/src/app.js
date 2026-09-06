const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

const bookRoutes = require('./routes/books');
const borrowerRoutes = require('./routes/borrowers');
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const exportRoutes = require('./routes/export');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

const app = express();

// Initialize database on startup
getDatabase();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'LibraHub Library Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/books', bookRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Catch-all 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' not found.`
  });
});

// In production (e.g. Docker or single-server deployment), serve built frontend
const path = require('node:path');
const fs = require('node:fs');
const publicPath = path.join(__dirname, '../public');
const distPath = path.join(__dirname, '../../frontend/dist');
const staticPath = fs.existsSync(publicPath) ? publicPath : (fs.existsSync(distPath) ? distPath : null);

if (staticPath) {
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(staticPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use(errorHandler);

module.exports = app;
