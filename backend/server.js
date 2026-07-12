const express = require('express');
const cors = require('cors');
require('dotenv').config();

const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request log middleware (optional but highly useful for hackathons)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mounted Routes
app.use('/api/vehicles', vehicleRoutes);

// Base route config
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TransitOps Vehicle Registry API running successfully.'
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack || err.message);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message: message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
