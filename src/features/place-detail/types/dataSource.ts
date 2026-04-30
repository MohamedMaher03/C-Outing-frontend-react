import type {
  PlaceDetail,
  Review,
  ReviewListParams,
  ReviewListResponse,
  ReportReviewRequest,
  UpdateReviewPayload,
  VenueAverageRating,
  SocialReviewListResponse,
  RecordInteractionRequest,
} from "./index";

export interface PlaceDetailDataSource {
  getPlaceById: (placeId: string) => Promise<PlaceDetail>;
  toggleLike: (venueId: string) => Promise<boolean | null>;
  getPlaceReviews: (
    venueId: string,
    params?: ReviewListParams,
  ) => Promise<ReviewListResponse>;
  getSocialMediaReviews: (
    venueId: string,
    params?: ReviewListParams,
  ) => Promise<SocialReviewListResponse>;
  submitReview: (
    venueId: string,
    rating: number,
    comment: string,
  ) => Promise<Review>;
  updateReview: (
    reviewId: string,
    payload: UpdateReviewPayload,
  ) => Promise<Review>;
  deleteReview: (reviewId: string) => Promise<void>;
  getReviewById: (reviewId: string) => Promise<Review>;
  getUserReviews: (
    userId: string,
    params?: ReviewListParams,
  ) => Promise<ReviewListResponse>;
  getAverageRating: (venueId: string) => Promise<VenueAverageRating>;
  reportReview: (
    reviewId: string,
    payload: ReportReviewRequest,
  ) => Promise<void>;
  recordInteraction: (payload: RecordInteractionRequest) => Promise<void>;
}
