const mongoose = require('mongoose');

const GameConfigSchema = new mongoose.Schema({
  gameKey: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  rewardPerGame: {
    type: Number,
    required: true
  },
  dailyLimit: {
    type: Number,
    required: true
  },
  minTimeSeconds: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('GameConfig', GameConfigSchema);
