import { NextRequest, NextResponse } from 'next/server';

interface KPIEvent {
  userId: string;
  sessionId: string;
  timestamp: string;
  kpiId: string;
  metric: string;
  value: number;
  properties?: Record<string, any>;
}

interface KPIDefinition {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  goals?: Record<string, number>;
  unit?: string;
}

// In-memory storage for development
const kpiEvents: KPIEvent[] = [];
const kpiDefinitions: KPIDefinition[] = [
  {
    id: 'ai-effectiveness',
    name: 'AI Feature Effectiveness',
    description: 'Measures the effectiveness and usage of AI features',
    metrics: ['accuracy', 'response-time', 'user-satisfaction'],
    goals: {
      'accuracy': 95,
      'response-time': 2000,
      'user-satisfaction': 4.5
    },
    unit: 'percentage'
  },
  {
    id: 'user-engagement',
    name: 'User Engagement Metrics',
    description: 'Tracks user engagement with the platform',
    metrics: ['session-duration', 'feature-usage', 'return-rate'],
    goals: {
      'session-duration': 600,
      'feature-usage': 5,
      'return-rate': 80
    },
    unit: 'count'
  }
];

export async function POST(request: NextRequest) {
  try {
    const eventData: KPIEvent = await request.json();

    // Validate required fields
    if (!eventData.kpiId || !eventData.metric || typeof eventData.value !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: kpiId, metric, value' },
        { status: 400 }
      );
    }

    // Validate KPI and metric
    const kpi = kpiDefinitions.find(k => k.id === eventData.kpiId);
    if (!kpi) {
      return NextResponse.json(
        { error: 'Invalid kpiId' },
        { status: 400 }
      );
    }
    if (!kpi.metrics.includes(eventData.metric)) {
      return NextResponse.json(
        { error: 'Invalid metric for this KPI' },
        { status: 400 }
      );
    }

    // Sanitize and store event
    const sanitizedEvent: KPIEvent = {
      userId: eventData.userId?.substring(0, 100) || 'anonymous',
      sessionId: eventData.sessionId?.substring(0, 100) || 'unknown',
      timestamp: eventData.timestamp || new Date().toISOString(),
      kpiId: eventData.kpiId,
      metric: eventData.metric,
      value: eventData.value,
      properties: eventData.properties || {}
    };

    kpiEvents.push(sanitizedEvent);

    // Keep only last 10000 events
    if (kpiEvents.length > 10000) {
      kpiEvents.splice(0, kpiEvents.length - 10000);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('KPI analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get('kpiId');
    const metric = searchParams.get('metric');
    const timeframe = searchParams.get('timeframe') || '24h';

    let filteredEvents = kpiEvents;
    const now = new Date();
    const timeframeMs = timeframe === '24h' ? 86400000 : 
                       timeframe === '7d' ? 604800000 : 
                       timeframe === '30d' ? 2592000000 : 86400000;

    // Filter by timeframe
    filteredEvents = filteredEvents.filter(event => 
      new Date(event.timestamp).getTime() > now.getTime() - timeframeMs
    );

    // Apply additional filters
    if (kpiId) {
      filteredEvents = filteredEvents.filter(event => event.kpiId === kpiId);
    }
    if (metric) {
      filteredEvents = filteredEvents.filter(event => event.metric === metric);
    }

    // Generate KPI analytics
    const kpiAnalytics = generateKPIAnalytics(filteredEvents);

    return NextResponse.json({
      kpis: kpiDefinitions,
      analytics: kpiAnalytics,
      total: filteredEvents.length
    });

  } catch (error) {
    console.error('KPI analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateKPIAnalytics(events: KPIEvent[]) {
  const analytics: Record<string, any> = {};

  // Group events by KPI
  kpiDefinitions.forEach(kpi => {
    const kpiEvents = events.filter(e => e.kpiId === kpi.id);
    
    analytics[kpi.id] = {
      name: kpi.name,
      description: kpi.description,
      metrics: {},
      goals: kpi.goals || {},
      unit: kpi.unit,
      timeRange: {
        start: null,
        end: null
      }
    };

    if (kpiEvents.length > 0) {
      // Set time range
      const sortedEvents = kpiEvents.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      analytics[kpi.id].timeRange.start = sortedEvents[0].timestamp;
      analytics[kpi.id].timeRange.end = sortedEvents[sortedEvents.length - 1].timestamp;

      // Calculate metrics
      kpi.metrics.forEach(metric => {
        const metricEvents = kpiEvents.filter(e => e.metric === metric);
        const values = metricEvents.map(e => e.value);
        
        analytics[kpi.id].metrics[metric] = {
          current: values[values.length - 1] || 0,
          average: values.length > 0 ? 
            values.reduce((a, b) => a + b, 0) / values.length : 0,
          min: values.length > 0 ? Math.min(...values) : 0,
          max: values.length > 0 ? Math.max(...values) : 0,
          total: values.reduce((a, b) => a + b, 0),
          count: values.length,
          trend: calculateTrend(values),
          goalProgress: calculateGoalProgress(
            values[values.length - 1] || 0,
            kpi.goals?.[metric] || 0
          )
        };
      });
    }
  });

  return analytics;
}

function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const recentValues = values.slice(-5); // Look at last 5 values
  const firstAvg = recentValues.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  const lastAvg = recentValues.slice(-2).reduce((a, b) => a + b, 0) / 2;
  
  const difference = lastAvg - firstAvg;
  const threshold = 0.05; // 5% change threshold
  
  if (Math.abs(difference) / firstAvg < threshold) return 'stable';
  return difference > 0 ? 'up' : 'down';
}

function calculateGoalProgress(current: number, goal: number): number {
  if (!goal) return 0;
  return Math.min(Math.round((current / goal) * 100), 100);
}
