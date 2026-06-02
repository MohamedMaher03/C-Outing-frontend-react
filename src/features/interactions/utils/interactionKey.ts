import type { RecordInteractionRequest } from "../types";

export const buildVenueActionKey = (
  payload: RecordInteractionRequest,
): string => `${payload.venueId}:${payload.actionType}`;
