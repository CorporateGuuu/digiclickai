const express = require('express');
const Demo = require('../models/Demo');
const { AppError, asyncHandler, createResponse } = require('../middleware/errorMiddleware');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { demoValidations, validate } = require('../utils/validation');
const { sendTemplateEmail } = require('../utils/email');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Schedule a demo
// @route   POST /api/v1/demo
// @access  Public
router.post('/', validate(demoValidations.create), asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    company,
    jobTitle,
    companySize,
    preferredDate,
    preferredTime,
    timezone,
    duration,
    meetingType,
    serviceInterest,
    currentChallenges,
    goals,
    budget,
    timeline,
    decisionMaker
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

  // Check for scheduling conflicts (optional business logic)
  const scheduledDateTime = new Date(preferredDate);
  const [hours, minutes] = preferredTime.split(':');
  scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Check if the requested time slot is available
  const existingDemo = await Demo.findOne({
    preferredDate: {
      $gte: new Date(scheduledDateTime.getTime() - 30 * 60 * 1000), // 30 minutes before
      $lte: new Date(scheduledDateTime.getTime() + 30 * 60 * 1000)  // 30 minutes after
    },
    status: { $in: ['pending', 'confirmed'] }
  });

  if (existingDemo) {
    return next(new AppError('This time slot is not available. Please choose a different time.', 400));
  }

  // Create demo request
  const demo = await Demo.create({
    name,
    email,
    phone,
    company,
    jobTitle,
    companySize,
    preferredDate,
    preferredTime,
    timezone,
    duration: duration || 30,
    meetingType: meetingType || 'video-call',
    serviceInterest,
    currentChallenges,
    goals,
    budget,
    timeline,
    decisionMaker,
    ...trackingData
  });

  // Send confirmation email to user
  try {
    await sendTemplateEmail('demoConfirmation', email, {
      name,
      preferredDate,
      preferredTime,
      timezone,
      duration: demo.duration,
      meetingType: demo.meetingType,
      serviceInterest,
      meetingLink: demo.meetingLink,
      meetingId: demo.meetingId
    });
    
    demo.confirmationSent = true;
    demo.confirmationSentAt = new Date();
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
          preferredDate,
          preferredTime,
          timezone,
          serviceInterest,
          currentChallenges,
          submittedAt: demo.createdAt
        }
      });
    }
  } catch (error) {
    logger.error('Demo notification email failed:', error);
  }

  logger.info('Demo scheduled', {
    demoId: demo._id,
    email,
    company,
    preferredDate,
    preferredTime,
    ip: req.ip
  });

  res.status(201).json(createResponse(
    true,
    {
      demo: {
        id: demo._id,
        name: demo.name,
        email: demo.email,
        company: demo.company,
        preferredDate: demo.preferredDate,
        preferredTime: demo.preferredTime,
        timezone: demo.timezone,
        meetingType: demo.meetingType,
        meetingLink: demo.meetingLink,
        status: demo.status,
        scheduledAt: demo.createdAt
      }
    },
    'Demo scheduled successfully. You will receive a confirmation email shortly.'
  ));
}));

// @desc    Get all demos (Admin only)
// @route   GET /api/v1/demo
// @access  Private/Admin
router.get('/', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    assignedTo,
    startDate,
    endDate,
    search,
    sortBy = 'preferredDate',
    sortOrder = 'asc'
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ];
  }

  if (startDate || endDate) {
    query.preferredDate = {};
    if (startDate) query.preferredDate.$gte = new Date(startDate);
    if (endDate) query.preferredDate.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [demos, total] = await Promise.all([
    Demo.find(query)
      .populate('assignedTo', 'name email')
      .populate('conductedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Demo.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json(createResponse(
    true,
    {
      demos,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalDemos: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    },
    'Demos retrieved successfully'
  ));
}));

// @desc    Get single demo (Admin only)
// @route   GET /api/v1/demo/:id
// @access  Private/Admin
router.get('/:id', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res, next) => {
  const demo = await Demo.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('conductedBy', 'name email')
    .populate('notes.addedBy', 'name email');

  if (!demo) {
    return next(new AppError('Demo not found', 404));
  }

  res.status(200).json(createResponse(true, { demo }, 'Demo retrieved successfully'));
}));

// @desc    Update demo (Admin only)
// @route   PATCH /api/v1/demo/:id
// @access  Private/Admin
router.patch('/:id', protect, restrictTo('admin', 'moderator'), validate(demoValidations.update), asyncHandler(async (req, res, next) => {
  const demo = await Demo.findById(req.params.id);
  if (!demo) {
    return next(new AppError('Demo not found', 404));
  }

  const {
    status,
    assignedTo,
    demoRating,
    clientFeedback,
    nextSteps,
    followUpDate,
    conversionProbability
  } = req.body;

  // Update basic fields
  if (assignedTo) demo.assignedTo = assignedTo;
  if (demoRating) demo.demoRating = demoRating;
  if (clientFeedback) demo.clientFeedback = clientFeedback;
  if (nextSteps) demo.nextSteps = nextSteps;
  if (followUpDate) demo.followUpDate = new Date(followUpDate);
  if (conversionProbability !== undefined) demo.conversionProbability = conversionProbability;

  // Handle status changes
  if (status && status !== demo.status) {
    switch (status) {
      case 'confirmed':
        await demo.confirm(req.user._id);
        break;
      case 'completed':
        await demo.complete(req.user._id, {
          rating: demoRating,
          feedback: clientFeedback,
          nextSteps,
          followUpDate,
          conversionProbability
        });
        break;
      default:
        demo.status = status;
        demo.notes.push({
          content: `Status changed to ${status}`,
          addedBy: req.user._id,
          type: 'general'
        });
    }
  }

  await demo.save();

  logger.info('Demo updated', {
    demoId: demo._id,
    updatedBy: req.user._id,
    changes: { status, assignedTo, demoRating }
  });

  res.status(200).json(createResponse(true, { demo }, 'Demo updated successfully'));
}));

// @desc    Confirm demo
// @route   PATCH /api/v1/demo/:id/confirm
// @access  Private/Admin
router.patch('/:id/confirm', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res, next) => {
  const demo = await Demo.findById(req.params.id);
  if (!demo) {
    return next(new AppError('Demo not found', 404));
  }

  if (demo.status !== 'pending') {
    return next(new AppError('Demo can only be confirmed if it is pending', 400));
  }

  await demo.confirm(req.user._id);

  // Send confirmation email
  try {
    await sendTemplateEmail('demoConfirmed', demo.email, {
      name: demo.name,
      preferredDate: demo.preferredDate,
      preferredTime: demo.preferredTime,
      timezone: demo.timezone,
      meetingLink: demo.meetingLink
    });
  } catch (error) {
    logger.error('Demo confirmation email failed:', error);
  }

  logger.info('Demo confirmed', {
    demoId: demo._id,
    confirmedBy: req.user._id
  });

  res.status(200).json(createResponse(true, { demo }, 'Demo confirmed successfully'));
}));

// @desc    Reschedule demo
// @route   PATCH /api/v1/demo/:id/reschedule
// @access  Private/Admin
router.patch('/:id/reschedule', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res, next) => {
  const { newDate, newTime, reason } = req.body;

  if (!newDate || !newTime || !reason) {
    return next(new AppError('New date, time, and reason are required for rescheduling', 400));
  }

  const demo = await Demo.findById(req.params.id);
  if (!demo) {
    return next(new AppError('Demo not found', 404));
  }

  await demo.reschedule(new Date(newDate), newTime, reason, req.user._id);

  // Send reschedule notification
  try {
    await sendTemplateEmail('demoRescheduled', demo.email, {
      name: demo.name,
      oldDate: demo.rescheduledFrom.date,
      oldTime: demo.rescheduledFrom.time,
      newDate: demo.preferredDate,
      newTime: demo.preferredTime,
      reason: reason,
      meetingLink: demo.meetingLink
    });
  } catch (error) {
    logger.error('Demo reschedule email failed:', error);
  }

  logger.info('Demo rescheduled', {
    demoId: demo._id,
    rescheduledBy: req.user._id,
    reason
  });

  res.status(200).json(createResponse(true, { demo }, 'Demo rescheduled successfully'));
}));

// @desc    Cancel demo
// @route   PATCH /api/v1/demo/:id/cancel
// @access  Private/Admin
router.patch('/:id/cancel', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Cancellation reason is required', 400));
  }

  const demo = await Demo.findById(req.params.id);
  if (!demo) {
    return next(new AppError('Demo not found', 404));
  }

  await demo.cancel(reason, req.user._id);

  // Send cancellation notification
  try {
    await sendTemplateEmail('demoCancelled', demo.email, {
      name: demo.name,
      preferredDate: demo.preferredDate,
      preferredTime: demo.preferredTime,
      reason: reason
    });
  } catch (error) {
    logger.error('Demo cancellation email failed:', error);
  }

  logger.info('Demo cancelled', {
    demoId: demo._id,
    cancelledBy: req.user._id,
    reason
  });

  res.status(200).json(createResponse(true, { demo }, 'Demo cancelled successfully'));
}));

// @desc    Get upcoming demos (Admin only)
// @route   GET /api/v1/demo/upcoming/:days?
// @access  Private/Admin
router.get('/upcoming/:days?', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const days = parseInt(req.params.days) || 7;
  const upcomingDemos = await Demo.getUpcoming(days);
  
  res.status(200).json(createResponse(
    true,
    { demos: upcomingDemos, days },
    `Upcoming demos for next ${days} days retrieved successfully`
  ));
}));

// @desc    Get demos needing follow-up (Admin only)
// @route   GET /api/v1/demo/follow-up/due
// @access  Private/Admin
router.get('/follow-up/due', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const demosNeedingFollowUp = await Demo.getNeedingFollowUp();
  
  res.status(200).json(createResponse(
    true,
    { demos: demosNeedingFollowUp },
    'Demos needing follow-up retrieved successfully'
  ));
}));

// @desc    Get demo statistics (Admin only)
// @route   GET /api/v1/demo/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const [
    totalDemos,
    demosByStatus,
    averageRating,
    conversionStats
  ] = await Promise.all([
    Demo.countDocuments({
      createdAt: { $gte: start, $lte: end }
    }),
    
    Demo.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    Demo.aggregate([
      { $match: { demoRating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$demoRating' } } }
    ]),
    
    Demo.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: 1 },
          highConversion: {
            $sum: { $cond: [{ $gte: ['$conversionProbability', 70] }, 1, 0] }
          },
          avgConversionProbability: { $avg: '$conversionProbability' }
        }
      }
    ])
  ]);

  const stats = {
    overview: {
      totalDemos,
      averageRating: averageRating[0]?.avgRating || 0,
      conversionRate: conversionStats[0] ? 
        Math.round((conversionStats[0].highConversion / conversionStats[0].totalCompleted) * 100) : 0,
      averageConversionProbability: conversionStats[0]?.avgConversionProbability || 0
    },
    breakdown: {
      byStatus: demosByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    },
    dateRange: { start, end }
  };

  res.status(200).json(createResponse(true, stats, 'Demo statistics retrieved successfully'));
}));

module.exports = router;
