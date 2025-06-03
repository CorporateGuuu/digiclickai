const Newsletter = require('../models/Newsletter');
const { AppError, ErrorCode, ErrorCategory } = require('../middleware/enhancedErrorMiddleware');
const { sendTemplateEmail } = require('../utils/email');
const logger = require('../utils/logger');

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/v1/newsletter
 * @access  Public
 */
exports.subscribe = async (req, res) => {
  const { email, name, interests, gdprConsent } = req.body;

  // Check if email already exists
  const existingSubscription = await Newsletter.findOne({ email }).lean();
  if (existingSubscription) {
    if (existingSubscription.status === 'active') {
      throw new AppError(
        'Email is already subscribed to our newsletter',
        400,
        ErrorCode.DB_DUPLICATE_KEY,
        ErrorCategory.VALIDATION
      );
    } else {
      // Reactivate subscription
      await Newsletter.findByIdAndUpdate(existingSubscription._id, {
        status: 'active',
        name: name || existingSubscription.name,
        interests: interests || existingSubscription.interests,
        gdprConsent,
        resubscribedAt: new Date()
      });

      logger.info('Newsletter subscription reactivated', {
        email,
        subscriptionId: existingSubscription._id
      });

      return res.status(200).json({
        success: true,
        data: { email, status: 'reactivated' },
        message: 'Newsletter subscription reactivated successfully'
      });
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

  // Create new subscription
  const subscription = await Newsletter.create({
    email,
    name,
    interests,
    gdprConsent,
    ...trackingData
  });

  // Send welcome email
  try {
    await sendTemplateEmail('newsletterWelcome', email, {
      name: name || 'Subscriber',
      interests
    });
    
    subscription.emailSent = true;
    subscription.emailSentAt = new Date();
    await subscription.save({ validateBeforeSave: false });
  } catch (error) {
    logger.error('Newsletter welcome email failed:', error);
    // Don't fail the request if email fails
  }

  logger.info('Newsletter subscription created', {
    email,
    subscriptionId: subscription._id,
    interests,
    ip: req.ip
  });

  res.status(201).json({
    success: true,
    data: {
      subscription: {
        id: subscription._id,
        email: subscription.email,
        name: subscription.name,
        status: subscription.status,
        subscribedAt: subscription.createdAt
      }
    },
    message: 'Newsletter subscription successful. Welcome email sent!'
  });
};

/**
 * @desc    Unsubscribe from newsletter
 * @route   POST /api/v1/newsletter/unsubscribe
 * @access  Public
 */
exports.unsubscribe = async (req, res) => {
  const { email, token } = req.body;

  let subscription;

  if (token) {
    // Unsubscribe using token (from email link)
    subscription = await Newsletter.findOne({ unsubscribeToken: token });
  } else if (email) {
    // Unsubscribe using email
    subscription = await Newsletter.findOne({ email });
  } else {
    throw new AppError(
      'Email or unsubscribe token is required',
      400,
      ErrorCode.MISSING_REQUIRED_FIELD,
      ErrorCategory.VALIDATION
    );
  }

  if (!subscription) {
    throw new AppError(
      'Subscription not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  if (subscription.status === 'unsubscribed') {
    return res.status(200).json({
      success: true,
      data: { email: subscription.email, status: 'already_unsubscribed' },
      message: 'Email is already unsubscribed'
    });
  }

  // Update subscription status
  subscription.status = 'unsubscribed';
  subscription.unsubscribedAt = new Date();
  await subscription.save();

  logger.info('Newsletter unsubscription', {
    email: subscription.email,
    subscriptionId: subscription._id,
    method: token ? 'token' : 'email'
  });

  res.status(200).json({
    success: true,
    data: { email: subscription.email, status: 'unsubscribed' },
    message: 'Successfully unsubscribed from newsletter'
  });
};

/**
 * @desc    Get all newsletter subscriptions (Admin only)
 * @route   GET /api/v1/newsletter
 * @access  Private/Admin
 */
exports.getSubscriptions = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    interests,
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (interests) query.interests = { $in: interests.split(',') };

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

  // Execute optimized query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [subscriptions, total] = await Promise.all([
    Newsletter.find(query)
      .select('email name interests status createdAt unsubscribedAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Newsletter.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalSubscriptions: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    },
    message: 'Newsletter subscriptions retrieved successfully'
  });
};

/**
 * @desc    Get newsletter statistics (Admin only)
 * @route   GET /api/v1/newsletter/stats
 * @access  Private/Admin
 */
exports.getNewsletterStats = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Default to last 30 days if no date range provided
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  // Use optimized aggregation pipeline
  const stats = await Newsletter.aggregate([
    {
      $facet: {
        totalSubscriptions: [{ $count: 'count' }],
        activeSubscriptions: [
          { $match: { status: 'active' } },
          { $count: 'count' }
        ],
        newSubscriptions: [
          { $match: { createdAt: { $gte: start, $lte: end } } },
          { $count: 'count' }
        ],
        unsubscriptions: [
          { 
            $match: { 
              status: 'unsubscribed',
              unsubscribedAt: { $gte: start, $lte: end }
            }
          },
          { $count: 'count' }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byInterests: [
          { $unwind: '$interests' },
          { $group: { _id: '$interests', count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  const facetData = stats[0];

  const totalSubs = facetData.totalSubscriptions[0]?.count || 0;
  const activeSubs = facetData.activeSubscriptions[0]?.count || 0;
  const newSubs = facetData.newSubscriptions[0]?.count || 0;
  const unsubscriptions = facetData.unsubscriptions[0]?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalSubscriptions: totalSubs,
        activeSubscriptions: activeSubs,
        newSubscriptions: newSubs,
        unsubscriptions: unsubscriptions,
        retentionRate: totalSubs > 0 ? Math.round((activeSubs / totalSubs) * 100) : 0,
        growthRate: newSubs > unsubscriptions ? ((newSubs - unsubscriptions) / Math.max(activeSubs - newSubs, 1)) * 100 : 0
      },
      breakdown: {
        byStatus: facetData.byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byInterests: facetData.byInterests.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      dateRange: { start, end }
    },
    message: 'Newsletter statistics retrieved successfully'
  });
};

/**
 * @desc    Export newsletter subscriptions (Admin only)
 * @route   GET /api/v1/newsletter/export
 * @access  Private/Admin
 */
exports.exportSubscriptions = async (req, res) => {
  const { status = 'active', format = 'json' } = req.query;

  const query = { status };
  const subscriptions = await Newsletter.find(query)
    .select('email name interests createdAt')
    .sort({ createdAt: -1 })
    .lean();

  if (format === 'csv') {
    // Convert to CSV format
    const csvHeader = 'Email,Name,Interests,Subscribed Date\n';
    const csvData = subscriptions.map(sub => 
      `${sub.email},"${sub.name || ''}","${sub.interests?.join(';') || ''}",${sub.createdAt.toISOString()}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=newsletter-subscriptions-${status}-${Date.now()}.csv`);
    res.send(csvHeader + csvData);
  } else {
    // Return JSON format
    res.status(200).json({
      success: true,
      data: {
        subscriptions,
        total: subscriptions.length,
        exportedAt: new Date().toISOString(),
        status
      },
      message: 'Newsletter subscriptions exported successfully'
    });
  }

  logger.info('Newsletter subscriptions exported', {
    count: subscriptions.length,
    status,
    format,
    exportedBy: req.user._id
  });
};

/**
 * @desc    Delete newsletter subscription (Admin only)
 * @route   DELETE /api/v1/newsletter/:id
 * @access  Private/Admin
 */
exports.deleteSubscription = async (req, res) => {
  const subscription = await Newsletter.findById(req.params.id);
  if (!subscription) {
    throw new AppError(
      'Subscription not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  await Newsletter.findByIdAndDelete(req.params.id);

  logger.info('Newsletter subscription deleted', {
    subscriptionId: req.params.id,
    email: subscription.email,
    deletedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    data: null,
    message: 'Newsletter subscription deleted successfully'
  });
};
