const User = require('../models/User');
const { AppError, ErrorCode, ErrorCategory } = require('../middleware/enhancedErrorMiddleware');
const logger = require('../utils/logger');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  // Check if user already exists using optimized query
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new AppError(
      'User with this email already exists',
      400,
      ErrorCode.DB_DUPLICATE_KEY,
      ErrorCategory.VALIDATION
    );
  }

  // Create user with optimized operations
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Generate JWT token
  const token = user.generateAuthToken();

  logger.info('User registered successfully', {
    userId: user._id,
    email: user.email,
    role: user.role
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    },
    message: 'User registered successfully'
  });
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email, active: true }).select('+password');
  
  if (!user) {
    throw new AppError(
      'Invalid email or password',
      401,
      ErrorCode.INVALID_CREDENTIALS,
      ErrorCategory.AUTHENTICATION
    );
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError(
      'Invalid email or password',
      401,
      ErrorCode.INVALID_CREDENTIALS,
      ErrorCategory.AUTHENTICATION
    );
  }

  // Update last login with optimized operation
  await User.findByIdAndUpdate(user._id, { 
    lastLogin: new Date(),
    $inc: { loginCount: 1 }
  }, { lean: true });

  // Generate JWT token
  const token = user.generateAuthToken();

  logger.info('User logged in successfully', {
    userId: user._id,
    email: user.email,
    ip: req.ip
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: new Date()
      },
      token
    },
    message: 'Login successful'
  });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  // Use optimized lean query for better performance
  const user = await User.getProfile(req.user._id);

  if (!user) {
    throw new AppError(
      'User not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  res.status(200).json({
    success: true,
    data: { user },
    message: 'Profile retrieved successfully'
  });
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new AppError(
      'User not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  // Update basic info
  if (name) user.name = name;
  
  // Handle email update with duplicate check
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } }).lean();
    if (existingUser) {
      throw new AppError(
        'Email already in use',
        400,
        ErrorCode.DB_DUPLICATE_KEY,
        ErrorCategory.VALIDATION
      );
    }
    user.email = email;
  }

  // Handle password update
  if (newPassword) {
    if (!currentPassword) {
      throw new AppError(
        'Current password is required to set new password',
        400,
        ErrorCode.MISSING_REQUIRED_FIELD,
        ErrorCategory.VALIDATION
      );
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError(
        'Current password is incorrect',
        400,
        ErrorCode.INVALID_CREDENTIALS,
        ErrorCategory.AUTHENTICATION
      );
    }

    user.password = newPassword;
  }

  await user.save();

  logger.info('User profile updated', {
    userId: user._id,
    email: user.email,
    updatedFields: { name: !!name, email: !!email, password: !!newPassword }
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    },
    message: 'Profile updated successfully'
  });
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the logout event for security monitoring
  
  logger.info('User logged out', {
    userId: req.user._id,
    email: req.user.email,
    ip: req.ip
  });

  res.status(200).json({
    success: true,
    data: null,
    message: 'Logout successful'
  });
};

/**
 * @desc    Refresh JWT token
 * @route   POST /api/v1/auth/refresh
 * @access  Private
 */
exports.refreshToken = async (req, res) => {
  // Get user with optimized query
  const user = await User.findById(req.user._id).lean();
  
  if (!user || !user.active) {
    throw new AppError(
      'User not found or inactive',
      401,
      ErrorCode.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION
    );
  }

  // Generate new token
  const token = User.generateAuthToken(user);

  logger.info('Token refreshed', {
    userId: user._id,
    email: user.email
  });

  res.status(200).json({
    success: true,
    data: { token },
    message: 'Token refreshed successfully'
  });
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/auth/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    active,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  if (role) query.role = role;
  if (active !== undefined) query.active = active === 'true';

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute optimized query with pagination
  const [users, total] = await User.getUsersList(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    lean: true,
    select: 'name email role active createdAt lastLogin loginCount'
  });

  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    },
    message: 'Users retrieved successfully'
  });
};

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/v1/auth/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, lean: true, select: 'name email role updatedAt' }
  );

  if (!user) {
    throw new AppError(
      'User not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  logger.info('User role updated', {
    userId: id,
    newRole: role,
    updatedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    data: { user },
    message: 'User role updated successfully'
  });
};

/**
 * @desc    Deactivate user (Admin only)
 * @route   PATCH /api/v1/auth/users/:id/deactivate
 * @access  Private/Admin
 */
exports.deactivateUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { active: false },
    { new: true, lean: true, select: 'name email active updatedAt' }
  );

  if (!user) {
    throw new AppError(
      'User not found',
      404,
      ErrorCode.DB_DOCUMENT_NOT_FOUND,
      ErrorCategory.DATABASE
    );
  }

  logger.info('User deactivated', {
    userId: id,
    deactivatedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    data: { user },
    message: 'User deactivated successfully'
  });
};
