const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { AppError, asyncHandler, createResponse } = require('../middleware/errorMiddleware');
const { createSendToken, protect, authLimiter, logout } = require('../middleware/authMiddleware');
const { authValidations, validate } = require('../utils/validation');
const { sendTemplateEmail } = require('../utils/email');
const logger = require('../utils/logger');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', validate(authValidations.register), asyncHandler(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phone, company, gdprConsent } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.logSecurity('DUPLICATE_REGISTRATION_ATTEMPT', req.ip, { email });
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    phone,
    company,
    preferences: {
      newsletter: gdprConsent
    },
    gdprConsent,
    gdprConsentDate: new Date(),
    gdprConsentIP: req.ip,
    lastLoginIP: req.ip
  });

  // Generate email verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await sendTemplateEmail('emailVerification', user.email, {
      name: user.name,
      verificationToken
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    logger.error('Email verification sending failed:', error);
    return next(new AppError('There was an error sending the verification email. Please try again later.', 500));
  }

  logger.logAuth('REGISTER', user._id, req.ip, true, { email: user.email });

  // Send token
  createSendToken(user, 201, res, 'User registered successfully. Please check your email to verify your account.');
}));

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', validate(authValidations.login), asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by credentials (includes password checking and account locking)
    const user = await User.findByCredentials(email, password);
    
    // Update last login info
    user.lastLoginIP = req.ip;
    await user.save({ validateBeforeSave: false });

    logger.logAuth('LOGIN', user._id, req.ip, true, { email: user.email });

    // Send token
    createSendToken(user, 200, res, 'Logged in successfully');
  } catch (error) {
    logger.logAuth('LOGIN_FAILED', null, req.ip, false, { email, error: error.message });
    return next(new AppError(error.message, 401));
  }
}));

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Public
router.post('/logout', logout);

// @desc    Get current user profile
// @route   GET /api/v1/auth/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+apiUsage');
  
  res.status(200).json(createResponse(true, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      company: user.company,
      website: user.website,
      bio: user.bio,
      location: user.location,
      preferences: user.preferences,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      apiUsage: user.apiUsage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }, 'Profile retrieved successfully'));
}));

// @desc    Update user profile
// @route   PATCH /api/v1/auth/profile
// @access  Private
router.patch('/profile', protect, asyncHandler(async (req, res, next) => {
  // Fields that can be updated
  const allowedFields = ['name', 'phone', 'company', 'website', 'bio', 'location', 'preferences'];
  const updates = {};

  // Filter allowed fields
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    return next(new AppError('No valid fields provided for update', 400));
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });

  logger.info('User profile updated', { userId: user._id, updatedFields: Object.keys(updates) });

  res.status(200).json(createResponse(true, { user }, 'Profile updated successfully'));
}));

// @desc    Change password
// @route   PATCH /api/v1/auth/change-password
// @access  Private
router.patch('/change-password', protect, validate(authValidations.changePassword), asyncHandler(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.correctPassword(currentPassword, user.password))) {
    logger.logSecurity('INVALID_CURRENT_PASSWORD', req.ip, { userId: user._id });
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  logger.logAuth('PASSWORD_CHANGE', user._id, req.ip, true);

  // Send token
  createSendToken(user, 200, res, 'Password changed successfully');
}));

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
router.post('/forgot-password', validate(authValidations.forgotPassword), asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Get user by email
  const user = await User.findOne({ email, active: { $ne: false } });
  if (!user) {
    // Don't reveal if email exists or not
    return res.status(200).json(createResponse(true, null, 'If an account with that email exists, a password reset link has been sent.'));
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email
  try {
    await sendTemplateEmail('passwordReset', user.email, {
      name: user.name,
      resetToken,
      resetURL: `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`
    });

    logger.logAuth('PASSWORD_RESET_REQUESTED', user._id, req.ip, true);

    res.status(200).json(createResponse(true, null, 'Password reset link sent to your email'));
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Password reset email sending failed:', error);
    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
}));

// @desc    Reset password
// @route   PATCH /api/v1/auth/reset-password/:token
// @access  Public
router.patch('/reset-password/:token', validate(authValidations.resetPassword), asyncHandler(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  // Get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    logger.logSecurity('INVALID_RESET_TOKEN', req.ip, { token: req.params.token });
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Set new password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.logAuth('PASSWORD_RESET', user._id, req.ip, true);

  // Send token
  createSendToken(user, 200, res, 'Password reset successfully');
}));

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', asyncHandler(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    logger.logSecurity('INVALID_VERIFICATION_TOKEN', req.ip, { token: req.params.token });
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.logAuth('EMAIL_VERIFIED', user._id, req.ip, true);

  res.status(200).json(createResponse(true, null, 'Email verified successfully'));
}));

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
router.post('/resend-verification', protect, asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await sendTemplateEmail('emailVerification', user.email, {
      name: user.name,
      verificationToken
    });

    logger.logAuth('VERIFICATION_EMAIL_RESENT', user._id, req.ip, true);

    res.status(200).json(createResponse(true, null, 'Verification email sent successfully'));
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Verification email sending failed:', error);
    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
}));

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh
// @access  Private
router.post('/refresh', protect, asyncHandler(async (req, res) => {
  // User is already authenticated via protect middleware
  const user = req.user;

  logger.logAuth('TOKEN_REFRESH', user._id, req.ip, true);

  // Send new token
  createSendToken(user, 200, res, 'Token refreshed successfully');
}));

module.exports = router;
