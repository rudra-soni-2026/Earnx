const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['UPI', 'PAYTM'],
    required: true
  },
  payoutId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUCCESS'],
    default: 'PENDING'
  },
  adminNote: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
