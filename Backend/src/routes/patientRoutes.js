const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, patientController.getProfile);
router.put('/profile', protect, patientController.updateProfile);

module.exports = router;
