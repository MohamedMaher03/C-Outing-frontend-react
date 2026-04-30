import { interactionsApi } from "@/features/interactions/api/interactionsApi";
import type {
  InteractionActionType,
  RecordInteractionRequest,
} from "@/features/interactions/types";

const normalizeVenueId = (venueId: string): string => venueId.trim();

const FAILED_STORAGE_KEY = "c-outing-interactions-failed-v1";
const FLUSH_INTERVAL_MS = 5 * 60000; // note for me to remember :here i save the interactions for 5 min and then flush them to the server, this is to avoid sending too many requests to the server in a short period of time, and also to handle the case when the user is offline for a while and then comes back online, we don't want to lose those interactions, so we save them in localStorage and then flush them when the user comes back online or when the flush interval is reached.
const MAX_BATCH_SIZE = 25;

const DEDUPE_WINDOW_BY_ACTION: Partial<Record<InteractionActionType, number>> =
  {
    view: 10000,
    long_view: 30000,
    view_photos: 1500,
    like: 900,
    favorite: 900,
    share: 1500,
    directions: 2000,
  };

const THROTTLE_WINDOW_BY_ACTION: Partial<
  Record<InteractionActionType, number>
> = {
  view: 3000,
  view_photos: 600,
  like: 600,
};

const DEBOUNCE_WINDOW_BY_ACTION: Partial<
  Record<InteractionActionType, number>
> = {
  view: 900,
  view_photos: 350,
  like: 250,
};

const DEFAULT_DEDUPE_WINDOW_MS = 500;

const interactionQueue: RecordInteractionRequest[] = [];
let isFlushing = false;
let initialized = false;

const lastQueuedAt = new Map<string, number>();
const lastAcceptedAt = new Map<string, number>();
const debounceTimers = new Map<string, number>();

const buildInteractionKey = (payload: RecordInteractionRequest): string =>
  `${payload.venueId}:${payload.actionType}`;

const safeParseFailedInteractions = (
  raw: string | null,
): RecordInteractionRequest[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const venueId =
          typeof item.venueId === "string" ? item.venueId.trim() : "";
        const actionType =
          typeof item.actionType === "string" ? item.actionType : "";

        if (!venueId || !actionType) return null;

        return {
          venueId,
          actionType: actionType as InteractionActionType,
        } satisfies RecordInteractionRequest;
      })
      .filter((item): item is RecordInteractionRequest => item !== null);
  } catch {
    return [];
  }
};

const loadFailedInteractions = (): RecordInteractionRequest[] => {
  if (typeof window === "undefined") return [];
  return safeParseFailedInteractions(
    window.localStorage.getItem(FAILED_STORAGE_KEY),
  );
};

const persistFailedInteractions = (items: RecordInteractionRequest[]): void => {
  if (typeof window === "undefined") return;

  if (items.length === 0) {
    window.localStorage.removeItem(FAILED_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(FAILED_STORAGE_KEY, JSON.stringify(items));
};

const mergeFailedInteractions = (items: RecordInteractionRequest[]): void => {
  const existing = loadFailedInteractions();
  persistFailedInteractions([...existing, ...items]);
};

const requeueFailedInteractions = (): void => {
  const failed = loadFailedInteractions();
  if (failed.length === 0) return;

  interactionQueue.unshift(...failed);
  persistFailedInteractions([]);
};

const cleanupStaleMaps = (now: number): void => {
  const maxWindow = Math.max(
    ...Object.values(DEDUPE_WINDOW_BY_ACTION),
    ...Object.values(THROTTLE_WINDOW_BY_ACTION),
    DEFAULT_DEDUPE_WINDOW_MS,
  );

  for (const [key, timestamp] of lastQueuedAt) {
    if (now - timestamp > maxWindow * 3) {
      lastQueuedAt.delete(key);
    }
  }

  for (const [key, timestamp] of lastAcceptedAt) {
    if (now - timestamp > maxWindow * 3) {
      lastAcceptedAt.delete(key);
    }
  }
};

const pushToQueue = (payload: RecordInteractionRequest): void => {
  interactionQueue.push(payload);
  if (interactionQueue.length >= MAX_BATCH_SIZE) {
    void interactionsService.flushQueue();
  }
};

const enqueueWithDebounce = (payload: RecordInteractionRequest): void => {
  const key = buildInteractionKey(payload);
  const debounceMs = DEBOUNCE_WINDOW_BY_ACTION[payload.actionType] ?? 0;

  if (debounceMs <= 0) {
    pushToQueue(payload);
    return;
  }

  const existingTimer = debounceTimers.get(key);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const timer = window.setTimeout(() => {
    debounceTimers.delete(key);
    pushToQueue(payload);
  }, debounceMs);

  debounceTimers.set(key, timer);
};

const shouldSkipByDedupOrThrottle = (
  payload: RecordInteractionRequest,
): boolean => {
  const now = Date.now();
  const key = buildInteractionKey(payload);
  const dedupeWindow =
    DEDUPE_WINDOW_BY_ACTION[payload.actionType] ?? DEFAULT_DEDUPE_WINDOW_MS;
  const throttleWindow = THROTTLE_WINDOW_BY_ACTION[payload.actionType] ?? 0;

  const lastQueued = lastQueuedAt.get(key);
  if (lastQueued !== undefined && now - lastQueued < dedupeWindow) {
    return true;
  }

  const lastAccepted = lastAcceptedAt.get(key);
  if (throttleWindow > 0 && lastAccepted !== undefined) {
    if (now - lastAccepted < throttleWindow) {
      return true;
    }
  }

  lastQueuedAt.set(key, now);
  lastAcceptedAt.set(key, now);
  cleanupStaleMaps(now);
  return false;
};

const ensureInitialized = (): void => {
  if (initialized || typeof window === "undefined") return;

  initialized = true;
  requeueFailedInteractions();

  if (import.meta.env.MODE === "test") {
    return;
  }

  window.setInterval(() => {
    void interactionsService.flushQueue();
  }, FLUSH_INTERVAL_MS);

  window.addEventListener("online", () => {
    requeueFailedInteractions();
    void interactionsService.flushQueue();
  });
};

export const interactionsService = {
  /**
   * Direct single-interaction call — bypasses the queue entirely.
   * Use when you need an immediate, awaitable result (e.g. optimistic UI).
   */
  async recordInteraction(payload: RecordInteractionRequest): Promise<void> {
    const venueId = normalizeVenueId(payload.venueId);
    if (!venueId) {
      throw new Error("Cannot record interaction without a valid venue id");
    }

    await interactionsApi.recordInteraction({
      venueId,
      actionType: payload.actionType,
    });
  },

  enqueueInteraction(payload: RecordInteractionRequest): void {
    ensureInitialized();

    const venueId = normalizeVenueId(payload.venueId);
    if (!venueId) {
      return;
    }

    const normalizedPayload: RecordInteractionRequest = {
      venueId,
      actionType: payload.actionType,
    };

    if (shouldSkipByDedupOrThrottle(normalizedPayload)) {
      return;
    }

    if (typeof window === "undefined") {
      pushToQueue(normalizedPayload);
      return;
    }

    enqueueWithDebounce(normalizedPayload);
  },

  /**
   * Flushes up to MAX_BATCH_SIZE items from the queue in a single
   * POST /api/v1/Interaction/batch request.
   *
   * The backend returns per-item accept/reject/duplicate info.
   * Only items that the backend explicitly rejects with a server-side
   * error (i.e. not just "duplicate") are persisted for retry, because
   * duplicates are expected and not worth retrying.
   *
   * If the entire HTTP call fails (network down, 5xx, etc.) the whole
   * batch is persisted so nothing is silently dropped.
   */
  async flushQueue(): Promise<void> {
    ensureInitialized();

    if (isFlushing || interactionQueue.length === 0) {
      return;
    }

    isFlushing = true;

    try {
      const batch = interactionQueue.splice(0, MAX_BATCH_SIZE);

      let failed: RecordInteractionRequest[] = [];

      try {
        const result = await interactionsApi.recordInteractionBatch(batch);

        // Map rejected items back to their original payloads for retry.
        // We intentionally skip duplicates — they are not errors worth retrying.
        if (result.errors.length > 0) {
          failed = result.errors
            .filter((err) => {
              // "duplicate" reasons come from the server-side dedupe layer;
              // retrying them would always produce the same outcome.
              return !err.reason.toLowerCase().includes("duplicate");
            })
            .map((err) => batch[err.index])
            .filter(
              (item): item is RecordInteractionRequest => item !== undefined,
            );
        }
      } catch {
        // Entire HTTP call failed (network error, 5xx, etc.) — keep the
        // whole batch so nothing is silently dropped.
        failed = batch;
      }

      if (failed.length > 0) {
        mergeFailedInteractions(failed);
      }
    } finally {
      isFlushing = false;

      // Keep draining if more items arrived while we were flushing.
      if (interactionQueue.length > 0) {
        void interactionsService.flushQueue();
      }
    }
  },

  getQueueSize(): number {
    return interactionQueue.length;
  },

  async recordInteractionSafe(
    payload: RecordInteractionRequest,
  ): Promise<void> {
    try {
      interactionsService.enqueueInteraction(payload);
    } catch {
      // Interaction tracking is best-effort and must never block the UI.
    }
  },
};

export const recordInteraction = interactionsService.recordInteraction;

export const recordInteractionSafe = interactionsService.recordInteractionSafe;

export const trackVenueInteractionSafe = (
  venueId: string,
  actionType: InteractionActionType,
): Promise<void> =>
  interactionsService.recordInteractionSafe({
    venueId,
    actionType,
  });
