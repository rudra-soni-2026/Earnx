const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc Get all notifications for logged in user
exports.getNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    // Dynamic Daily Lalach
    const user = await User.findById(req.user.id);
    const today = new Date().toDateString();

    if (user && user.lastNotificationDate !== today) {
      const dailyLalach = {
        _id: 'daily_reward_promo',
        title: 'Hurry! 500 Coins Await 🎁',
        message: 'Don\'t miss out! Open the app today and complete tasks to claim your bonus coins.',
        type: 'PROMOTION',
        createdAt: new Date(),
        isRead: false
      };
      
      // Add to list and update user record
      notifications = [dailyLalach, ...notifications];
      user.lastNotificationDate = today;
      await user.save();
    }

    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc Mark notifications as read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ msg: 'Notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
