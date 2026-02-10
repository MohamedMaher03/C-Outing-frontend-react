/**
 * Interaction Tracker Service
 * Handles implicit tracking of user interactions in the background
 * Queues interactions and sends them to API
 */

import { Interaction } from "../../types";
import { interactionService } from "../api/interactionService";
import { sessionService } from "./sessionService";

interface QueuedInteraction extends Omit<Interaction, "interactionId"> {
  retryCount?: number;
}

class InteractionTracker {
  private queue: QueuedInteraction[] = [];
  private isProcessing = false;
  private processInterval: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  /**
   * Start tracking interactions
   * Processes queue periodically in background
   */
  start(): void {
    if (this.processInterval) return;

    // Process queue every 30 seconds or when queue reaches certain size
    this.processInterval = setInterval(() => {
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }, 30000);
  }

  /**
   * Stop tracking interactions and clear interval
   */
  stop(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    this.processQueue(); // Process remaining items
  }

  /**
   * Queue an interaction for later processing
   */
  trackInteraction(
    userId: number,
    venueId: number,
    actionType: Interaction["actionType"],
    context: Record<string, unknown> = {},
    additionalData?: {
      ratingValue?: number;
      comment?: string;
      positionInList?: number;
    },
  ): void {
    const interaction: QueuedInteraction = {
      userId,
      venueId,
      actionType,
      timestamp: new Date(),
      sessionId: sessionService.getSessionId(),
      positionInList: additionalData?.positionInList || 0,
      context,
      ratingValue: additionalData?.ratingValue,
      comment: additionalData?.comment,
      retryCount: 0,
    };

    this.queue.push(interaction);

    // If queue is large, process immediately
    if (this.queue.length >= 5) {
      this.processQueue();
    }
  }

  /**
   * Process queued interactions
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const toProcess = [...this.queue];
    this.queue = [];

    for (const interaction of toProcess) {
      try {
        await interactionService.trackInteraction(interaction);
      } catch (error) {
        // Re-queue failed interaction with retry count
        const retryCount = (interaction.retryCount || 0) + 1;
        if (retryCount < this.maxRetries) {
          this.queue.push({
            ...interaction,
            retryCount,
          });
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get current queue size (for debugging)
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

export const interactionTracker = new InteractionTracker();
