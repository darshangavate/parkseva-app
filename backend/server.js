const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- MongoDB Connection + start server after connect ---
(async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI;
    if (!MONGO_URI) throw new Error('Missing MONGODB_URI in backend/.env');

    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB');

    // Import routes
    const authRoutes = require('./routes/auth');
    const parkingRoutes = require('./routes/parking');
    const bookingRoutes = require('./routes/bookings');

    // Basic Routes
    app.get('/', (_req, res) => {
      res.json({
        message: 'ParkSeva API is running!',
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    });

    // API Routes (mount BEFORE 404 handler)
    app.use('/api/auth', authRoutes);
    app.use('/api/parking', parkingRoutes);
    app.use('/api/bookings', bookingRoutes);

    // Health check
    app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      });
    });

    // 404 handler (keep after all routes)
    app.use((req, res) => {
      res.status(404).json({
        message: 'Route not found',
        availableRoutes: ['/', '/health', '/api/test', '/api/auth', '/api/parking', '/api/bookings'],
      });
    });

    // Error handler (last)
    app.use((error, _req, res, _next) => {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 ParkSeva Server is running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`⚡ Press Ctrl+C to stop the server`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
})();
