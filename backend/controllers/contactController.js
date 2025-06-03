const Contact = require('../models/Contact');
const { AppError } = require('../middleware/enhancedErrorMiddleware');
const { sendTemplateEmail } = require('../utils/email');
const logger = require('../utils/logger');

/**
 * @desc    Submit contact form
 * @route   POST /api/v1/contact
 * @access  Public
 */
exports.submitContact = async (req, res) => {
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

  // Create contact submission using lean operations for better performance
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

  res.status(201).json({
    success: true,
    data: {
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        service: contact.service,
        status: contact.status,
        submittedAt: contact.createdAt
      }
    },
    message: 'Contact form submitted successfully. We will get back to you within 24 hours.'
  });
};

/**
 * @desc    Get all contacts (Admin only)
 * @route   GET /api/v1/contact
 * @access  Private/Admin
 */
exports.getContacts = async (req, res) => {
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

  // Build query with performance optimization
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

  // Execute optimized query with pagination
  const [contacts, total] = await Contact.getContactsList(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    lean: true,
    select: 'name email phone company service budget status priority createdAt assignedTo followUpDate'
  });

  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalContacts: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    },
    message: 'Contacts retrieved successfully'
  });
};

/**
 * @desc    Get single contact (Admin only)
 * @route   GET /api/v1/contact/:id
 * @access  Private/Admin
 */
exports.getContact = async (req, res) => {
  const contact = await Contact.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('notes.addedBy', 'name email')
    .lean();

  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { contact },
    message: 'Contact retrieved successfully'
  });
};

/**
 * @desc    Update contact (Admin only)
 * @route   PATCH /api/v1/contact/:id
 * @access  Private/Admin
 */
exports.updateContact = async (req, res) => {
  const { status, priority, assignedTo, followUpDate, notes } = req.body;
  
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  // Update fields with optimized operations
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

  res.status(200).json({
    success: true,
    data: { contact },
    message: 'Contact updated successfully'
  });
};

/**
 * @desc    Delete contact (Admin only)
 * @route   DELETE /api/v1/contact/:id
 * @access  Private/Admin
 */
exports.deleteContact = async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  await Contact.findByIdAndDelete(req.params.id);

  logger.info('Contact deleted', {
    contactId: req.params.id,
    deletedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    data: null,
    message: 'Contact deleted successfully'
  });
};

/**
 * @desc    Get contact statistics (Admin only)
 * @route   GET /api/v1/contact/stats/overview
 * @access  Private/Admin
 */
exports.getContactStats = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Default to last 30 days if no date range provided
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  // Use optimized aggregation pipeline
  const stats = await Contact.aggregate([
    { $match: { isSpam: false } },
    {
      $facet: {
        totalContacts: [{ $count: 'count' }],
        newContacts: [
          { $match: { createdAt: { $gte: start, $lte: end } } },
          { $count: 'count' }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byService: [
          { $group: { _id: '$service', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        avgResponseTime: [
          { $match: { responseTime: { $exists: true, $ne: null } } },
          { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
        ],
        conversionRate: [
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
        ]
      }
    }
  ]);

  const facetData = stats[0];

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalContacts: facetData.totalContacts[0]?.count || 0,
        newContacts: facetData.newContacts[0]?.count || 0,
        averageResponseTime: facetData.avgResponseTime[0]?.avgResponseTime || 0,
        conversionRate: facetData.conversionRate[0] ? 
          Math.round((facetData.conversionRate[0].converted / facetData.conversionRate[0].total) * 100) : 0
      },
      breakdown: {
        byStatus: facetData.byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byService: facetData.byService.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: facetData.byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      dateRange: { start, end }
    },
    message: 'Contact statistics retrieved successfully'
  });
};

/**
 * @desc    Get high priority contacts (Admin only)
 * @route   GET /api/v1/contact/priority/high
 * @access  Private/Admin
 */
exports.getHighPriorityContacts = async (req, res) => {
  const contacts = await Contact.getHighPriority({
    lean: true,
    select: 'name email phone company service budget status priority createdAt assignedTo followUpDate'
  });
  
  res.status(200).json({
    success: true,
    data: { contacts },
    message: 'High priority contacts retrieved successfully'
  });
};

/**
 * @desc    Get contacts needing follow-up (Admin only)
 * @route   GET /api/v1/contact/follow-up/due
 * @access  Private/Admin
 */
exports.getFollowUpContacts = async (req, res) => {
  const contacts = await Contact.getNeedingFollowUp({
    lean: true,
    select: 'name email phone company service status priority followUpDate createdAt assignedTo'
  });
  
  res.status(200).json({
    success: true,
    data: { contacts },
    message: 'Contacts needing follow-up retrieved successfully'
  });
};
