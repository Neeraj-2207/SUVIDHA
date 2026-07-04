// app.js - Register the auth routes

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// IMPORT ROUTES
// ─────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const billRoutes = require('./routes/bill.routes');
const complaintRoutes = require('./routes/complaint.routes');
const adminRoutes     = require('./routes/admin.routes');   
const aiRoutes = require('./routes/ai.routes'); 
const ocrRoutes = require('./routes/ocr.routes');
const serviceRoutes = require('./routes/service.routes');
const documentRoutes = require('./routes/document.routes');

// ─────────────────────────────────────────
// REGISTER ROUTES
// All auth routes are prefixed with /api/auth
// So /register becomes /api/auth/register
// ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);  
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin',      adminRoutes);  
app.use('/api/ai', aiRoutes); 
app.use('/api/ocr',ocrRoutes);
app.use('/api/services', serviceRoutes);  
app.use('/api/documents', documentRoutes);

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1
    ? 'connected'
    : 'disconnected';

  res.status(200).json({
    success: true,
    message: 'SUVIDHA Server is running!',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────
// 404 HANDLER
// Catches any route that doesn't exist
// Must be AFTER all routes
// ─────────────────────────────────────────
app.use('/{*path}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;