const Demo = require('../models/Demo');
const { AppError, ErrorCode, ErrorCategory } = require('../middleware/enhancedErrorMiddleware');
const { sendTemplateEmail } = require('../utils/email');
const logger = require('../utils/logger');

/**
 * @desc    Request demo
 * @route   POST /api/v1/demo
 * @access  Public
 */
exports.requestDemo = async (req, res) => {
  const {
    name,
    email,
    company,
    phone,
    jobTitle,
    companySize,
    industry,
    interests,
    preferredDate,
    preferredTime,
    timezone,
    message,
    gdprConsent
  } = req.body;

  // Extract tracking information
  const trackingData = {
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    referrer: req.get('Referer'),
    utmSource: req.query.utm_source,
    utmMedium: req.query.utm_medium,
    utmCampaign: req.query.utm_campaign
  };

  // Create demo request with optimized operations
  const demo = await Demo.create({
    name,
    email,
    company,
    phone,
    jobTitle,
    companySize,
    industry,
    interests,
    preferredDate: preferredDate ? new Date(preferredDate) : null,
    preferredTime,
    timezone,
    message,
    gdprConsent,
    ...trackingData
  });

  // Send confirmation email to user
  try {
    await sendTemplateEmail('demoConfirmation', email, {
      name,
      company,
      preferredDate: demo.preferredDate,
      preferredTime: demo.preferredTime
    });
    
    demo.emailSent = true;
    demo.emailSentAt = new Date();
    await demo.save({ validateBeforeSave: false });
  } catch (error) {
    logger.error('Demo confirmation email failed:', error);
    // Don't fail the request if email fails
  }

  // Send notification to admin
  try {
    if (process.env.ADMIN_EMAIL) {
      await sendTemplateEmail('demoNotification', process.env.ADMIN_EMAIL, {
        demo: {
          name,
          email,
          company,
          phone,
          jobTitle,
          companySize,
          industry,
          preferredDate: demo.preferredDate,
          preferredTime: demo.preferredTime,
          submittedAt: demo.createdAt
        }
      });
    }
  } catch (error) {
    logger.error('Demo notification email failed:', error);
  }

  logger.info('Demo request submitted', {
    demoId: demo._id,
    email,
    company,
    industry,
    ip: req.ip
  });

  res.status(201).json({
    success: true,
    data: {
      demo: {
        id: demo._id,
        name: demo.name,
        email: demo.email,
        company: demo.company,
        status: demo.status,
        preferredDate: demo.preferredDate,
        submittedAt: demo.createdAt
      }
    },
    message: 'Demo request submitted successfully. We will contact you within 24 hours to schedule your demo.'
  });
};

/**
 * @desc    Get all demo requests (Admin only)
 * @route   GET /api/v1/demo
 * @access  Private/Admin
 */
exports.getDemoRequests = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    industry,
    companySize,
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query with performance optimization
  const query = {};

  if (status) query.status = status;
  if (industry) query.industry = industry;
  if (companySize) query.companySize = companySize;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
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

  const [demos, total] = await Promise.all([
    Demo.find(query)
      .select('name email company phone jobTitle companySize industry status preferredDate createdAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Demo.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      demos,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalDemos: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    },
    message: 'Demo requests retrieved successfully'
  });
};

/**
 * @desc    Get single demo request (Admin only)
 * @route   GET /api/v1/demo/:id
 * @access  Private/Admin
 */
exports.getDemoRequest = async (req, res) => {
  const demo = await Demo.findById(req.params.id).lean();

  if (!demo) {
    throw new AppError(
      'Demo request not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  res.status(200).json({
    success: true,
    data: { demo },
    message: 'Demo request retrieved successfully'
  });
};

/**
 * @desc    Update demo request status (Admin only)
 * @route   PATCH /api/v1/demo/:id
 * @access  Private/Admin
 */
exports.updateDemoRequest = async (req, res) => {
  const { status, scheduledDate, scheduledTime, notes } = req.body;
  
  const demo = await Demo.findById(req.params.id);
  if (!demo) {
    throw new AppError(
      'Demo request not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  // Update fields
  if (status) demo.status = status;
  if (scheduledDate) demo.scheduledDate = new Date(scheduledDate);
  if (scheduledTime) demo.scheduledTime = scheduledTime;
  if (notes) demo.notes = notes;

  // Update status history
  if (status && status !== demo.status) {
    demo.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      notes
    });
  }

  await demo.save();

  // Send status update email if demo is scheduled
  if (status === 'scheduled' && scheduledDate && scheduledTime) {
    try {
      await sendTemplateEmail('demoScheduled', demo.email, {
        name: demo.name,
        company: demo.company,
        scheduledDate: demo.scheduledDate,
        scheduledTime: demo.scheduledTime
      });
    } catch (error) {
      logger.error('Demo scheduled email failed:', error);
    }
  }

  logger.info('Demo request updated', {
    demoId: demo._id,
    updatedBy: req.user._id,
    changes: { status, scheduledDate, scheduledTime }
  });

  res.status(200).json({
    success: true,
    data: { demo },
    message: 'Demo request updated successfully'
  });
};

/**
 * @desc    Delete demo request (Admin only)
 * @route   DELETE /api/v1/demo/:id
 * @access  Private/Admin
 */
exports.deleteDemoRequest = async (req, res) => {
  const demo = await Demo.findById(req.params.id);
  if (!demo) {
    throw new AppError(
      'Demo request not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  await Demo.findByIdAndDelete(req.params.id);

  logger.info('Demo request deleted', {
    demoId: req.params.id,
    deletedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    data: null,
    message: 'Demo request deleted successfully'
  });
};

/**
 * @desc    Get demo statistics (Admin only)
 * @route   GET /api/v1/demo/stats
 * @access  Private/Admin
 */
exports.getDemoStats = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Default to last 30 days if no date range provided
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  // Use optimized aggregation pipeline
  const stats = await Demo.aggregate([
    {
      $facet: {
        totalDemos: [{ $count: 'count' }],
        newDemos: [
          { $match: { createdAt: { $gte: start, $lte: end } } },
          { $count: 'count' }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byIndustry: [
          { $group: { _id: '$industry', count: { $sum: 1 } } }
        ],
        byCompanySize: [
          { $group: { _id: '$companySize', count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  const facetData = stats[0];

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalDemos: facetData.totalDemos[0]?.count || 0,
        newDemos: facetData.newDemos[0]?.count || 0
      },
      breakdown: {
        byStatus: facetData.byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byIndustry: facetData.byIndustry.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCompanySize: facetData.byCompanySize.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      dateRange: { start, end }
    },
    message: 'Demo statistics retrieved successfully'
  });
};
