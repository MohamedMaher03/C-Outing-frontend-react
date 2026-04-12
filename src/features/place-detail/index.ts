/**
 * Place Detail Feature — Public API
 */

// Hooks
export { usePlaceDetail } from "./hooks/usePlaceDetail";
export type { UsePlaceDetailReturn } from "./hooks/usePlaceDetail";

// API layer (exposed for advanced usage / testing)
export { placeDetailApi } from "./api/placeDetailApi";

// Mapper layer
export {
  normalizePlaceDetail,
  normalizeReview,
  normalizeSocialReview,
  normalizePaginatedReviews,
  normalizePaginatedSocialReviews,
  normalizeAverageRating,
  normalizeLikeState,
  sanitizeReportPayload,
} from "./mappers/placeDetailMapper";

// Services
export {
  placeDetailService,
  getPlaceById,
  toggleLike,
  getPlaceReviews,
  getSocialMediaReviews,
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
  MetroStation,
  PriceLevel,
  InteractionActionType,
  Review,
  ReviewListParams,
  ReviewListResponse,
  SocialReviewListResponse,
  ReportReviewRequest,
  ReportPayload,
  ReportReason,
  UpdateReviewPayload,
  VenueAverageRating,
  SocialMediaReview,
  RecordInteractionRequest,
} from "./types";
export { REPORT_REASONS } from "./types";

// Components
export { ReviewCard } from "./components/ReviewCard";
export { SocialReviewCard } from "./components/SocialReviewCard";
export { MenuImageGallery } from "./components/MenuImageGallery";
export { AddReviewForm } from "./components/AddReviewForm";
export { ReviewSkeleton } from "./components/ReviewSkeleton";

// Mocks (development use)
export { placeDetailMock } from "./mocks/placeDetailMock";
