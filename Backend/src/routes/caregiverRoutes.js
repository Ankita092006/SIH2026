const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');

router.get('/patients', caregiverController.getPatients);
router.get('/patients/:id/trends', caregiverController.getTrends);

module.exports = router;
