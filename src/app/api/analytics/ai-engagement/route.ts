import { NextRequest, NextResponse } from 'next/server';

interface AIEngagementEvent {
  userId: string;
  sessionId: string;
  timestamp: string;
  featureName: string;
  action: string;
  properties?: Record<string, any>;
  url: string;
  userAgent: string;
}

// In-memory storage for development
const aiEngagementEvents: AIEngagementEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const eventData: AIEngagementEvent = await request.json();

    // Validate required fields
    if (!eventData.featureName || !eventData.action) {
      return NextResponse.json(
        { error: 'Missing required fields: featureName, action' },
        { status: 400 }
      );
    }

    // Sanitize and store event
    const sanitizedEvent: AIEngagementEvent = {
      userId: eventData.userId?.substring(0, 100) || 'anonymous',
      sessionId: eventData.sessionId?.substring(0, 100) || 'unknown',
      timestamp: eventData.timestamp || new Date().toISOString(),
      featureName: eventData.featureName.substring(0, 100),
      action: eventData.action.substring(0, 100),
      properties: eventData.properties || {},
      url: eventData.url?.substring(0, 500) || '/',
      userAgent: eventData.userAgent?.substring(0, 500) || ''
    };

    aiEngagementEvents.push(sanitizedEvent);

    // Keep only last 10000 events
    if (aiEngagementEvents.length > 10000) {
      aiEngagementEvents.splice(0, aiEngagementEvents.length - 10000);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('AI Engagement analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featureName = searchParams.get('featureName');
    const action = searchParams.get('action');
    const timeframe = searchParams.get('timeframe') || '24h';

    let filteredEvents = aiEngagementEvents;
    const now = new Date();
    const timeframeMs = timeframe === '24h' ? 86400000 : 
                       timeframe === '7d' ? 604800000 : 
                       timeframe === '30d' ? 2592000000 : 86400000;

    // Filter by timeframe
    filteredEvents = filteredEvents.filter(event => 
      new Date(event.timestamp).getTime() > now.getTime() - timeframeMs
    );

    // Apply additional filters
    if (featureName) {
      filteredEvents = filteredEvents.filter(event => event.featureName === featureName);
    }
    if (action) {
      filteredEvents = filteredEvents.filter(event => event.action === action);
    }

    // Generate summary statistics
    const summary = generateSummary(filteredEvents);

    return NextResponse.json({
      events: filteredEvents.slice(-100),
      summary,
      total: filteredEvents.length
    });

  } catch (error) {
    console.error('AI Engagement analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSummary(events: AIEngagementEvent[]) {
  const summary: Record<string, any> = {
    totalEvents: events.length,
    features: {},
    actions: {},
    timeRange: {
      start: null,
      end: null
    }
  };

  if (events.length === 0) {
    return summary;
  }

  // Sort by timestamp
  const sortedEvents = events.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  summary.timeRange.start = sortedEvents[0].timestamp;
  summary.timeRange.end = sortedEvents[sortedEvents.length - 1].timestamp;

  // Count by feature and action
  events.forEach(event => {
    if (!summary.features[event.featureName]) {
      summary.features[event.featureName] = 0;
    }
    summary.features[event.featureName]++;

    if (!summary.actions[event.action]) {
      summary.actions[event.action] = 0;
    }
    summary.actions[event.action]++;
  });

  return summary;
}
