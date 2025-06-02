const mongoose = require('mongoose');

const demoSchema = new mongoose.Schema({
  // Contact Information
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
  jobTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  companySize: {
    type: String,
    enum: [
      '1-10 employees',
      '11-50 employees', 
      '51-200 employees',
      '201-1000 employees',
      '1000+ employees'
    ]
  },

  // Demo Scheduling
  preferredDate: {
    type: Date,
    required: [true, 'Please provide your preferred demo date']
  },
  preferredTime: {
    type: String,
    required: [true, 'Please provide your preferred demo time'],
    enum: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ]
  },
  timezone: {
    type: String,
    required: [true, 'Please provide your timezone'],
    default: 'UTC'
  },
  duration: {
    type: Number,
    enum: [30, 45, 60],
    default: 30 // minutes
  },
  meetingType: {
    type: String,
    enum: ['video-call', 'phone-call', 'in-person'],
    default: 'video-call'
  },

  // Demo Details
  serviceInterest: {
    type: [String],
    required: [true, 'Please specify which services you are interested in'],
    enum: [
      'AI Web Design',
      'Automation Solutions',
      'AI Consulting', 
      'Custom Development',
      'Integration Services',
      'Other'
    ]
  },
  currentChallenges: {
    type: String,
    required: [true, 'Please describe your current challenges'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  goals: {
    type: String,
    trim: true,
    maxlength: [1000, 'Goals description cannot be more than 1000 characters']
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
  timeline: {
    type: String,
    enum: [
      'ASAP',
      '1-3 months',
      '3-6 months', 
      '6+ months',
      'Just exploring'
    ]
  },
  decisionMaker: {
    type: String,
    enum: ['yes', 'no', 'partial'],
    required: [true, 'Please specify if you are the decision maker']
  },

  // Demo Status & Management
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'pending'
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  confirmationSentAt: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  actualDuration: {
    type: Number // in minutes
  },
  
  // Assignment & Follow-up
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  meetingLink: {
    type: String,
    trim: true
  },
  meetingId: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },

  // Demo Outcome
  attendees: [{
    name: String,
    email: String,
    role: String
  }],
  demoRating: {
    type: Number,
    min: 1,
    max: 5
  },
  clientFeedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot be more than 2000 characters']
  },
  nextSteps: {
    type: String,
    maxlength: [1000, 'Next steps cannot be more than 1000 characters']
  },
  followUpDate: {
    type: Date
  },
  proposalSent: {
    type: Boolean,
    default: false
  },
  proposalSentAt: {
    type: Date
  },
  conversionProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },

  // Technical Details
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

  // Notes & Communication
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
    },
    type: {
      type: String,
      enum: ['general', 'technical', 'follow-up', 'outcome'],
      default: 'general'
    }
  }],

  // Cancellation/Rescheduling
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot be more than 500 characters']
  },
  rescheduledFrom: {
    date: Date,
    time: String,
    reason: String
  },
  rescheduledTo: {
    date: Date,
    time: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
demoSchema.index({ email: 1 });
demoSchema.index({ status: 1 });
demoSchema.index({ preferredDate: 1 });
demoSchema.index({ assignedTo: 1 });
demoSchema.index({ createdAt: -1 });
demoSchema.index({ serviceInterest: 1 });

// Compound indexes
demoSchema.index({ status: 1, preferredDate: 1 });
demoSchema.index({ assignedTo: 1, status: 1 });

// Virtual for scheduled datetime
demoSchema.virtual('scheduledDateTime').get(function() {
  if (!this.preferredDate || !this.preferredTime) return null;
  
  const date = new Date(this.preferredDate);
  const [hours, minutes] = this.preferredTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return date;
});

// Virtual for demo duration formatted
demoSchema.virtual('durationFormatted').get(function() {
  if (this.actualDuration) {
    const hours = Math.floor(this.actualDuration / 60);
    const minutes = this.actualDuration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  return `${this.duration}m (scheduled)`;
});

// Virtual for contact info
demoSchema.virtual('contactInfo').get(function() {
  return {
    name: this.name,
    email: this.email,
    phone: this.phone,
    company: this.company,
    jobTitle: this.jobTitle
  };
});

// Pre-save middleware to set default meeting link for video calls
demoSchema.pre('save', function(next) {
  if (this.isNew && this.meetingType === 'video-call' && !this.meetingLink) {
    // Generate a unique meeting room ID
    this.meetingId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.meetingLink = `https://meet.digiclick.ai/room/${this.meetingId}`;
  }
  next();
});

// Instance method to confirm demo
demoSchema.methods.confirm = function(userId) {
  this.status = 'confirmed';
  this.confirmationSent = true;
  this.confirmationSentAt = new Date();
  
  this.notes.push({
    content: 'Demo confirmed',
    addedBy: userId,
    addedAt: new Date(),
    type: 'general'
  });
  
  return this.save();
};

// Instance method to complete demo
demoSchema.methods.complete = function(userId, outcome = {}) {
  this.status = 'completed';
  this.actualEndTime = new Date();
  
  if (this.actualStartTime) {
    this.actualDuration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  
  if (outcome.rating) this.demoRating = outcome.rating;
  if (outcome.feedback) this.clientFeedback = outcome.feedback;
  if (outcome.nextSteps) this.nextSteps = outcome.nextSteps;
  if (outcome.followUpDate) this.followUpDate = outcome.followUpDate;
  if (outcome.conversionProbability) this.conversionProbability = outcome.conversionProbability;
  
  this.notes.push({
    content: 'Demo completed',
    addedBy: userId,
    addedAt: new Date(),
    type: 'outcome'
  });
  
  return this.save();
};

// Instance method to reschedule demo
demoSchema.methods.reschedule = function(newDate, newTime, reason, userId) {
  this.rescheduledFrom = {
    date: this.preferredDate,
    time: this.preferredTime,
    reason: reason
  };
  
  this.preferredDate = newDate;
  this.preferredTime = newTime;
  this.status = 'rescheduled';
  
  this.notes.push({
    content: `Demo rescheduled: ${reason}`,
    addedBy: userId,
    addedAt: new Date(),
    type: 'general'
  });
  
  return this.save();
};

// Instance method to cancel demo
demoSchema.methods.cancel = function(reason, userId) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  
  this.notes.push({
    content: `Demo cancelled: ${reason}`,
    addedBy: userId,
    addedAt: new Date(),
    type: 'general'
  });
  
  return this.save();
};

// Static method to get upcoming demos
demoSchema.statics.getUpcoming = function(days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    preferredDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['pending', 'confirmed'] }
  })
    .populate('assignedTo', 'name email')
    .sort({ preferredDate: 1, preferredTime: 1 });
};

// Static method to get demos needing follow-up
demoSchema.statics.getNeedingFollowUp = function() {
  return this.find({
    status: 'completed',
    followUpDate: { $lte: new Date() },
    proposalSent: false
  })
    .populate('assignedTo', 'name email')
    .sort({ followUpDate: 1 });
};

module.exports = mongoose.model('Demo', demoSchema);
