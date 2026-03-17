/**
 * Place Detail Feature — Public API
 */

// Hooks
export { usePlaceDetail } from "./hooks/usePlaceDetail";
export type { UsePlaceDetailReturn } from "./hooks/usePlaceDetail";

// API layer (exposed for advanced usage / testing)
export { placeDetailApi } from "./api/placeDetailApi";

// Services
export {
  placeDetailService,
  getPlaceById,
  getPlaceReviews,
  getSocialMediaReviews,
  getReviewSummary,
  recordInteraction,
  submitReview,
  updateReview,
  deleteReview,
  getReviewById,
  getUserReviews,
  getMyReview,
  getAverageRating,
  reportReview,
} from "./services/placeDetailService";
export { favoriteAdapter } from "./services/favoriteAdapter";

// Types
export type {
  PlaceDetail,
  PlaceBase,
  PriceLevel,
  InteractionActionType,
  Review,
  ReviewListParams,
  ReviewListResponse,
  ReportReviewRequest,
  ReportPayload,
  ReportReason,
  UpdateReviewPayload,
  VenueAverageRating,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "./types";
export { REPORT_REASONS } from "./types";

// Components
export { ReviewCard } from "./components/ReviewCard";
export { SocialReviewCard } from "./components/SocialReviewCard";
export { ReviewSummarySection } from "./components/ReviewSummarySection";
export { AddReviewForm } from "./components/AddReviewForm";
export { ReviewSkeleton } from "./components/ReviewSkeleton";

// Mocks (development use)
export { placeDetailMock } from "./mocks/placeDetailMock";
