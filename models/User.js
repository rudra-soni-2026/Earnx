const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  lastNotificationDate: {
    type: String,
    default: ""
  },
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    unique: true,
    sparse: true // Allows null/missing values to coexist with unique index
  },
  password: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  deviceId: {
    type: String,
    // required: true
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  todayEarnings: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    unique: true,
    required: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  fcmToken: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
