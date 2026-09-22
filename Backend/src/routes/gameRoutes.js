const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const attemptController = require('../controllers/attemptController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.get('/', gameController.getGames);
router.post('/:gameId/sessions', optionalProtect, gameController.startSession);
router.post('/attempts', optionalProtect, attemptController.submitAttempt);

module.exports = router;
