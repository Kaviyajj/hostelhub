const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

// Initialize dotenv configuration
dotenv.config();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Ensure upload folders exist on startup
const uploadDirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/images'),
  path.join(__dirname, '../uploads/pdfs'),
  path.join(__dirname, '../uploads/receipts')
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve uploaded static assets (Student Avatars, Notice Documents, Receipts)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const studentRoutes = require('./routes/studentRoutes');
const sharedRoutes = require('./routes/sharedRoutes');

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/shared', sharedRoutes);

// Health Check / Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to HostelHub API Service',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Database Connection & Server Boot
const startServer = async () => {
  try {
    // Authenticate DB connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database models (creates tables if they do not exist)
    await sequelize.sync();
    console.log('Database tables synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log(`Access backend directly: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
};

startServer();
