const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateAuth } = require('../middleware/enhancedValidation');
const { asyncHandler } = require('../middleware/enhancedErrorMiddleware');
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  refreshToken,
  getUsers,
  updateUserRole,
  deactivateUser
} = require('../controllers/authController');

// Public routes
router.post('/register', validateAuth.register, asyncHandler(register));
router.post('/login', validateAuth.login, asyncHandler(login));

// Protected routes
router.use(protect);

router.get('/profile', asyncHandler(getProfile));
router.patch('/profile', validateAuth.updateProfile, asyncHandler(updateProfile));
router.post('/logout', asyncHandler(logout));
router.post('/refresh', asyncHandler(refreshToken));

// Admin only routes
router.use(authorize('admin'));

router.get('/users', asyncHandler(getUsers));
router.patch('/users/:id/role', validateAuth.updateRole, asyncHandler(updateUserRole));
router.patch('/users/:id/deactivate', asyncHandler(deactivateUser));

module.exports = router;
