import type { RecordInteractionRequest } from "../types";
import { buildVenueActionKey } from "./interactionKey";
import { resolveDebounceWindow } from "./interactionQueuePolicy";

export class InteractionDebounceScheduler {
  private readonly timers = new Map<string, number>();

  schedule(
    payload: RecordInteractionRequest,
    onReady: (item: RecordInteractionRequest) => void,
  ): void {
    const key = buildVenueActionKey(payload);
    const debounceMs = resolveDebounceWindow(payload.actionType);

    if (debounceMs <= 0) {
      onReady(payload);
      return;
    }

    if (typeof window === "undefined") {
      onReady(payload);
      return;
    }

    const existingTimer = this.timers.get(key);
    if (existingTimer) window.clearTimeout(existingTimer);

    const timer = window.setTimeout(() => {
      this.timers.delete(key);
      onReady(payload);
    }, debounceMs);

    this.timers.set(key, timer);
  }
}
