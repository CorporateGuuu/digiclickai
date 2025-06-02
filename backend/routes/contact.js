const express = require('express');
const { param } = require('express-validator');
const Contact = require('../models/Contact');
const { AppError, asyncHandler, createResponse } = require('../middleware/errorMiddleware');
const { protect, restrictTo, optionalAuth } = require('../middleware/authMiddleware');
const { contactValidations, validate } = require('../utils/validation');
const { sendTemplateEmail } = require('../utils/email');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
router.post('/', validate(contactValidations.create), asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    company,
    website,
    service,
    budget,
    message,
    projectTimeline,
    hearAboutUs,
    gdprConsent,
    marketingConsent
  } = req.body;

  // Extract tracking information
  const trackingData = {
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    referrer: req.get('Referer'),
    utmSource: req.query.utm_source,
    utmMedium: req.query.utm_medium,
    utmCampaign: req.query.utm_campaign,
    utmTerm: req.query.utm_term,
    utmContent: req.query.utm_content
  };

  // Create contact submission
  const contact = await Contact.create({
    name,
    email,
    phone,
    company,
    website,
    service,
    budget,
    message,
    projectTimeline,
    hearAboutUs,
    gdprConsent,
    marketingConsent,
    ...trackingData
  });

  // Send auto-response email to user
  try {
    await sendTemplateEmail('contactAutoResponse', email, {
      name,
      service,
      company: company || 'your organization'
    });
    
    contact.emailSent = true;
    contact.emailSentAt = new Date();
    await contact.save({ validateBeforeSave: false });
  } catch (error) {
    logger.error('Contact auto-response email failed:', error);
    // Don't fail the request if email fails
  }

  // Send notification email to admin (optional)
  try {
    if (process.env.ADMIN_EMAIL) {
      await sendTemplateEmail('contactNotification', process.env.ADMIN_EMAIL, {
        contact: {
          name,
          email,
          phone,
          company,
          service,
          budget,
          message,
          submittedAt: contact.createdAt
        }
      });
    }
  } catch (error) {
    logger.error('Contact notification email failed:', error);
    // Don't fail the request if admin notification fails
  }

  logger.info('Contact form submitted', {
    contactId: contact._id,
    email,
    service,
    company,
    ip: req.ip
  });

  res.status(201).json(createResponse(
    true,
    {
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        service: contact.service,
        status: contact.status,
        submittedAt: contact.createdAt
      }
    },
    'Contact form submitted successfully. We will get back to you within 24 hours.'
  ));
}));

// @desc    Get all contacts (Admin only)
// @route   GET /api/v1/contact
// @access  Private/Admin
router.get('/', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    service,
    assignedTo,
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { isSpam: false };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (service) query.service = service;
  if (assignedTo) query.assignedTo = assignedTo;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
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

  const [contacts, total] = await Promise.all([
    Contact.find(query)
      .populate('assignedTo', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Contact.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json(createResponse(
    true,
    {
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalContacts: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    },
    'Contacts retrieved successfully'
  ));
}));

// @desc    Get single contact (Admin only)
// @route   GET /api/v1/contact/:id
// @access  Private/Admin
router.get('/:id', protect, restrictTo('admin', 'moderator'), validate([
  param('id').isMongoId().withMessage('Invalid contact ID')
]), asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('notes.addedBy', 'name email');

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  res.status(200).json(createResponse(true, { contact }, 'Contact retrieved successfully'));
}));

// @desc    Update contact (Admin only)
// @route   PATCH /api/v1/contact/:id
// @access  Private/Admin
router.patch('/:id', protect, restrictTo('admin', 'moderator'), validate(contactValidations.update), asyncHandler(async (req, res, next) => {
  const { status, priority, assignedTo, followUpDate, notes } = req.body;
  
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  // Update fields
  if (status && status !== contact.status) {
    await contact.updateStatus(status, req.user._id);
  }

  if (priority) contact.priority = priority;
  if (followUpDate) contact.followUpDate = new Date(followUpDate);

  if (assignedTo && assignedTo !== contact.assignedTo?.toString()) {
    await contact.assignTo(assignedTo, req.user._id);
  }

  if (notes) {
    await contact.addNote(notes, req.user._id);
  }

  // Update response time if this is the first contact
  if (status === 'contacted' && !contact.lastContactedAt) {
    contact.lastContactedAt = new Date();
    contact.responseTime = Math.round((Date.now() - contact.createdAt) / (1000 * 60)); // in minutes
  }

  await contact.save();

  logger.info('Contact updated', {
    contactId: contact._id,
    updatedBy: req.user._id,
    changes: { status, priority, assignedTo, followUpDate }
  });

  res.status(200).json(createResponse(true, { contact }, 'Contact updated successfully'));
}));

// @desc    Delete contact (Admin only)
// @route   DELETE /api/v1/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, restrictTo('admin'), validate([
  param('id').isMongoId().withMessage('Invalid contact ID')
]), asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  await Contact.findByIdAndDelete(req.params.id);

  logger.info('Contact deleted', {
    contactId: req.params.id,
    deletedBy: req.user._id
  });

  res.status(200).json(createResponse(true, null, 'Contact deleted successfully'));
}));

// @desc    Get contact statistics (Admin only)
// @route   GET /api/v1/contact/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Default to last 30 days if no date range provided
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const [
    totalContacts,
    newContacts,
    contactsByStatus,
    contactsByService,
    contactsByPriority,
    averageResponseTime,
    conversionRate
  ] = await Promise.all([
    // Total contacts (excluding spam)
    Contact.countDocuments({ isSpam: false }),
    
    // New contacts in date range
    Contact.countDocuments({
      createdAt: { $gte: start, $lte: end },
      isSpam: false
    }),
    
    // Contacts by status
    Contact.aggregate([
      { $match: { isSpam: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // Contacts by service
    Contact.aggregate([
      { $match: { isSpam: false } },
      { $group: { _id: '$service', count: { $sum: 1 } } }
    ]),
    
    // Contacts by priority
    Contact.aggregate([
      { $match: { isSpam: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    
    // Average response time
    Contact.aggregate([
      { $match: { responseTime: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
    ]),
    
    // Conversion rate (qualified + converted / total)
    Contact.aggregate([
      { $match: { isSpam: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          converted: {
            $sum: {
              $cond: [
                { $in: ['$status', ['qualified', 'converted']] },
                1,
                0
              ]
            }
          }
        }
      }
    ])
  ]);

  const stats = {
    overview: {
      totalContacts,
      newContacts,
      averageResponseTime: averageResponseTime[0]?.avgResponseTime || 0,
      conversionRate: conversionRate[0] ? 
        Math.round((conversionRate[0].converted / conversionRate[0].total) * 100) : 0
    },
    breakdown: {
      byStatus: contactsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byService: contactsByService.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: contactsByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    },
    dateRange: { start, end }
  };

  res.status(200).json(createResponse(true, stats, 'Contact statistics retrieved successfully'));
}));

// @desc    Get high priority contacts (Admin only)
// @route   GET /api/v1/contact/priority/high
// @access  Private/Admin
router.get('/priority/high', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const highPriorityContacts = await Contact.getHighPriority();
  
  res.status(200).json(createResponse(
    true,
    { contacts: highPriorityContacts },
    'High priority contacts retrieved successfully'
  ));
}));

// @desc    Get contacts needing follow-up (Admin only)
// @route   GET /api/v1/contact/follow-up/due
// @access  Private/Admin
router.get('/follow-up/due', protect, restrictTo('admin', 'moderator'), asyncHandler(async (req, res) => {
  const contactsNeedingFollowUp = await Contact.getNeedingFollowUp();
  
  res.status(200).json(createResponse(
    true,
    { contacts: contactsNeedingFollowUp },
    'Contacts needing follow-up retrieved successfully'
  ));
}));

module.exports = router;
