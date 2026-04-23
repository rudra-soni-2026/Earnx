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
  
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Optimized: Use select and lean for faster check
    let user = await User.findOne({ email: normalizedEmail }).select('_id').lean();
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Check if referred by someone
    let referrerId = null;
    let initialBalance = 0;
    
    if (referredBy) {
      // Optimized: Use findOneAndUpdate for atomic update if possible, or just lean lookup
      const referrer = await User.findOne({ referralCode: referredBy }).select('_id walletBalance');
      if (referrer) {
        referrerId = referrer._id;
        initialBalance = 50; 
        referrer.walletBalance += 100;
        await referrer.save();
      }
    }

    // Hash password before creating user object
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      email: normalizedEmail, 
      password: hashedPassword, 
      deviceId, 
      referralCode, 
      name: name || normalizedEmail.split('@')[0],
      walletBalance: initialBalance,
      referredBy: referrerId
    });

    await newUser.save();
    
    const token = createToken(newUser._id);
    res.status(201).json({ 
      token, 
      user: { 
        id: newUser._id, 
        email: newUser.email, 
        name: newUser.name, 
        walletBalance: newUser.walletBalance, 
        referralCode: newUser.referralCode 
      } 
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// @desc Login with Email/Password
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Optimized: Use select to get only necessary fields and lean() for speed
    const user = await User.findOne({ email: normalizedEmail })
      .select('password email name walletBalance referralCode')
      .lean();

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Bcrypt comparison is the main CPU bottleneck
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const token = createToken(user._id);
    
    // Return response immediately
    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        walletBalance: user.walletBalance, 
        referralCode: user.referralCode 
      } 
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ msg: 'Server error during login' });
  }
};

// @desc Google Login
exports.googleLogin = async (req, res) => {
  const { googleId, email, name, deviceId } = req.body;
  
  if (!email || !googleId) {
    return res.status(400).json({ msg: 'Missing Google credentials' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      user = new User({ 
        googleId, 
        email: normalizedEmail, 
        deviceId, 
        referralCode, 
        name: name || normalizedEmail.split('@')[0] 
      });
      await user.save();
    }

    const token = createToken(user._id);
    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        walletBalance: user.walletBalance, 
        referralCode: user.referralCode 
      } 
    });
  } catch (err) {
    console.error('Google Login Error:', err);
    return res.status(500).json({ msg: 'Server error during Google login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Daily Reset Logic for todayEarnings
    const now = new Date();
    const lastUpdate = new Date(user.updatedAt);
    
    // Check if day, month or year has changed
    const isNewDay = now.getDate() !== lastUpdate.getDate() || 
                     now.getMonth() !== lastUpdate.getMonth() || 
                     now.getFullYear() !== lastUpdate.getFullYear();

    if (isNewDay) {
      user.todayEarnings = 0;
      await user.save();
    }

    res.json(user);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
