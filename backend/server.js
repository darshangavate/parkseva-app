const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parkseva')
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.log('❌ MongoDB connection error:', error);
});

// Import routes
const authRoutes = require('./routes/auth');

// Basic Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'ParkSeva API is running!', 
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working perfectly!' });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found', 
    availableRoutes: ['/', '/health', '/api/test'] 
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ParkSeva Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ Press Ctrl+C to stop the server`);
});