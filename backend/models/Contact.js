const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      'Please provide a valid website URL'
    ]
  },
  service: {
    type: String,
    required: [true, 'Please specify the service you are interested in'],
    enum: [
      'AI Web Design',
      'Automation Solutions', 
      'AI Consulting',
      'Custom Development',
      'Integration Services',
      'Other'
    ]
  },
  budget: {
    type: String,
    enum: [
      'Under $5,000',
      '$5,000 - $15,000',
      '$15,000 - $50,000',
      '$50,000 - $100,000',
      'Over $100,000',
      'Let\'s discuss'
    ]
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    trim: true,
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  projectTimeline: {
    type: String,
    enum: [
      'ASAP',
      '1-3 months',
      '3-6 months',
      '6+ months',
      'Just exploring'
    ]
  },
  hearAboutUs: {
    type: String,
    enum: [
      'Google Search',
      'Social Media',
      'Referral',
      'Advertisement',
      'Event/Conference',
      'Other'
    ]
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'qualified', 'converted', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    default: 'website'
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  referrer: {
    type: String
  },
  utmSource: {
    type: String
  },
  utmMedium: {
    type: String
  },
  utmCampaign: {
    type: String
  },
  utmTerm: {
    type: String
  },
  utmContent: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot be more than 1000 characters']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpDate: {
    type: Date
  },
  lastContactedAt: {
    type: Date
  },
  responseTime: {
    type: Number // Time in minutes to first response
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  autoResponderSent: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: String
  },
  gdprConsent: {
    type: Boolean,
    default: false
  },
  marketingConsent: {
    type: Boolean,
    default: false
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  spamScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ service: 1 });
contactSchema.index({ budget: 1 });
contactSchema.index({ isSpam: 1 });

// Compound indexes
contactSchema.index({ status: 1, priority: 1 });
contactSchema.index({ createdAt: -1, status: 1 });

// Virtual for full contact info
contactSchema.virtual('fullContactInfo').get(function() {
  return {
    name: this.name,
    email: this.email,
    phone: this.phone,
    company: this.company
  };
});

// Virtual for project details
contactSchema.virtual('projectDetails').get(function() {
  return {
    service: this.service,
    budget: this.budget,
    timeline: this.projectTimeline,
    message: this.message
  };
});

// Virtual for response time in human readable format
contactSchema.virtual('responseTimeFormatted').get(function() {
  if (!this.responseTime) return null;
  
  const hours = Math.floor(this.responseTime / 60);
  const minutes = this.responseTime % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Pre-save middleware to calculate spam score
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    let spamScore = 0;
    
    // Check for spam indicators
    const spamKeywords = ['free', 'urgent', 'limited time', 'act now', 'guaranteed'];
    const messageText = this.message.toLowerCase();
    
    spamKeywords.forEach(keyword => {
      if (messageText.includes(keyword)) {
        spamScore += 10;
      }
    });
    
    // Check for suspicious patterns
    if (this.message.length < 20) spamScore += 15;
    if (this.message.includes('http://') || this.message.includes('https://')) spamScore += 20;
    if (!this.phone && !this.company) spamScore += 10;
    
    this.spamScore = Math.min(spamScore, 100);
    this.isSpam = spamScore >= 50;
  }
  
  next();
});

// Instance method to add note
contactSchema.methods.addNote = function(content, userId) {
  this.notes.push({
    content,
    addedBy: userId,
    addedAt: new Date()
  });
  return this.save();
};

// Instance method to update status
contactSchema.methods.updateStatus = function(newStatus, userId) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add automatic note about status change
  this.notes.push({
    content: `Status changed from ${oldStatus} to ${newStatus}`,
    addedBy: userId,
    addedAt: new Date()
  });
  
  return this.save();
};

// Instance method to assign contact
contactSchema.methods.assignTo = function(userId, assignedBy) {
  this.assignedTo = userId;
  
  this.notes.push({
    content: `Contact assigned to user ${userId}`,
    addedBy: assignedBy,
    addedAt: new Date()
  });
  
  return this.save();
};

// Static method to get contacts by status
contactSchema.statics.getByStatus = function(status) {
  return this.find({ status, isSpam: false })
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get high priority contacts
contactSchema.statics.getHighPriority = function() {
  return this.find({ 
    priority: { $in: ['high', 'urgent'] },
    status: { $in: ['new', 'contacted', 'in-progress'] },
    isSpam: false
  })
    .populate('assignedTo', 'name email')
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to get contacts needing follow-up
contactSchema.statics.getNeedingFollowUp = function() {
  return this.find({
    followUpDate: { $lte: new Date() },
    status: { $in: ['contacted', 'in-progress'] },
    isSpam: false
  })
    .populate('assignedTo', 'name email')
    .sort({ followUpDate: 1 });
};

// Static method to get analytics data
contactSchema.statics.getAnalytics = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        },
        isSpam: false
      }
    },
    {
      $group: {
        _id: null,
        totalContacts: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status',
            service: '$service',
            budget: '$budget'
          }
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Contact', contactSchema);
