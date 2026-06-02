import type { RecordInteractionRequest } from "../types";
import { buildVenueActionKey } from "./interactionKey";
import {
  resolveDedupeWindow,
  resolvePolicyHorizonMs,
  resolveThrottleWindow,
} from "./interactionQueuePolicy";

export class InteractionAdmissionGate {
  private readonly lastQueuedAt = new Map<string, number>();
  private readonly lastAcceptedAt = new Map<string, number>();

  shouldDefer(payload: RecordInteractionRequest): boolean {
    const now = Date.now();
    const key = buildVenueActionKey(payload);
    const dedupeWindow = resolveDedupeWindow(payload.actionType);
    const throttleWindow = resolveThrottleWindow(payload.actionType);

    const lastQueued = this.lastQueuedAt.get(key);
    if (lastQueued !== undefined && now - lastQueued < dedupeWindow) {
      return true;
    }

    const lastAccepted = this.lastAcceptedAt.get(key);
    if (
      throttleWindow > 0 &&
      lastAccepted !== undefined &&
      now - lastAccepted < throttleWindow
    ) {
      return true;
    }

    this.lastQueuedAt.set(key, now);
    this.lastAcceptedAt.set(key, now);
    this.pruneStaleEntries(now);
    return false;
  }

  private pruneStaleEntries(now: number): void {
    const horizon = resolvePolicyHorizonMs() * 3;

    for (const [key, timestamp] of this.lastQueuedAt) {
      if (now - timestamp > horizon) this.lastQueuedAt.delete(key);
    }

    for (const [key, timestamp] of this.lastAcceptedAt) {
      if (now - timestamp > horizon) this.lastAcceptedAt.delete(key);
    }
  }
}
