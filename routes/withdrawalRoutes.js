const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const withdrawalController = require('../controllers/withdrawalController');

// @route    POST api/withdraw/request
// @desc     Submit withdrawal request
router.post('/request', auth, withdrawalController.requestWithdrawal);

// @route    GET api/withdraw/history
// @desc     Get user's withdrawal history
router.get('/history', auth, withdrawalController.getWithdrawalHistory);

module.exports = router;
