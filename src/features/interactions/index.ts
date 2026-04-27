export {
  INTERACTION_ACTION_TYPES,
  INTERACTION_ACTION_VALUES,
  isInteractionActionType,
} from "./types";
export type { InteractionActionType, RecordInteractionRequest } from "./types";

export {
  interactionsService,
  recordInteraction,
  recordInteractionSafe,
  trackVenueInteractionSafe,
} from "./services/interactionsService";
