const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Helper to Create Token
const createToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register with Email/Password
exports.register = async (req, res) => {
  const { email, password, deviceId, name, referredBy } = req.body;
  try {
    // Optimized: Use lean() for faster lookup
    let user = await User.findOne({ email }).lean();
    if (user) return res.status(400).json({ msg: 'User already exists' });


    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Check if referred by someone
    let referrer = null;
    let initialBalance = 0;
    
    if (referredBy) {
      referrer = await User.findOne({ referralCode: referredBy });
      if (referrer) {
        initialBalance = 50; // New user gets 50 coins welcome bonus
        referrer.walletBalance += 100; // Referrer gets 100 coins
        await referrer.save();
      }
    }

    user = new User({ 
      email, 
      password, 
      deviceId, 
      referralCode, 
      name,
      walletBalance: initialBalance,
      referredBy: referrer ? referrer._id : null
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
 
    await user.save();
    const token = createToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, walletBalance: user.walletBalance, referralCode: user.referralCode } });
  } catch (err) {
    console.log(err)
    res.status(500).send('Server error');
  }
};

// @desc Login with Email/Password
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Optimized: Use lean() for faster lookup if we don't need to save later
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const token = createToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, walletBalance: user.walletBalance, referralCode: user.referralCode } });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

// @desc Google Login
exports.googleLogin = async (req, res) => {
  const { googleId, email, name, deviceId } = req.body;
  try {
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      await user.save();
    } else {
      const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      user = new User({ googleId, email, deviceId, referralCode, name });
      await user.save();
    }

    const token = createToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, walletBalance: user.walletBalance, referralCode: user.referralCode } });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// @desc Get Current User Profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    res.json(user);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
