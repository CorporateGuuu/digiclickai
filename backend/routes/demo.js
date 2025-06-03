const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateDemo } = require('../middleware/enhancedValidation');
const { asyncHandler } = require('../middleware/enhancedErrorMiddleware');
const {
  requestDemo,
  getDemoRequests,
  getDemoRequest,
  updateDemoRequest,
  deleteDemoRequest,
  getDemoStats
} = require('../controllers/demoController');

// Public routes
router.post('/', validateDemo.request, asyncHandler(requestDemo));

// Protected routes (Admin only)
router.use(protect, authorize('admin'));

router
  .route('/')
  .get(asyncHandler(getDemoRequests));

router
  .route('/:id')
  .get(asyncHandler(getDemoRequest))
  .patch(validateDemo.update, asyncHandler(updateDemoRequest))
  .delete(asyncHandler(deleteDemoRequest));

router.get('/stats/overview', asyncHandler(getDemoStats));

module.exports = router;
