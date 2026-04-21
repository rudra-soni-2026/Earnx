const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/withdraw', require('./routes/withdrawalRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
