const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameKey: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'REJECTED'],
    default: 'PENDING'
  },
  isRewardClaimed: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('GameSession', GameSessionSchema);
