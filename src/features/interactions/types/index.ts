export const INTERACTION_ACTION_TYPES = {
  favorite: "favorite",
  review: "review",
  rate: "rate",
  like: "like",
  share: "share",
  directions: "directions",
  longView: "long_view",
  viewPhotos: "view_photos",
  view: "view",
} as const;

export type InteractionActionType =
  (typeof INTERACTION_ACTION_TYPES)[keyof typeof INTERACTION_ACTION_TYPES];

export interface RecordInteractionRequest {
  venueId: string;
  actionType: InteractionActionType;
}

export const INTERACTION_ACTION_VALUES = Object.values(
  INTERACTION_ACTION_TYPES,
) as InteractionActionType[];

export const isInteractionActionType = (
  value: string,
): value is InteractionActionType =>
  INTERACTION_ACTION_VALUES.includes(value as InteractionActionType);
