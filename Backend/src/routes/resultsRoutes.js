const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, resultsController.getResults);

module.exports = router;
