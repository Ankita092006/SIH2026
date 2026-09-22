const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const attemptController = require('../controllers/attemptController');

// All game endpoints support guest/patient interactions
router.get('/', gameController.getGames);
router.post('/:gameId/sessions', gameController.startSession);
router.post('/attempts', attemptController.submitAttempt);

module.exports = router;
