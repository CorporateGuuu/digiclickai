import { NextRequest, NextResponse } from 'next/server';

// A/B Test Analytics Data Structure
interface ABTestEvent {
  event: string;
  testId: string;
  variant: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  url: string;
  userAgent: string;
  properties?: Record<string, any>;
}

// In-memory storage for development (replace with database in production)
const analyticsData: ABTestEvent[] = [];

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const now = Date.now();
    const rateLimit = rateLimitMap.get(clientIP);
    
    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= 100) { // 100 requests per minute
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        }
        rateLimit.count++;
      } else {
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + 60000 });
      }
    } else {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + 60000 });
    }

    // Parse request body
    const eventData: ABTestEvent = await request.json();

    // Validate required fields
    if (!eventData.event || !eventData.testId || !eventData.variant) {
      return NextResponse.json(
        { error: 'Missing required fields: event, testId, variant' },
        { status: 400 }
      );
    }

    // Sanitize and validate data
    const sanitizedEvent: ABTestEvent = {
      event: eventData.event.substring(0, 100),
      testId: eventData.testId.substring(0, 100),
      variant: eventData.variant.substring(0, 50),
      userId: eventData.userId?.substring(0, 100) || 'anonymous',
      sessionId: eventData.sessionId?.substring(0, 100) || 'unknown',
      timestamp: eventData.timestamp || new Date().toISOString(),
      url: eventData.url?.substring(0, 500) || '',
      userAgent: eventData.userAgent?.substring(0, 500) || '',
      properties: eventData.properties || {}
    };

    // Store event data (in production, save to database)
    analyticsData.push(sanitizedEvent);

    // Keep only last 10000 events in memory
    if (analyticsData.length > 10000) {
      analyticsData.splice(0, analyticsData.length - 10000);
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('A/B Test Event:', sanitizedEvent);
    }

    // Send to external analytics services
    await Promise.allSettled([
      sendToGoogleAnalytics(sanitizedEvent),
      sendToCustomAnalytics(sanitizedEvent)
    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('A/B Test analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const variant = searchParams.get('variant');
    const event = searchParams.get('event');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Filter data based on query parameters
    let filteredData = analyticsData;

    if (testId) {
      filteredData = filteredData.filter(item => item.testId === testId);
    }

    if (variant) {
      filteredData = filteredData.filter(item => item.variant === variant);
    }

    if (event) {
      filteredData = filteredData.filter(item => item.event === event);
    }

    // Limit results
    const results = filteredData.slice(-limit);

    // Generate summary statistics
    const summary = generateSummary(filteredData);

    return NextResponse.json({
      events: results,
      summary,
      total: filteredData.length
    });

  } catch (error) {
    console.error('A/B Test analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send event to Google Analytics 4
async function sendToGoogleAnalytics(event: ABTestEvent) {
  try {
    const measurementId = process.env.GOOGLE_ANALYTICS_ID;
    const apiSecret = process.env.GA4_API_SECRET;

    if (!measurementId || !apiSecret) {
      return; // Skip if not configured
    }

    const payload = {
      client_id: event.userId,
      events: [{
        name: 'ab_test_event',
        parameters: {
          test_id: event.testId,
          variant: event.variant,
          event_type: event.event,
          session_id: event.sessionId,
          custom_parameter_1: event.properties?.interaction_type || '',
          custom_parameter_2: event.properties?.element_type || '',
          custom_parameter_3: event.properties?.fps || '',
          value: event.properties?.value || 0
        }
      }]
    };

    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

  } catch (error) {
    console.warn('Failed to send to Google Analytics:', error);
  }
}

// Send to custom analytics service
async function sendToCustomAnalytics(event: ABTestEvent) {
  try {
    const analyticsEndpoint = process.env.CUSTOM_ANALYTICS_ENDPOINT;
    
    if (!analyticsEndpoint) {
      return; // Skip if not configured
    }

    await fetch(analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
      },
      body: JSON.stringify(event),
    });

  } catch (error) {
    console.warn('Failed to send to custom analytics:', error);
  }
}

// Generate summary statistics
function generateSummary(data: ABTestEvent[]) {
  const summary: Record<string, any> = {
    totalEvents: data.length,
    variants: {},
    events: {},
    timeRange: {
      start: null,
      end: null
    }
  };

  if (data.length === 0) {
    return summary;
  }

  // Sort by timestamp
  const sortedData = data.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  summary.timeRange.start = sortedData[0].timestamp;
  summary.timeRange.end = sortedData[sortedData.length - 1].timestamp;

  // Count by variant
  data.forEach(event => {
    if (!summary.variants[event.variant]) {
      summary.variants[event.variant] = {
        count: 0,
        events: {},
        users: new Set(),
        sessions: new Set()
      };
    }
    
    summary.variants[event.variant].count++;
    summary.variants[event.variant].users.add(event.userId);
    summary.variants[event.variant].sessions.add(event.sessionId);
    
    if (!summary.variants[event.variant].events[event.event]) {
      summary.variants[event.variant].events[event.event] = 0;
    }
    summary.variants[event.variant].events[event.event]++;
  });

  // Convert Sets to counts
  Object.keys(summary.variants).forEach(variant => {
    summary.variants[variant].uniqueUsers = summary.variants[variant].users.size;
    summary.variants[variant].uniqueSessions = summary.variants[variant].sessions.size;
    delete summary.variants[variant].users;
    delete summary.variants[variant].sessions;
  });

  // Count by event type
  data.forEach(event => {
    if (!summary.events[event.event]) {
      summary.events[event.event] = 0;
    }
    summary.events[event.event]++;
  });

  return summary;
}
