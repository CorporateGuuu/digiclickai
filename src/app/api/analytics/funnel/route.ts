import { NextRequest, NextResponse } from 'next/server';

interface FunnelEvent {
  userId: string;
  sessionId: string;
  timestamp: string;
  funnelId: string;
  stage: string;
  properties?: Record<string, any>;
  value?: number;
}

interface FunnelDefinition {
  id: string;
  name: string;
  stages: string[];
}

// In-memory storage for development
const funnelEvents: FunnelEvent[] = [];
const funnelDefinitions: FunnelDefinition[] = [
  {
    id: 'main-conversion',
    name: 'Main Conversion Funnel',
    stages: ['page-visit', 'feature-demo', 'signup', 'payment']
  },
  {
    id: 'ai-demo',
    name: 'AI Demo Funnel',
    stages: ['demo-view', 'demo-interaction', 'demo-completion', 'contact-sales']
  }
];

export async function POST(request: NextRequest) {
  try {
    const eventData: FunnelEvent = await request.json();

    // Validate required fields
    if (!eventData.funnelId || !eventData.stage) {
      return NextResponse.json(
        { error: 'Missing required fields: funnelId, stage' },
        { status: 400 }
      );
    }

    // Validate funnel and stage
    const funnel = funnelDefinitions.find(f => f.id === eventData.funnelId);
    if (!funnel) {
      return NextResponse.json(
        { error: 'Invalid funnelId' },
        { status: 400 }
      );
    }
    if (!funnel.stages.includes(eventData.stage)) {
      return NextResponse.json(
        { error: 'Invalid stage for this funnel' },
        { status: 400 }
      );
    }

    // Sanitize and store event
    const sanitizedEvent: FunnelEvent = {
      userId: eventData.userId?.substring(0, 100) || 'anonymous',
      sessionId: eventData.sessionId?.substring(0, 100) || 'unknown',
      timestamp: eventData.timestamp || new Date().toISOString(),
      funnelId: eventData.funnelId,
      stage: eventData.stage,
      properties: eventData.properties || {},
      value: eventData.value
    };

    funnelEvents.push(sanitizedEvent);

    // Keep only last 10000 events
    if (funnelEvents.length > 10000) {
      funnelEvents.splice(0, funnelEvents.length - 10000);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Funnel analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const funnelId = searchParams.get('funnelId');
    const timeframe = searchParams.get('timeframe') || '24h';

    let filteredEvents = funnelEvents;
    const now = new Date();
    const timeframeMs = timeframe === '24h' ? 86400000 : 
                       timeframe === '7d' ? 604800000 : 
                       timeframe === '30d' ? 2592000000 : 86400000;

    // Filter by timeframe
    filteredEvents = filteredEvents.filter(event => 
      new Date(event.timestamp).getTime() > now.getTime() - timeframeMs
    );

    // Filter by funnel
    if (funnelId) {
      filteredEvents = filteredEvents.filter(event => event.funnelId === funnelId);
    }

    // Generate funnel analytics
    const funnelAnalytics = generateFunnelAnalytics(filteredEvents);

    return NextResponse.json({
      funnels: funnelDefinitions,
      analytics: funnelAnalytics,
      total: filteredEvents.length
    });

  } catch (error) {
    console.error('Funnel analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFunnelAnalytics(events: FunnelEvent[]) {
  const analytics: Record<string, any> = {};

  // Group events by funnel
  funnelDefinitions.forEach(funnel => {
    const funnelEvents = events.filter(e => e.funnelId === funnel.id);
    
    // Initialize funnel analytics
    analytics[funnel.id] = {
      name: funnel.name,
      stages: {},
      conversions: [],
      totalValue: 0,
      uniqueUsers: new Set(),
      uniqueSessions: new Set()
    };

    // Count users per stage
    funnel.stages.forEach(stage => {
      const stageEvents = funnelEvents.filter(e => e.stage === stage);
      const uniqueUsers = new Set(stageEvents.map(e => e.userId));
      const uniqueSessions = new Set(stageEvents.map(e => e.sessionId));

      analytics[funnel.id].stages[stage] = {
        total: stageEvents.length,
        uniqueUsers: uniqueUsers.size,
        uniqueSessions: uniqueSessions.size
      };

      // Track unique users and sessions for the entire funnel
      stageEvents.forEach(e => {
        analytics[funnel.id].uniqueUsers.add(e.userId);
        analytics[funnel.id].uniqueSessions.add(e.sessionId);
      });
    });

    // Calculate conversion rates between stages
    for (let i = 0; i < funnel.stages.length - 1; i++) {
      const currentStage = funnel.stages[i];
      const nextStage = funnel.stages[i + 1];
      
      const currentUsers = analytics[funnel.id].stages[currentStage].uniqueUsers;
      const nextUsers = analytics[funnel.id].stages[nextStage].uniqueUsers;
      
      const conversionRate = currentUsers > 0 ? (nextUsers / currentUsers) * 100 : 0;
      
      analytics[funnel.id].conversions.push({
        from: currentStage,
        to: nextStage,
        rate: Math.round(conversionRate * 100) / 100
      });
    }

    // Calculate total value
    analytics[funnel.id].totalValue = funnelEvents
      .filter(e => e.value)
      .reduce((sum, e) => sum + (e.value || 0), 0);

    // Convert Sets to numbers for JSON serialization
    analytics[funnel.id].uniqueUsers = analytics[funnel.id].uniqueUsers.size;
    analytics[funnel.id].uniqueSessions = analytics[funnel.id].uniqueSessions.size;
  });

  return analytics;
}
