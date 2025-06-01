/**
 * Page Views Analytics API Endpoint
 * Provides page view analytics data for the dashboard
 */

// Sample page views data - in production, this would come from a database
const generatePageViewsData = (userId) => {
  const pages = [
    { page: '/home', name: 'Home Page' },
    { page: '/about', name: 'About Us' },
    { page: '/services', name: 'Services' },
    { page: '/portfolio', name: 'Portfolio' },
    { page: '/pricing', name: 'Pricing' },
    { page: '/contact', name: 'Contact' },
    { page: '/demo', name: 'Demo' },
    { page: '/dashboard', name: 'Dashboard' }
  ];

  return pages.map(pageInfo => ({
    id: `page_${pageInfo.page.replace('/', '')}`,
    page: pageInfo.page,
    name: pageInfo.name,
    views: Math.floor(Math.random() * 200) + 50,
    uniqueViews: Math.floor(Math.random() * 150) + 30,
    avgTimeOnPage: Math.floor(Math.random() * 180) + 60, // seconds
    bounceRate: (Math.random() * 40 + 20).toFixed(1) + '%',
    conversionRate: (Math.random() * 10 + 2).toFixed(1) + '%',
    lastUpdated: new Date().toISOString()
  }));
};

// Generate time-series data for page views
const generateTimeSeriesData = (userId, days = 7) => {
  const currentDate = new Date();
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Simulate daily patterns (higher during business hours)
    const hour = date.getHours();
    const businessHourMultiplier = (hour >= 9 && hour <= 17) ? 1.5 : 0.8;
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.toISOString(),
      totalViews: Math.floor((Math.random() * 100 + 50) * businessHourMultiplier),
      uniqueViews: Math.floor((Math.random() * 80 + 30) * businessHourMultiplier),
      sessions: Math.floor((Math.random() * 60 + 20) * businessHourMultiplier),
      newUsers: Math.floor((Math.random() * 30 + 10) * businessHourMultiplier)
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
        return handleGetPageViews(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Page Views API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Handle GET request for page views analytics
 */
function handleGetPageViews(req, res) {
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
      type = 'pages',
      period = '7d',
      page = null
    } = req.query;

    let responseData;

    if (type === 'timeseries') {
      // Return time-series data for charts
      const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
      responseData = generateTimeSeriesData(userId, days);
    } else if (page) {
      // Return data for a specific page
      const allPages = generatePageViewsData(userId);
      responseData = allPages.find(p => p.page === page) || null;
      
      if (!responseData) {
        return res.status(404).json({
          success: false,
          error: 'Page not found',
          message: `No analytics data found for page: ${page}`
        });
      }
    } else {
      // Return all pages data
      responseData = generatePageViewsData(userId);
    }

    // Calculate summary statistics
    let summary = {};
    if (type !== 'timeseries' && Array.isArray(responseData)) {
      const totalViews = responseData.reduce((sum, item) => sum + item.views, 0);
      const totalUniqueViews = responseData.reduce((sum, item) => sum + item.uniqueViews, 0);
      const avgTimeOnPage = Math.round(
        responseData.reduce((sum, item) => sum + item.avgTimeOnPage, 0) / responseData.length
      );
      
      summary = {
        totalViews,
        totalUniqueViews,
        avgTimeOnPage: `${Math.floor(avgTimeOnPage / 60)}:${(avgTimeOnPage % 60).toString().padStart(2, '0')}`,
        totalPages: responseData.length,
        topPage: responseData.reduce((max, page) => page.views > max.views ? page : max, responseData[0])
      };
    } else if (type === 'timeseries') {
      const totalViews = responseData.reduce((sum, item) => sum + item.totalViews, 0);
      const totalSessions = responseData.reduce((sum, item) => sum + item.sessions, 0);
      const totalNewUsers = responseData.reduce((sum, item) => sum + item.newUsers, 0);
      
      summary = {
        totalViews,
        totalSessions,
        totalNewUsers,
        avgViewsPerDay: Math.round(totalViews / responseData.length),
        period,
        dataPoints: responseData.length
      };
    }

    return res.status(200).json({
      success: true,
      data: responseData,
      summary,
      type,
      period,
      message: `Retrieved ${type} analytics data for ${period}`
    });

  } catch (error) {
    console.error('Error fetching page views analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch page views analytics',
      message: error.message
    });
  }
}

/**
 * Get top performing pages
 */
export function getTopPages(userId, limit = 5) {
  const pages = generatePageViewsData(userId);
  return pages
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map(page => ({
      page: page.page,
      name: page.name,
      views: page.views,
      conversionRate: page.conversionRate
    }));
}

/**
 * Get page performance comparison
 */
export function getPageComparison(userId, pages) {
  const allPages = generatePageViewsData(userId);
  return pages.map(pagePath => {
    const pageData = allPages.find(p => p.page === pagePath);
    return pageData || {
      page: pagePath,
      name: pagePath,
      views: 0,
      uniqueViews: 0,
      avgTimeOnPage: 0,
      bounceRate: '0%',
      conversionRate: '0%'
    };
  });
}

/**
 * Get analytics summary for dashboard
 */
export function getAnalyticsSummary(userId) {
  const pages = generatePageViewsData(userId);
  const timeSeries = generateTimeSeriesData(userId, 7);
  
  const totalViews = pages.reduce((sum, page) => sum + page.views, 0);
  const totalSessions = timeSeries.reduce((sum, day) => sum + day.sessions, 0);
  const topPage = pages.reduce((max, page) => page.views > max.views ? page : max, pages[0]);
  
  return {
    totalViews,
    totalSessions,
    topPage: {
      name: topPage.name,
      views: topPage.views
    },
    weeklyTrend: timeSeries.map(day => ({
      date: day.date,
      views: day.totalViews
    }))
  };
}
