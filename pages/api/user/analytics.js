/**
 * User Analytics API Endpoint
 * Provides analytics data for the user dashboard
 */

// Sample analytics data - in production, this would come from a database
const generateAnalyticsData = (userId) => {
  const currentDate = new Date();
  const data = [];
  
  // Generate last 7 days of demo analytics
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    data.push({
      id: `analytics_${i}`,
      demoTime: date.toISOString(),
      views: Math.floor(Math.random() * 50) + 10,
      clicks: Math.floor(Math.random() * 20) + 5,
      conversions: Math.floor(Math.random() * 5) + 1,
      date: date.toISOString().split('T')[0]
    });
  }
  
  return data;
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
        return handleGetAnalytics(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('User Analytics API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Handle GET request for user analytics
 */
function handleGetAnalytics(req, res) {
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
      period = '7d',
      type = 'demos'
    } = req.query;

    // Generate analytics data
    const analyticsData = generateAnalyticsData(userId);

    // Filter by period if needed
    let filteredData = analyticsData;
    if (period === '30d') {
      // Generate 30 days of data
      filteredData = generateExtendedAnalytics(userId, 30);
    } else if (period === '90d') {
      // Generate 90 days of data
      filteredData = generateExtendedAnalytics(userId, 90);
    }

    // Calculate summary statistics
    const totalViews = filteredData.reduce((sum, item) => sum + item.views, 0);
    const totalClicks = filteredData.reduce((sum, item) => sum + item.clicks, 0);
    const totalConversions = filteredData.reduce((sum, item) => sum + item.conversions, 0);
    const avgViews = Math.round(totalViews / filteredData.length);
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) + '%' : '0%';

    return res.status(200).json({
      success: true,
      data: filteredData,
      summary: {
        totalViews,
        totalClicks,
        totalConversions,
        avgViews,
        conversionRate,
        period,
        dataPoints: filteredData.length
      },
      message: `Retrieved analytics data for ${period}`
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
}

/**
 * Generate extended analytics data for longer periods
 */
function generateExtendedAnalytics(userId, days) {
  const currentDate = new Date();
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Simulate weekly patterns (higher on weekdays)
    const dayOfWeek = date.getDay();
    const weekdayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.2;
    
    data.push({
      id: `analytics_${i}`,
      demoTime: date.toISOString(),
      views: Math.floor((Math.random() * 50 + 10) * weekdayMultiplier),
      clicks: Math.floor((Math.random() * 20 + 5) * weekdayMultiplier),
      conversions: Math.floor((Math.random() * 5 + 1) * weekdayMultiplier),
      date: date.toISOString().split('T')[0]
    });
  }
  
  return data;
}

/**
 * Get analytics summary for a user
 */
export function getAnalyticsSummary(userId, period = '7d') {
  const data = period === '7d' ? 
    generateAnalyticsData(userId) : 
    generateExtendedAnalytics(userId, parseInt(period));

  const totalViews = data.reduce((sum, item) => sum + item.views, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0);

  return {
    totalViews,
    totalClicks,
    totalConversions,
    avgViews: Math.round(totalViews / data.length),
    conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) + '%' : '0%',
    period,
    dataPoints: data.length
  };
}
