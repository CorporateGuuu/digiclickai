/**
 * User Stats API Endpoint
 * Provides user statistics for the dashboard
 */

// Sample user stats - in production, this would come from a database
const generateUserStats = (userId) => {
  return {
    totalDemos: Math.floor(Math.random() * 20) + 5,
    totalViews: Math.floor(Math.random() * 500) + 100,
    avgViews: Math.floor(Math.random() * 25) + 10,
    conversionRate: (Math.random() * 15 + 5).toFixed(1) + '%',
    accountCreated: '2024-01-15T10:30:00Z',
    lastLogin: new Date().toISOString(),
    plan: 'Pro AI',
    status: 'Active',
    demoScheduled: Math.floor(Math.random() * 5) + 2,
    demoCompleted: Math.floor(Math.random() * 15) + 3,
    demoCancelled: Math.floor(Math.random() * 3),
    monthlyViews: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      views: Math.floor(Math.random() * 100) + 20
    })),
    topPerformingDemos: [
      { name: 'AI Automation Demo', views: 156, conversionRate: '12.5%' },
      { name: 'Web Design Showcase', views: 134, conversionRate: '8.9%' },
      { name: 'Chatbot Integration', views: 98, conversionRate: '15.3%' }
    ]
  };
};

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetStats(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('User Stats API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Handle GET request for user stats
 */
function handleGetStats(req, res) {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Valid authentication token required'
      });
    }

    // In production, you would verify the JWT token here
    const token = authHeader.split(' ')[1];
    // const userId = verifyJWT(token);

    // For demo purposes, use a mock user ID
    const userId = 'demo_user_123';

    const { 
      include = 'all'
    } = req.query;

    // Generate user stats
    const userStats = generateUserStats(userId);

    // Filter stats based on include parameter
    let responseData = userStats;
    if (include !== 'all') {
      const includeFields = include.split(',');
      responseData = {};
      includeFields.forEach(field => {
        if (userStats[field] !== undefined) {
          responseData[field] = userStats[field];
        }
      });
    }

    // Add computed fields
    responseData.accountAge = calculateAccountAge(userStats.accountCreated);
    responseData.lastLoginFormatted = formatLastLogin(userStats.lastLogin);

    return res.status(200).json({
      success: true,
      data: responseData,
      message: 'User stats retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error.message
    });
  }
}

/**
 * Calculate account age in days
 */
function calculateAccountAge(createdDate) {
  const created = new Date(createdDate);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
}

/**
 * Format last login time
 */
function formatLastLogin(lastLoginDate) {
  const lastLogin = new Date(lastLoginDate);
  const now = new Date();
  const diffTime = Math.abs(now - lastLogin);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return lastLogin.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * Get user performance metrics
 */
export function getUserPerformanceMetrics(userId) {
  const stats = generateUserStats(userId);
  
  return {
    engagement: {
      totalViews: stats.totalViews,
      avgViews: stats.avgViews,
      conversionRate: stats.conversionRate
    },
    activity: {
      totalDemos: stats.totalDemos,
      demoScheduled: stats.demoScheduled,
      demoCompleted: stats.demoCompleted,
      demoCancelled: stats.demoCancelled
    },
    account: {
      plan: stats.plan,
      status: stats.status,
      accountAge: calculateAccountAge(stats.accountCreated),
      lastLogin: formatLastLogin(stats.lastLogin)
    }
  };
}

/**
 * Get user dashboard summary
 */
export function getDashboardSummary(userId) {
  const stats = generateUserStats(userId);
  
  return {
    quickStats: {
      totalDemos: stats.totalDemos,
      totalViews: stats.totalViews,
      avgViews: stats.avgViews,
      conversionRate: stats.conversionRate
    },
    recentActivity: stats.topPerformingDemos.slice(0, 3),
    accountInfo: {
      plan: stats.plan,
      status: stats.status,
      lastLogin: formatLastLogin(stats.lastLogin)
    }
  };
}
