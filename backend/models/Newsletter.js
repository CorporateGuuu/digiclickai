const mongoose = require('mongoose');
const crypto = require('crypto');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'subscribed', 'unsubscribed', 'bounced', 'complained'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  verificationTokenExpires: {
    type: Date,
    select: false
  },
  verifiedAt: {
    type: Date
  },
  subscribedAt: {
    type: Date
  },
  unsubscribedAt: {
    type: Date
  },
  unsubscribeReason: {
    type: String,
    enum: [
      'too-frequent',
      'not-relevant',
      'never-signed-up',
      'technical-issues',
      'other'
    ]
  },
  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Subscription preferences
  preferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    topics: [{
      type: String,
      enum: [
        'ai-news',
        'automation-tips',
        'case-studies',
        'product-updates',
        'industry-insights',
        'tutorials',
        'events'
      ]
    }],
    format: {
      type: String,
      enum: ['html', 'text'],
      default: 'html'
    }
  },

  // Engagement tracking
  engagement: {
    totalEmailsSent: {
      type: Number,
      default: 0
    },
    totalOpens: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    lastOpenedAt: {
      type: Date
    },
    lastClickedAt: {
      type: Date
    },
    openRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    clickRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },

  // Subscriber information
  source: {
    type: String,
    enum: ['website', 'landing-page', 'social-media', 'referral', 'import', 'api'],
    default: 'website'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
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
  country: {
    type: String
  },
  city: {
    type: String
  },
  timezone: {
    type: String
  },

  // Segmentation
  tags: [{
    type: String,
    trim: true
  }],
  segments: [{
    type: String,
    enum: [
      'new-subscribers',
      'active-subscribers',
      'inactive-subscribers',
      'high-engagement',
      'low-engagement',
      'potential-customers',
      'existing-customers'
    ]
  }],
  customFields: {
    type: Map,
    of: String
  },

  // Email delivery tracking
  bounces: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['soft', 'hard']
    },
    reason: String,
    emailId: String
  }],
  complaints: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['spam', 'abuse', 'other']
    },
    emailId: String
  }],

  // GDPR compliance
  gdprConsent: {
    type: Boolean,
    default: false
  },
  gdprConsentDate: {
    type: Date
  },
  gdprConsentIP: {
    type: String
  },
  dataProcessingConsent: {
    type: Boolean,
    default: false
  },
  marketingConsent: {
    type: Boolean,
    default: true
  },

  // Double opt-in tracking
  doubleOptIn: {
    type: Boolean,
    default: true
  },
  confirmationEmailSent: {
    type: Boolean,
    default: false
  },
  confirmationEmailSentAt: {
    type: Date
  },

  // Automation flags
  welcomeEmailSent: {
    type: Boolean,
    default: false
  },
  welcomeEmailSentAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ isVerified: 1 });
newsletterSchema.index({ createdAt: -1 });
newsletterSchema.index({ tags: 1 });
newsletterSchema.index({ segments: 1 });
newsletterSchema.index({ 'preferences.topics': 1 });

// Compound indexes
newsletterSchema.index({ status: 1, isVerified: 1 });
newsletterSchema.index({ status: 1, isActive: 1 });

// Virtual for engagement score
newsletterSchema.virtual('engagementScore').get(function() {
  if (this.engagement.totalEmailsSent === 0) return 0;
  
  const openWeight = 0.6;
  const clickWeight = 0.4;
  
  return Math.round(
    (this.engagement.openRate * openWeight) + 
    (this.engagement.clickRate * clickWeight)
  );
});

// Virtual for subscriber status
newsletterSchema.virtual('subscriberStatus').get(function() {
  if (!this.isVerified) return 'unverified';
  if (this.status === 'unsubscribed') return 'unsubscribed';
  if (this.status === 'bounced') return 'bounced';
  if (this.status === 'complained') return 'complained';
  
  const daysSinceLastOpen = this.engagement.lastOpenedAt 
    ? Math.floor((Date.now() - this.engagement.lastOpenedAt) / (1000 * 60 * 60 * 24))
    : null;
  
  if (daysSinceLastOpen === null || daysSinceLastOpen > 90) return 'inactive';
  if (daysSinceLastOpen > 30) return 'low-activity';
  return 'active';
});

// Pre-save middleware to generate tokens
newsletterSchema.pre('save', function(next) {
  // Generate verification token for new subscribers
  if (this.isNew && !this.verificationToken) {
    this.verificationToken = crypto.randomBytes(32).toString('hex');
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  }
  
  // Generate unsubscribe token
  if (this.isNew && !this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }
  
  // Update engagement rates
  if (this.engagement.totalEmailsSent > 0) {
    this.engagement.openRate = Math.round(
      (this.engagement.totalOpens / this.engagement.totalEmailsSent) * 100
    );
    this.engagement.clickRate = Math.round(
      (this.engagement.totalClicks / this.engagement.totalEmailsSent) * 100
    );
  }
  
  next();
});

// Instance method to verify email
newsletterSchema.methods.verifyEmail = function() {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.status = 'subscribed';
  this.subscribedAt = new Date();
  this.verificationToken = undefined;
  this.verificationTokenExpires = undefined;
  
  return this.save();
};

// Instance method to unsubscribe
newsletterSchema.methods.unsubscribe = function(reason = 'other') {
  this.status = 'unsubscribed';
  this.unsubscribedAt = new Date();
  this.unsubscribeReason = reason;
  this.isActive = false;
  
  return this.save();
};

// Instance method to resubscribe
newsletterSchema.methods.resubscribe = function() {
  this.status = 'subscribed';
  this.subscribedAt = new Date();
  this.unsubscribedAt = undefined;
  this.unsubscribeReason = undefined;
  this.isActive = true;
  
  return this.save();
};

// Instance method to track email open
newsletterSchema.methods.trackOpen = function(emailId) {
  this.engagement.totalOpens += 1;
  this.engagement.lastOpenedAt = new Date();
  
  // Update engagement rate
  if (this.engagement.totalEmailsSent > 0) {
    this.engagement.openRate = Math.round(
      (this.engagement.totalOpens / this.engagement.totalEmailsSent) * 100
    );
  }
  
  return this.save();
};

// Instance method to track email click
newsletterSchema.methods.trackClick = function(emailId, url) {
  this.engagement.totalClicks += 1;
  this.engagement.lastClickedAt = new Date();
  
  // Update engagement rate
  if (this.engagement.totalEmailsSent > 0) {
    this.engagement.clickRate = Math.round(
      (this.engagement.totalClicks / this.engagement.totalEmailsSent) * 100
    );
  }
  
  return this.save();
};

// Instance method to record bounce
newsletterSchema.methods.recordBounce = function(type, reason, emailId) {
  this.bounces.push({
    type,
    reason,
    emailId,
    date: new Date()
  });
  
  // Mark as bounced if hard bounce or too many soft bounces
  if (type === 'hard' || this.bounces.filter(b => b.type === 'soft').length >= 3) {
    this.status = 'bounced';
    this.isActive = false;
  }
  
  return this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function(topics = []) {
  const query = {
    status: 'subscribed',
    isVerified: true,
    isActive: true
  };
  
  if (topics.length > 0) {
    query['preferences.topics'] = { $in: topics };
  }
  
  return this.find(query).sort({ subscribedAt: -1 });
};

// Static method to get subscribers by segment
newsletterSchema.statics.getBySegment = function(segment) {
  return this.find({
    segments: segment,
    status: 'subscribed',
    isVerified: true,
    isActive: true
  }).sort({ subscribedAt: -1 });
};

// Static method to get engagement analytics
newsletterSchema.statics.getEngagementAnalytics = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'subscribed'
      }
    },
    {
      $group: {
        _id: null,
        totalSubscribers: { $sum: 1 },
        averageOpenRate: { $avg: '$engagement.openRate' },
        averageClickRate: { $avg: '$engagement.clickRate' },
        totalOpens: { $sum: '$engagement.totalOpens' },
        totalClicks: { $sum: '$engagement.totalClicks' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Newsletter', newsletterSchema);
