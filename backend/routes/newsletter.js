const express = require('express');
const crypto = require('crypto');
const Newsletter = require('../models/Newsletter');
const { AppError, asyncHandler, createResponse } = require('../middleware/errorMiddleware');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { newsletterValidations, validate } = require('../utils/validation');
const { sendTemplateEmail } = require('../utils/email');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Subscribe to newsletter
// @route   POST /api/v1/newsletter/subscribe
// @access  Public
router.post('/subscribe', validate(newsletterValidations.subscribe), asyncHandler(async (req, res, next) => {
  const {
    email,
    name,
    preferences = {},
    gdprConsent,
    marketingConsent = true
  } = req.body;

  // Check if email already exists
  const existingSubscriber = await Newsletter.findOne({ email });
  
  if (existingSubscriber) {
    if (existingSubscriber.status === 'subscribed' && existingSubscriber.isVerified) {
      return next(new AppError('This email is already subscribed to our newsletter', 400));
    }
    
    // If unsubscribed, allow resubscription
    if (existingSubscriber.status === 'unsubscribed') {
      await existingSubscriber.resubscribe();
      
      // Send welcome email
      try {
        await sendTemplateEmail('newsletterWelcome', email, {
          name: existingSubscriber.name || 'Subscriber',
          unsubscribeToken: existingSubscriber.unsubscribeToken
        });
        
        existingSubscriber.welcomeEmailSent = true;
        existingSubscriber.welcomeEmailSentAt = new Date();
        await existingSubscriber.save({ validateBeforeSave: false });
      } catch (error) {
        logger.error('Newsletter welcome email failed:', error);
      }

      logger.info('Newsletter resubscription', { email, ip: req.ip });
      
      return res.status(200).json(createResponse(
        true,
        { subscriber: { email, status: 'subscribed' } },
        'Successfully resubscribed to newsletter'
      ));
    }
  }

  // Extract tracking information
  const trackingData = {
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    referrer: req.get('Referer'),
    utmSource: req.query.utm_source,
    utmMedium: req.query.utm_medium,
    utmCampaign: req.query.utm_campaign
  };

  // Create new subscriber
  const subscriber = await Newsletter.create({
    email,
    name,
    preferences: {
      frequency: preferences.frequency || 'weekly',
      topics: preferences.topics || ['ai-news', 'automation-tips'],
      format: preferences.format || 'html'
    },
    gdprConsent,
    gdprConsentDate: new Date(),
    gdprConsentIP: req.ip,
    dataProcessingConsent: gdprConsent,
    marketingConsent,
    ...trackingData
  });

  // Send verification email if double opt-in is enabled
  if (subscriber.doubleOptIn) {
    try {
      await sendTemplateEmail('newsletterVerification', email, {
        name: subscriber.name || 'Subscriber',
        verificationToken: subscriber.verificationToken
      });
      
      subscriber.confirmationEmailSent = true;
      subscriber.confirmationEmailSentAt = new Date();
      await subscriber.save({ validateBeforeSave: false });
    } catch (error) {
      logger.error('Newsletter verification email failed:', error);
      return next(new AppError('There was an error sending the verification email. Please try again later.', 500));
    }
  } else {
    // Auto-verify if double opt-in is disabled
    await subscriber.verifyEmail();
    
    // Send welcome email
    try {
      await sendTemplateEmail('newsletterWelcome', email, {
        name: subscriber.name || 'Subscriber',
        unsubscribeToken: subscriber.unsubscribeToken
      });
      
      subscriber.welcomeEmailSent = true;
      subscriber.welcomeEmailSentAt = new Date();
      await subscriber.save({ validateBeforeSave: false });
    } catch (error) {
      logger.error('Newsletter welcome email failed:', error);
    }
  }

  logger.info('Newsletter subscription', {
    email,
    name,
    doubleOptIn: subscriber.doubleOptIn,
    ip: req.ip
  });

  const message = subscriber.doubleOptIn 
    ? 'Please check your email to confirm your subscription'
    : 'Successfully subscribed to newsletter';

  res.status(201).json(createResponse(
    true,
    {
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
        isVerified: subscriber.isVerified,
        preferences: subscriber.preferences
      }
    },
    message
  ));
}));

// @desc    Verify newsletter subscription
// @route   GET /api/v1/newsletter/verify
// @access  Public
router.get('/verify', validate(newsletterValidations.verify), asyncHandler(async (req, res, next) => {
  const { token } = req.query;

  // Get subscriber based on token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const subscriber = await Newsletter.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!subscriber) {
    logger.logSecurity('INVALID_NEWSLETTER_VERIFICATION_TOKEN', req.ip, { token });
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Verify subscription
  await subscriber.verifyEmail();

  // Send welcome email
  try {
    await sendTemplateEmail('newsletterWelcome', subscriber.email, {
      name: subscriber.name || 'Subscriber',
      unsubscribeToken: subscriber.unsubscribeToken
    });
    
    subscriber.welcomeEmailSent = true;
    subscriber.welcomeEmailSentAt = new Date();
    await subscriber.save({ validateBeforeSave: false });
  } catch (error) {
    logger.error('Newsletter welcome email failed:', error);
  }

  logger.info('Newsletter email verified', {
    email: subscriber.email,
    ip: req.ip
  });

  res.status(200).json(createResponse(
    true,
    null,
    'Email verified successfully. Welcome to our newsletter!'
  ));
}));

// @desc    Unsubscribe from newsletter
// @route   POST /api/v1/newsletter/unsubscribe
// @access  Public
router.post('/unsubscribe', validate(newsletterValidations.unsubscribe), asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const { reason = 'other' } = req.body;

  const subscriber = await Newsletter.findOne({ unsubscribeToken: token });

  if (!subscriber) {
    logger.logSecurity('INVALID_UNSUBSCRIBE_TOKEN', req.ip, { token });
    return next(new AppError('Invalid unsubscribe token', 400));
  }

  if (subscriber.status === 'unsubscribed') {
    return res.status(200).json(createResponse(
      true,
      null,
      'You are already unsubscribed from our newsletter'
    ));
  }

  await subscriber.unsubscribe(reason);

  logger.info('Newsletter unsubscription', {
    email: subscriber.email,
    reason,
    ip: req.ip
  });

  res.status(200).json(createResponse(
    true,
    null,
    'Successfully unsubscribed from newsletter. We\'re sorry to see you go!'
  ));
}));

// @desc    Update newsletter preferences
// @route   PATCH /api/v1/newsletter/preferences
// @access  Public
router.patch('/preferences', asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const { preferences } = req.body;

  if (!token) {
    return next(new AppError('Token is required', 400));
  }

  const subscriber = await Newsletter.findOne({ unsubscribeToken: token });

  if (!subscriber) {
    return next(new AppError('Invalid token', 400));
  }

  if (subscriber.status !== 'subscribed') {
    return next(new AppError('Subscription is not active', 400));
  }

  // Update preferences
  if (preferences.frequency) {
    subscriber.preferences.frequency = preferences.frequency;
  }
  if (preferences.topics) {
    subscriber.preferences.topics = preferences.topics;
  }
  if (preferences.format) {
    subscriber.preferences.format = preferences.format;
  }

  await subscriber.save();

  logger.info('Newsletter preferences updated', {
    email: subscriber.email,
    preferences,
    ip: req.ip
  });

  res.status(200).json(createResponse(
    true,
    { preferences: subscriber.preferences },
    'Preferences updated successfully'
  ));
}));

// @desc    Get all newsletter subscribers (Admin only)
// @route   GET /api/v1/newsletter/subscribers
// @access  Private/Admin
router.get('/subscribers', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    status,
    segment,
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (segment) query.segments = segment;

  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [subscribers, total] = await Promise.all([
    Newsletter.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Newsletter.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json(createResponse(
    true,
    {
      subscribers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalSubscribers: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    },
    'Newsletter subscribers retrieved successfully'
  ));
}));

// @desc    Get newsletter statistics (Admin only)
// @route   GET /api/v1/newsletter/stats
// @access  Private/Admin
router.get('/stats', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const [
    totalSubscribers,
    newSubscribers,
    subscribersByStatus,
    engagementStats,
    topicPreferences
  ] = await Promise.all([
    Newsletter.countDocuments({ status: 'subscribed', isVerified: true }),
    
    Newsletter.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'subscribed'
    }),
    
    Newsletter.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    Newsletter.getEngagementAnalytics(start, end),
    
    Newsletter.aggregate([
      { $match: { status: 'subscribed' } },
      { $unwind: '$preferences.topics' },
      { $group: { _id: '$preferences.topics', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  const stats = {
    overview: {
      totalSubscribers,
      newSubscribers,
      engagementStats: engagementStats[0] || {
        totalSubscribers: 0,
        averageOpenRate: 0,
        averageClickRate: 0
      }
    },
    breakdown: {
      byStatus: subscribersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topicPreferences: topicPreferences.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    },
    dateRange: { start, end }
  };

  res.status(200).json(createResponse(true, stats, 'Newsletter statistics retrieved successfully'));
}));

// @desc    Track email open
// @route   GET /api/v1/newsletter/track/open/:subscriberId/:emailId
// @access  Public
router.get('/track/open/:subscriberId/:emailId', asyncHandler(async (req, res) => {
  const { subscriberId, emailId } = req.params;

  try {
    const subscriber = await Newsletter.findById(subscriberId);
    if (subscriber) {
      await subscriber.trackOpen(emailId);
    }
  } catch (error) {
    logger.error('Email open tracking failed:', error);
  }

  // Return 1x1 transparent pixel
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.set('Content-Type', 'image/gif');
  res.set('Content-Length', pixel.length);
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(pixel);
}));

// @desc    Track email click
// @route   GET /api/v1/newsletter/track/click/:subscriberId/:emailId
// @access  Public
router.get('/track/click/:subscriberId/:emailId', asyncHandler(async (req, res) => {
  const { subscriberId, emailId } = req.params;
  const { url } = req.query;

  try {
    const subscriber = await Newsletter.findById(subscriberId);
    if (subscriber) {
      await subscriber.trackClick(emailId, url);
    }
  } catch (error) {
    logger.error('Email click tracking failed:', error);
  }

  // Redirect to the actual URL
  if (url) {
    res.redirect(url);
  } else {
    res.redirect(process.env.FRONTEND_URL || 'https://digiclick.ai');
  }
}));

module.exports = router;
