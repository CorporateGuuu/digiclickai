import { NextRequest, NextResponse } from 'next/server';

interface CursorEvent {
  userId: string;
  sessionId: string;
  timestamp: string;
  x: number;
  y: number;
  eventType: 'move' | 'click' | 'hover';
  targetElement?: string;
  dwellTime?: number;
  path: string;
}

// In-memory storage for development
const cursorEvents: CursorEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const eventData: CursorEvent = await request.json();

    // Validate required fields
    if (!eventData.x || !eventData.y || !eventData.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: x, y, eventType' },
        { status: 400 }
      );
    }

    // Sanitize and store event
    const sanitizedEvent: CursorEvent = {
      userId: eventData.userId?.substring(0, 100) || 'anonymous',
      sessionId: eventData.sessionId?.substring(0, 100) || 'unknown',
      timestamp: eventData.timestamp || new Date().toISOString(),
      x: Math.round(eventData.x),
      y: Math.round(eventData.y),
      eventType: eventData.eventType,
      targetElement: eventData.targetElement?.substring(0, 100),
      dwellTime: eventData.dwellTime,
      path: eventData.path?.substring(0, 500) || '/'
    };

    cursorEvents.push(sanitizedEvent);

    // Keep only last 10000 events
    if (cursorEvents.length > 10000) {
      cursorEvents.splice(0, cursorEvents.length - 10000);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Cursor analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const eventType = searchParams.get('eventType');
    const timeframe = searchParams.get('timeframe') || '24h';

    let filteredEvents = cursorEvents;
    const now = new Date();
    const timeframeMs = timeframe === '24h' ? 86400000 : 
                       timeframe === '7d' ? 604800000 : 
                       timeframe === '30d' ? 2592000000 : 86400000;

    // Filter by timeframe
    filteredEvents = filteredEvents.filter(event => 
      new Date(event.timestamp).getTime() > now.getTime() - timeframeMs
    );

    // Apply additional filters
    if (path) {
      filteredEvents = filteredEvents.filter(event => event.path === path);
    }
    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType);
    }

    // Generate heatmap data
    const heatmapData = generateHeatmapData(filteredEvents);
    
    // Generate interaction patterns
    const patterns = analyzeInteractionPatterns(filteredEvents);

    return NextResponse.json({
      events: filteredEvents.slice(-100), // Return last 100 events
      heatmap: heatmapData,
      patterns,
      total: filteredEvents.length
    });

  } catch (error) {
    console.error('Cursor analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateHeatmapData(events: CursorEvent[]) {
  const heatmap: Record<string, number> = {};
  
  events.forEach(event => {
    // Create grid cells (20x20 pixels)
    const cellX = Math.floor(event.x / 20);
    const cellY = Math.floor(event.y / 20);
    const cell = `${cellX},${cellY}`;
    
    heatmap[cell] = (heatmap[cell] || 0) + 1;
  });

  return heatmap;
}

function analyzeInteractionPatterns(events: CursorEvent[]) {
  const patterns = {
    clickAreas: {} as Record<string, number>,
    dwellTimeAvg: {} as Record<string, number>,
    commonPaths: [] as { from: string; to: string; count: number }[],
    mostEngagedElements: [] as { element: string; interactions: number }[]
  };

  // Analyze click areas
  events
    .filter(e => e.eventType === 'click' && e.targetElement)
    .forEach(e => {
      if (e.targetElement) {
        patterns.clickAreas[e.targetElement] = (patterns.clickAreas[e.targetElement] || 0) + 1;
      }
    });

  // Calculate average dwell times
  const dwellTimes: Record<string, number[]> = {};
  events
    .filter(e => e.dwellTime && e.targetElement)
    .forEach(e => {
      if (e.targetElement && e.dwellTime) {
        if (!dwellTimes[e.targetElement]) {
          dwellTimes[e.targetElement] = [];
        }
        dwellTimes[e.targetElement].push(e.dwellTime);
      }
    });

  Object.entries(dwellTimes).forEach(([element, times]) => {
    patterns.dwellTimeAvg[element] = times.reduce((a, b) => a + b, 0) / times.length;
  });

  // Sort and limit results
  patterns.mostEngagedElements = Object.entries(patterns.clickAreas)
    .map(([element, interactions]) => ({ element, interactions }))
    .sort((a, b) => b.interactions - a.interactions)
    .slice(0, 10);

  return patterns;
}
