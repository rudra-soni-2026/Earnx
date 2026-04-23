const GameConfig = require('../models/GameConfig');
const GameSession = require('../models/GameSession');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

exports.getConfigs = async (req, res) => {
  try {
    const configs = await GameConfig.find({ isActive: true });
    res.json(configs);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.startGame = async (req, res) => {
  const { gameKey } = req.body;
  try {
    const session = new GameSession({
      userId: req.user.id,
      gameKey,
      startTime: new Date(),
      status: 'PENDING'
    });
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.endGame = async (req, res) => {
  const { sessionId } = req.body;
  try {
    let session = await GameSession.findById(sessionId);
    if (!session || session.userId.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    if (session.status !== 'PENDING') {
      return res.status(400).json({ msg: 'Session already processed' });
    }

    const config = await GameConfig.findOne({ gameKey: session.gameKey });
    const endTime = new Date();
    const timeTaken = (endTime - session.startTime) / 1000;

    // Anti-Cheat: Speed check
    if (timeTaken < config.minTimeSeconds) {
      session.status = 'REJECTED';
      session.reason = 'Completed too fast (Cheating suspected)';
      session.endTime = endTime;
      await session.save();
      return res.status(400).json({ msg: session.reason });
    }

    // Optimized: Update user and session in parallel
    await Promise.all([
      User.findByIdAndUpdate(req.user.id, {
        $inc: { walletBalance: config.rewardPerGame }
      }),
      session.save()
    ]);

    res.json({ msg: 'Reward added', reward: config.rewardPerGame });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
// @desc Update user wallet after game completion
exports.updateWallet = async (req, res) => {
  const { amount, action, gameKey } = req.body; // amount in coins

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Limit check for security (e.g., max 100 coins per game)
    const maxLimit = 100;
    if (amount > maxLimit) return res.status(400).json({ msg: 'Invalid amount' });

    user.walletBalance += amount;
    user.todayEarnings += amount;
    
    // Update scratch date if applicable
    if (gameKey === 'scratch_win') {
      user.lastScratchDate = new Date().toISOString().split('T')[0];
    }

    const transaction = new Transaction({
        userId: req.user.id,
        type: 'CREDIT',
        amount: amount,
        description: `Game Reward (${gameKey})`,
        gameKey: gameKey
    });

    const notification = new Notification({
        userId: req.user.id,
        title: 'Coins Credited! 💰',
        message: `You just earned ${amount} coins from ${gameKey}. Keep it up!`,
        type: 'TRANSACTION'
    });

    await Promise.all([
        user.save(),
        transaction.save(),
        notification.save()
    ]);

    res.json({ msg: 'Wallet updated!', newBalance: user.walletBalance, todayEarnings: user.todayEarnings, lastScratchDate: user.lastScratchDate });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc Claim Reward for watching a Quick Ad
exports.claimAdReward = async (req, res) => {
  try {
    const rewardAmount = 30; // 30 coins reward (matched with UI)
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.walletBalance += rewardAmount;
    user.todayEarnings += rewardAmount;

    // Optimized: Run database operations in parallel
    const transaction = new Transaction({
        userId: req.user.id,
        type: 'CREDIT',
        amount: rewardAmount,
        description: 'Quick Ad Reward',
        gameKey: 'ad_reward'
    });

    const notification = new Notification({
        userId: req.user.id,
        title: 'Ad Reward! 📺',
        message: `You earned ${rewardAmount} coins for watching a Quick Ad.`,
        type: 'TRANSACTION'
    });

    await Promise.all([
        user.save(),
        transaction.save(),
        notification.save()
    ]);

    res.json({ msg: 'Reward claimed!', reward: rewardAmount, newBalance: user.walletBalance });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc Get Transaction History
exports.getTransactions = async (req, res) => {
    try {
      const history = await Transaction.find({ userId: req.user.id })
        .sort({ date: -1 })
        .limit(50);
      res.json(history);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
};
