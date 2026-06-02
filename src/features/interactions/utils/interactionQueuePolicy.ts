import type { InteractionActionType } from "../types";

export const FLUSH_INTERVAL_MS = 5 * 60_000;
export const MAX_BATCH_SIZE = 25;
export const DEFAULT_DEDUPE_WINDOW_MS = 500;

export const DEDUPE_WINDOW_BY_ACTION: Partial<
  Record<InteractionActionType, number>
> = {
  view: 10_000,
  long_view: 30_000,
  view_photos: 1_500,
  like: 900,
  favorite: 900,
  share: 1_500,
  directions: 2_000,
};

export const THROTTLE_WINDOW_BY_ACTION: Partial<
  Record<InteractionActionType, number>
> = {
  view: 3_000,
  view_photos: 600,
  like: 600,
};

export const DEBOUNCE_WINDOW_BY_ACTION: Partial<
  Record<InteractionActionType, number>
> = {
  view: 900,
  view_photos: 350,
  like: 250,
};

export const resolveDedupeWindow = (
  actionType: InteractionActionType,
): number =>
  DEDUPE_WINDOW_BY_ACTION[actionType] ?? DEFAULT_DEDUPE_WINDOW_MS;

export const resolveThrottleWindow = (
  actionType: InteractionActionType,
): number => THROTTLE_WINDOW_BY_ACTION[actionType] ?? 0;

export const resolveDebounceWindow = (
  actionType: InteractionActionType,
): number => DEBOUNCE_WINDOW_BY_ACTION[actionType] ?? 0;

export const resolvePolicyHorizonMs = (): number =>
  Math.max(
    ...Object.values(DEDUPE_WINDOW_BY_ACTION),
    ...Object.values(THROTTLE_WINDOW_BY_ACTION),
    DEFAULT_DEDUPE_WINDOW_MS,
  );
