const Task = require('../models/Task');
const User = require('../models/User');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true });
    res.json(tasks);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.completeTask = async (req, res) => {
  const { taskId } = req.body;
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // In a real app, you'd check if they actually did it (postback/manual verify)
    // For now, we add reward directly
    const user = await User.findById(req.user.id);
    user.walletBalance += task.reward;
    await user.save();

    res.json({ msg: 'Task completed', reward: task.reward });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
