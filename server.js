const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Performance Tracker (Scale Monitoring)
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// 1. Compression (High Performance)
app.use(compression({
  level: 6, // Balanced speed vs compression
  threshold: 256 // Don't compress very small files (saves CPU time)
}));

// 2. Security & Parsing
app.use(helmet());
app.use(cors());

// Body Parser with higher limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Security Sanitization
app.use(mongoSanitize());
app.use(hpp());

// Rate Limit (Slightly relaxed for performance)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2000, // limit each IP to 2000 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute'
});
app.use('/api/', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Route (To test latency without DB)
app.get('/api/health', (req, res) => {
  const duration = Date.now() - req.startTime;
  res.status(200).json({ 
    status: 'ok', 
    processTime: `${duration}ms`,
    time: new Date() 
  });
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/withdraw', require('./routes/withdrawalRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

const PORT = process.env.PORT || 5000;

// Start Server after DB Connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
};

startServer();
