'use client';

import React, { useEffect, useState } from 'react';
import { useABTest } from '../../../contexts/ABTestContext';

interface ABTestSummary {
  totalEvents: number;
  variants: Record<string, {
    count: number;
    events: Record<string, number>;
    uniqueUsers: number;
    uniqueSessions: number;
  }>;
  events: Record<string, number>;
  timeRange: {
    start: string | null;
    end: string | null;
  };
}

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

const ABTestDashboard: React.FC = () => {
  const { currentVariant, trackEvent } = useABTest();
  const [summary, setSummary] = useState<ABTestSummary | null>(null);
  const [events, setEvents] = useState<ABTestEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    fetchAnalyticsData();
    
    // Track dashboard access
    trackEvent('admin_dashboard_access', {
      current_variant: currentVariant,
      timestamp: new Date().toISOString()
    });

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, [currentVariant, trackEvent]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        testId: 'cursor-theme-optimization-v1',
        limit: '1000'
      });

      if (selectedVariant !== 'all') {
        params.append('variant', selectedVariant);
      }

      if (selectedEvent !== 'all') {
        params.append('event', selectedEvent);
      }

      const response = await fetch(`/api/analytics/ab-test?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setSummary(data.summary);
      setEvents(data.events);
      setError(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionRate = (variant: string) => {
    if (!summary?.variants[variant]) return 0;
    
    const variantData = summary.variants[variant];
    const clicks = variantData.events.click || 0;
    const hovers = variantData.events.hover_enter || 0;
    
    return hovers > 0 ? ((clicks / hovers) * 100).toFixed(2) : '0.00';
  };

  const calculateEngagementScore = (variant: string) => {
    if (!summary?.variants[variant]) return 0;
    
    const variantData = summary.variants[variant];
    const interactions = Object.values(variantData.events).reduce((sum, count) => sum + count, 0);
    const users = variantData.uniqueUsers;
    
    return users > 0 ? (interactions / users).toFixed(2) : '0.00';
  };

  const getPerformanceMetrics = (variant: string) => {
    const performanceEvents = events.filter(
      event => event.variant === variant && event.event === 'performance_fps'
    );
    
    if (performanceEvents.length === 0) return { avgFPS: 'N/A', memoryUsage: 'N/A' };
    
    const avgFPS = performanceEvents.reduce(
      (sum, event) => sum + (event.properties?.fps || 0), 0
    ) / performanceEvents.length;
    
    const avgMemory = performanceEvents.reduce(
      (sum, event) => sum + (event.properties?.memory_used || 0), 0
    ) / performanceEvents.length;
    
    return {
      avgFPS: avgFPS.toFixed(1),
      memoryUsage: (avgMemory / 1024 / 1024).toFixed(1) + 'MB'
    };
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">A/B Test Dashboard</h1>
          <div className="text-center">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">A/B Test Dashboard</h1>
          <div className="bg-red-600 p-4 rounded">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Cursor A/B Test Dashboard</h1>
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Test Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Events</h3>
            <p className="text-3xl font-bold text-blue-400">{summary?.totalEvents || 0}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Active Variants</h3>
            <p className="text-3xl font-bold text-green-400">
              {summary ? Object.keys(summary.variants).length : 0}
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Variant</h3>
            <p className="text-xl font-bold text-purple-400 capitalize">{currentVariant}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Test Duration</h3>
            <p className="text-sm text-gray-300">
              {summary?.timeRange.start ? 
                `${Math.ceil((Date.now() - new Date(summary.timeRange.start).getTime()) / (1000 * 60 * 60 * 24))} days` : 
                'N/A'
              }
            </p>
          </div>
        </div>

        {/* Variant Performance Comparison */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-6">Variant Performance Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3">Variant</th>
                  <th className="pb-3">Users</th>
                  <th className="pb-3">Sessions</th>
                  <th className="pb-3">Events</th>
                  <th className="pb-3">Conversion Rate</th>
                  <th className="pb-3">Engagement Score</th>
                  <th className="pb-3">Avg FPS</th>
                  <th className="pb-3">Memory Usage</th>
                </tr>
              </thead>
              <tbody>
                {summary && Object.entries(summary.variants).map(([variant, data]) => {
                  const performance = getPerformanceMetrics(variant);
                  return (
                    <tr key={variant} className="border-b border-gray-700">
                      <td className="py-3 font-semibold capitalize">{variant}</td>
                      <td className="py-3">{data.uniqueUsers}</td>
                      <td className="py-3">{data.uniqueSessions}</td>
                      <td className="py-3">{data.count}</td>
                      <td className="py-3">{calculateConversionRate(variant)}%</td>
                      <td className="py-3">{calculateEngagementScore(variant)}</td>
                      <td className="py-3">{performance.avgFPS}</td>
                      <td className="py-3">{performance.memoryUsage}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Event Types</h3>
            <div className="space-y-2">
              {summary && Object.entries(summary.events).map(([event, count]) => (
                <div key={event} className="flex justify-between">
                  <span className="capitalize">{event.replace(/_/g, ' ')}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Variant Distribution</h3>
            <div className="space-y-2">
              {summary && Object.entries(summary.variants).map(([variant, data]) => {
                const percentage = ((data.count / summary.totalEvents) * 100).toFixed(1);
                return (
                  <div key={variant} className="flex justify-between">
                    <span className="capitalize">{variant}</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Recent Events</h3>
          
          <div className="flex gap-4 mb-4">
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="all">All Variants</option>
              {summary && Object.keys(summary.variants).map(variant => (
                <option key={variant} value={variant} className="capitalize">
                  {variant}
                </option>
              ))}
            </select>
            
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="all">All Events</option>
              {summary && Object.keys(summary.events).map(event => (
                <option key={event} value={event} className="capitalize">
                  {event.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-700">
                <tr>
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Event</th>
                  <th className="text-left p-2">Variant</th>
                  <th className="text-left p-2">User ID</th>
                  <th className="text-left p-2">Properties</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(-50).reverse().map((event, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-2">{new Date(event.timestamp).toLocaleString()}</td>
                    <td className="p-2 capitalize">{event.event.replace(/_/g, ' ')}</td>
                    <td className="p-2 capitalize">{event.variant}</td>
                    <td className="p-2 font-mono text-xs">{event.userId.substring(0, 8)}...</td>
                    <td className="p-2 text-xs">
                      {event.properties && Object.keys(event.properties).length > 0 ? 
                        JSON.stringify(event.properties).substring(0, 100) + '...' : 
                        'None'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABTestDashboard;
