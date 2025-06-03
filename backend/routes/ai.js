const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateAI } = require('../middleware/enhancedValidation');
const { asyncHandler } = require('../middleware/enhancedErrorMiddleware');
const {
  chat,
  automation,
  analysis,
  getStatus
} = require('../controllers/aiController');

// All AI routes require authentication
router.use(protect);

router.post('/chat', validateAI.chat, asyncHandler(chat));
router.post('/automation', validateAI.automation, asyncHandler(automation));
router.post('/analysis', validateAI.analysis, asyncHandler(analysis));
router.get('/status', asyncHandler(getStatus));

module.exports = router;
