const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route    POST api/auth/register
// @desc     Register with Email/Password
router.post('/register', authController.register);

// @route    POST api/auth/login
// @desc     Login with Email/Password
router.post('/login', authController.login);

// @route    POST api/auth/google-login
// @desc     Login with Google
router.post('/google-login', authController.googleLogin);

const auth = require('../middleware/auth');

// @route    GET api/auth/me
// @desc     Get current user profile
router.get('/me', auth, authController.getMe);

module.exports = router;
