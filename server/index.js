require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API Routes
app.use('/api', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/student', require('./routes/students'));

// Base Health-Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Welcome to the Hyderabad Coders College Selection PDF Resource API',
    timestamp: new Date()
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server Error Handler:', err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`📡 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
