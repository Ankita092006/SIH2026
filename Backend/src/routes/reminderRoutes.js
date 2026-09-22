const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

router.get('/', reminderController.getReminders);
router.post('/', reminderController.createReminder);
router.patch('/:id/toggle', reminderController.toggleReminder);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;
