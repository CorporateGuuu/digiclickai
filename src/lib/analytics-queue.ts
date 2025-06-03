interface QueuedEvent {
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

class AnalyticsQueue {
  private queue: QueuedEvent[] = [];
  private flushInterval: number = 1000; // Flush every second
  private maxQueueSize: number = 50;
  private isProcessing: boolean = false;
  private retryTimeout: number | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor() {
    // Start periodic flush
    if (typeof window !== 'undefined') {
      setInterval(() => this.flush(), this.flushInterval);

      // Flush before page unload
      window.addEventListener('beforeunload', () => {
        if (this.queue.length > 0) {
          this.flush(true);
        }
      });
    }
  }

  public enqueue(event: QueuedEvent): void {
    this.queue.push(event);

    // Flush if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private async flush(immediate: boolean = false): Promise<void> {
    if (this.queue.length === 0 || (this.isProcessing && !immediate)) {
      return;
    }

    this.isProcessing = true;
    const events = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(events),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit hit - requeue with exponential backoff
          this.handleRateLimit(events);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        // Success - reset retry count
        this.retryCount = 0;
        if (this.retryTimeout) {
          clearTimeout(this.retryTimeout);
          this.retryTimeout = null;
        }
      }
    } catch (error) {
      console.warn('Failed to send analytics batch:', error);
      this.handleError(events);
    } finally {
      this.isProcessing = false;
    }
  }

  private handleRateLimit(events: QueuedEvent[]): void {
    const backoffTime = Math.min(1000 * Math.pow(2, this.retryCount), 30000); // Max 30 second delay
    this.retryCount++;

    if (this.retryCount <= this.maxRetries) {
      // Requeue events with delay
      this.retryTimeout = window.setTimeout(() => {
        this.queue.unshift(...events);
        this.flush();
      }, backoffTime);
    } else {
      // Max retries exceeded - log error and drop events
      console.error('Max retries exceeded for analytics batch - dropping events');
      this.retryCount = 0;
    }
  }

  private handleError(events: QueuedEvent[]): void {
    if (this.retryCount < this.maxRetries) {
      // Requeue events at the start of the queue
      this.queue.unshift(...events);
      this.retryCount++;
    } else {
      // Max retries exceeded - log error and drop events
      console.error('Max retries exceeded for analytics batch - dropping events');
      this.retryCount = 0;
    }
  }
}

// Singleton instance
export const analyticsQueue = new AnalyticsQueue();
