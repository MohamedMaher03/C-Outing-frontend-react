import type {
  InteractionActionType,
  RecordInteractionRequest,
} from "../types";

const FAILED_STORAGE_KEY = "c-outing-interactions-failed-v1";

export const normalizeVenueId = (venueId: string): string => venueId.trim();

const isRecordInteractionRequest = (
  value: unknown,
): value is RecordInteractionRequest => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const venueId =
    typeof candidate.venueId === "string" ? candidate.venueId.trim() : "";
  const actionType =
    typeof candidate.actionType === "string" ? candidate.actionType : "";
  return Boolean(venueId && actionType);
};

export const parseFailedInteractionPayload = (
  raw: string | null,
): RecordInteractionRequest[] => {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecordInteractionRequest)
      .map((item) => ({
        venueId: item.venueId.trim(),
        actionType: item.actionType as InteractionActionType,
      }));
  } catch {
    return [];
  }
};

export const loadFailedInteractions = (): RecordInteractionRequest[] => {
  if (typeof window === "undefined") return [];
  return parseFailedInteractionPayload(
    window.localStorage.getItem(FAILED_STORAGE_KEY),
  );
};

export const persistFailedInteractions = (
  items: RecordInteractionRequest[],
): void => {
  if (typeof window === "undefined") return;

  if (items.length === 0) {
    window.localStorage.removeItem(FAILED_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(FAILED_STORAGE_KEY, JSON.stringify(items));
};

export const mergeFailedInteractions = (
  items: RecordInteractionRequest[],
): void => {
  const existing = loadFailedInteractions();
  persistFailedInteractions([...existing, ...items]);
};

export const drainFailedInteractionsInto = (
  target: RecordInteractionRequest[],
): void => {
  const failed = loadFailedInteractions();
  if (failed.length === 0) return;
  target.unshift(...failed);
  persistFailedInteractions([]);
};
