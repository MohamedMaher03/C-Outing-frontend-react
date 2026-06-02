import { interactionsApi } from "@/features/interactions/api/interactionsApi";
import type {
  InteractionActionType,
  RecordInteractionRequest,
} from "@/features/interactions/types";
import { InteractionAdmissionGate } from "../utils/interactionAdmission";
import { InteractionDebounceScheduler } from "../utils/interactionDebounceScheduler";
import {
  FLUSH_INTERVAL_MS,
  MAX_BATCH_SIZE,
} from "../utils/interactionQueuePolicy";
import {
  drainFailedInteractionsInto,
  mergeFailedInteractions,
  normalizeVenueId,
} from "../utils/interactionPersistence";

const interactionQueue: RecordInteractionRequest[] = [];
let isFlushing = false;
let initialized = false;

const admissionGate = new InteractionAdmissionGate();
const debounceScheduler = new InteractionDebounceScheduler();

const pushToQueue = (payload: RecordInteractionRequest): void => {
  interactionQueue.push(payload);
  if (interactionQueue.length >= MAX_BATCH_SIZE) {
    void interactionsService.flushQueue();
  }
};

const enqueueWithAdmission = (payload: RecordInteractionRequest): void => {
  if (admissionGate.shouldDefer(payload)) return;
  debounceScheduler.schedule(payload, pushToQueue);
};

const ensureInitialized = (): void => {
  if (initialized || typeof window === "undefined") return;

  initialized = true;
  drainFailedInteractionsInto(interactionQueue);

  if (import.meta.env.MODE === "test") return;

  window.setInterval(() => {
    void interactionsService.flushQueue();
  }, FLUSH_INTERVAL_MS);

  window.addEventListener("online", () => {
    drainFailedInteractionsInto(interactionQueue);
    void interactionsService.flushQueue();
  });
};

const extractRetryableBatchFailures = (
  batch: RecordInteractionRequest[],
  errors: { index: number; reason: string }[],
): RecordInteractionRequest[] =>
  errors
    .filter((entry) => !entry.reason.toLowerCase().includes("duplicate"))
    .map((entry) => batch[entry.index])
    .filter((item): item is RecordInteractionRequest => item !== undefined);

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
    if (!venueId) return;

    const normalizedPayload: RecordInteractionRequest = {
      venueId,
      actionType: payload.actionType,
    };

    if (typeof window === "undefined") {
      pushToQueue(normalizedPayload);
      return;
    }

    enqueueWithAdmission(normalizedPayload);
  },

  async flushQueue(): Promise<void> {
    ensureInitialized();

    if (isFlushing || interactionQueue.length === 0) return;

    isFlushing = true;

    try {
      const batch = interactionQueue.splice(0, MAX_BATCH_SIZE);
      let failed: RecordInteractionRequest[] = [];

      try {
        const result = await interactionsApi.recordInteractionBatch(batch);
        if (result.errors.length > 0) {
          failed = extractRetryableBatchFailures(batch, result.errors);
        }
      } catch {
        failed = batch;
      }

      if (failed.length > 0) mergeFailedInteractions(failed);
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
      if (typeof window !== "undefined") {
        mergeFailedInteractions([payload]);
      }
    }
  },
};

export const recordInteraction = interactionsService.recordInteraction;

export const recordInteractionSafe = interactionsService.recordInteractionSafe;

export const trackVenueInteractionSafe = (
  venueId: string,
  actionType: InteractionActionType,
): Promise<void> =>
  interactionsService.recordInteractionSafe({ venueId, actionType });
