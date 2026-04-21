const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// @route    GET api/tasks
// @desc     Get all active tasks
router.get('/', auth, taskController.getTasks);

// @route    POST api/tasks/complete
// @desc     Mark task as completed
router.post('/complete', auth, taskController.completeTask);

module.exports = router;
