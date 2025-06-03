const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
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
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  lastLoginIP: String,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  apiUsage: {
    requests: {
      type: Number,
      default: 0
    },
    lastReset: {
      type: Date,
      default: Date.now
    },
    limit: {
      type: Number,
      default: 1000 // Monthly API request limit
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ role: 1 });
userSchema.index({ active: 1 });
userSchema.index({ createdAt: -1 });

// Compound indexes for optimized queries
userSchema.index({ email: 1, active: 1 }); // For login queries
userSchema.index({ passwordResetToken: 1, passwordResetExpires: 1 }); // For password reset
userSchema.index({ emailVerificationToken: 1, emailVerificationExpires: 1 }); // For email verification
userSchema.index({ role: 1, active: 1 }); // For role-based queries
userSchema.index({ 'apiUsage.lastReset': 1 }); // For API usage tracking

// Text index for search
userSchema.index({
  name: 'text',
  email: 'text',
  company: 'text'
}, {
  weights: {
    name: 10,
    email: 8,
    company: 5
  }
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  // Hash password with cost of 12
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  // Set passwordChangedAt if this is not a new document
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  }

  next();
});

// Pre-save middleware to handle login attempts
userSchema.pre('save', function(next) {
  if (!this.isModified('loginAttempts') && !this.isModified('lockUntil')) {
    return next();
  }

  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1
      },
      $set: {
        loginAttempts: 1
      }
    }, next);
  }

  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1
      },
      $set: {
        loginAttempts: 1
      }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Static method to find by credentials (optimized)
userSchema.statics.findByCredentials = async function(email, password) {
  // Use lean for initial email check to improve performance
  const userExists = await this.findOne({ 
    email, 
    active: { $ne: false } 
  })
  .select('_id')
  .lean();

  if (!userExists) {
    throw new Error('Invalid login credentials');
  }

  // If user exists, get full user data with required fields only
  const user = await this.findById(userExists._id)
    .select('+password loginAttempts lockUntil lastLogin');
  
  // Check if account is locked
  if (user.isLocked) {
    await user.incLoginAttempts();
    throw new Error('Account temporarily locked due to too many failed login attempts');
  }

  const isMatch = await user.correctPassword(password, user.password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid login credentials');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login info (only necessary fields)
  user.lastLogin = new Date();
  user.lastLoginIP = user.lastLoginIP; // Preserve existing IP
  await user.save({ 
    validateBeforeSave: false,
    timestamps: false // Disable timestamps for this update
  });

  return user;
};

// Static method to get user profile (optimized with lean and projection)
userSchema.statics.getProfile = function(userId, options = {}) {
  const { lean = true, select } = options;
  
  let query = this.findById(userId);
  
  if (lean) {
    query = query.lean();
  }
  
  if (select) {
    query = query.select(select);
  } else if (lean) {
    // Default projection for profile
    query = query.select('name email role avatar phone company website bio location preferences isEmailVerified lastLogin apiUsage');
  }
  
  return query;
};

// Static method to get users list (optimized)
userSchema.statics.getUsersList = function(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    lean = true,
    select
  } = options;

  const query = { active: true, ...filters };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  let userQuery = this.find(query);
  
  if (lean) {
    userQuery = userQuery.lean();
  }
  
  if (select) {
    userQuery = userQuery.select(select);
  } else if (lean) {
    userQuery = userQuery.select('name email role company lastLogin createdAt');
  }

  return Promise.all([
    userQuery
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    this.countDocuments(query)
  ]);
};

module.exports = mongoose.model('User', userSchema);
