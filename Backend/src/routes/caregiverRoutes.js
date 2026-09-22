const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only authenticated caregivers and administrators can access caregiver endpoints
router.use(protect);
router.use(authorize('caregiver', 'admin'));

router.get('/patients', caregiverController.getPatients);
router.get('/patients/:id/trends', caregiverController.getTrends);

module.exports = router;
