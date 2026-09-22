const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', reminderController.getReminders);
router.post('/', reminderController.createReminder);
router.patch('/:id/toggle', reminderController.toggleReminder);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;
