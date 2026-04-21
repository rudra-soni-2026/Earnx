const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  tasksDoneByNew: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Referral', ReferralSchema);
