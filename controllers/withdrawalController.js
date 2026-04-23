const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

exports.requestWithdrawal = async (req, res) => {
  const { amount, method, payoutId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.walletBalance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    const minAmt = 100; // Minimum 100 coins
    if (amount < minAmt) {
      return res.status(400).json({ msg: `Minimum withdrawal is ${minAmt} Coins` });
    }

    // optimized: Use Promise.all for parallel database operations
    const withdrawal = new Withdrawal({
      userId: req.user.id,
      amount,
      method,
      payoutId,
      status: 'PENDING'
    });

    const transaction = new Transaction({
        userId: req.user.id,
        type: 'DEBIT',
        amount: amount,
        description: `Withdrawal Request (${method})`,
        status: 'PENDING'
    });

    const notification = new Notification({
        userId: req.user.id,
        title: 'Withdrawal Pending ⏳',
        message: `Your request for ${amount} coins via ${method} is being processed. It usually takes 24-48 hours.`,
        type: 'TRANSACTION'
    });

    // Deduct balance from memory first, then save all
    user.walletBalance -= amount;

    await Promise.all([
        user.save(),
        withdrawal.save(),
        transaction.save(),
        notification.save()
    ]);

    res.json({ msg: 'Withdrawal request submitted', withdrawal, newBalance: user.walletBalance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  try {
    const history = await Withdrawal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
