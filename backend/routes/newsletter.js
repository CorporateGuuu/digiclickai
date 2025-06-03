const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateNewsletter } = require('../middleware/enhancedValidation');
const { asyncHandler } = require('../middleware/enhancedErrorMiddleware');
const {
  subscribe,
  unsubscribe,
  getSubscriptions,
  getNewsletterStats,
  exportSubscriptions,
  deleteSubscription
} = require('../controllers/newsletterController');

// Public routes
router.post('/subscribe', validateNewsletter.subscribe, asyncHandler(subscribe));
router.post('/unsubscribe', validateNewsletter.unsubscribe, asyncHandler(unsubscribe));

// Protected routes (Admin only)
router.use(protect, authorize('admin'));

router
  .route('/')
  .get(asyncHandler(getSubscriptions));

router
  .route('/:id')
  .delete(asyncHandler(deleteSubscription));

router.get('/stats/overview', asyncHandler(getNewsletterStats));
router.get('/export', asyncHandler(exportSubscriptions));

module.exports = router;
