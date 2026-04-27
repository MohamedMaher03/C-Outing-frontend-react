import { interactionsApi } from "@/features/interactions/api/interactionsApi";
import type {
  InteractionActionType,
  RecordInteractionRequest,
} from "@/features/interactions/types";

const normalizeVenueId = (venueId: string): string => venueId.trim();

const FAILED_STORAGE_KEY = "c-outing-interactions-failed-v1";
const FLUSH_INTERVAL_MS = 4000;
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

  async flushQueue(): Promise<void> {
    ensureInitialized();

    if (isFlushing || interactionQueue.length === 0) {
      return;
    }

    isFlushing = true;

    try {
      const batch = interactionQueue.splice(0, MAX_BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((item) => interactionsApi.recordInteraction(item)),
      );

      const failed: RecordInteractionRequest[] = [];
      for (let index = 0; index < results.length; index += 1) {
        if (results[index]?.status === "rejected") {
          failed.push(batch[index]);
        }
      }

      if (failed.length > 0) {
        mergeFailedInteractions(failed);
      }
    } finally {
      isFlushing = false;

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
