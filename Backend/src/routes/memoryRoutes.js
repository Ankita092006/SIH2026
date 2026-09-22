const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', memoryController.getMemories);
router.post('/', memoryController.createMemory);
router.post('/generate-activity', memoryController.generateRecallActivity);

module.exports = router;
