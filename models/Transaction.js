const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String, // 'CREDIT' or 'DEBIT'
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  gameKey: {
    type: String
  },
  status: {
    type: String,
    default: 'COMPLETED'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Composite index for fast history retrieval
TransactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
