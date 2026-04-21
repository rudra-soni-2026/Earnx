const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const gameController = require('../controllers/gameController');

// @route    GET api/games/configs
// @desc     Get all active game configurations
router.get('/configs', auth, gameController.getConfigs);

// @route    POST api/games/start
// @desc     Start a game session
router.post('/start', auth, gameController.startGame);

// @route    POST api/games/end
// @desc     End game and claim reward
router.post('/end', auth, gameController.endGame);

// @route    POST api/games/update-wallet
// @desc     Update user wallet after game completion
router.post('/update-wallet', auth, gameController.updateWallet);

// @route    GET api/games/transactions
// @desc     Get user transaction history
router.get('/transactions', auth, gameController.getTransactions);

// @route    POST api/games/claim-ad-reward
// @desc     Claim reward for watching ad
router.post('/claim-ad-reward', auth, gameController.claimAdReward);

module.exports = router;
