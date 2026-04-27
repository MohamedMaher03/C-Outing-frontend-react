import { interactionsApi } from "@/features/interactions/api/interactionsApi";
import type {
  InteractionActionType,
  RecordInteractionRequest,
} from "@/features/interactions/types";

const normalizeVenueId = (venueId: string): string => venueId.trim();

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

  async recordInteractionSafe(
    payload: RecordInteractionRequest,
  ): Promise<void> {
    try {
      await interactionsService.recordInteraction(payload);
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
