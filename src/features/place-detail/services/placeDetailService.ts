import { placeDetailDataSource } from "./placeDetailDataSource";
import { getCurrentAuthUserProfile } from "../utils/authUser";
import type {
  PlaceDetail,
  Review,
  ReviewListParams,
  ReviewListResponse,
  SocialReviewListResponse,
  ReportReviewRequest,
  UpdateReviewPayload,
  VenueAverageRating,
  RecordInteractionRequest,
} from "@/features/place-detail/types";

export type {
  PlaceDetail,
  Review,
  ReviewListParams,
  ReviewListResponse,
  SocialReviewListResponse,
  ReportReviewRequest,
  UpdateReviewPayload,
  VenueAverageRating,
  RecordInteractionRequest,
} from "@/features/place-detail/types";

const enrichReviewForImmediateUi = (
  review: Review,
  fallback: {
    venueId?: string;
    venueName?: string;
    rating?: number;
    comment?: string;
  },
): Review => {
  const authUser = getCurrentAuthUserProfile();

  return {
    ...review,
    venueId: review.venueId || fallback.venueId || "",
    venueName: review.venueName || fallback.venueName || "",
    userId:
      review.userId === "unknown-user"
        ? (authUser.userId ?? review.userId)
        : review.userId,
    userName:
      review.userName === "Anonymous"
        ? (authUser.userName ?? review.userName)
        : review.userName,
    userAvatar: review.userAvatar ?? authUser.userAvatar,
    rating:
      review.rating === 0
        ? Math.max(1, Math.min(5, Math.round(fallback.rating ?? 0)))
        : review.rating,
    comment:
      review.comment.trim().length === 0
        ? (fallback.comment?.trim() ?? review.comment)
        : review.comment,
  };
};

export const placeDetailService = {
  async getPlaceById(placeId: string): Promise<PlaceDetail> {
    return placeDetailDataSource.getPlaceById(placeId);
  },

  async toggleLike(venueId: string): Promise<boolean | null> {
    return placeDetailDataSource.toggleLike(venueId);
  },

  async getPlaceReviews(
    placeId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    return placeDetailDataSource.getPlaceReviews(placeId, params);
  },

  async getSocialMediaReviews(
    placeId: string,
    params?: ReviewListParams,
  ): Promise<SocialReviewListResponse> {
    return placeDetailDataSource.getSocialMediaReviews(placeId, params);
  },

  async submitReview(
    placeId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    const review = await placeDetailDataSource.submitReview(
      placeId,
      rating,
      comment,
    );
    return enrichReviewForImmediateUi(review, {
      venueId: placeId,
      venueName: "",
      rating,
      comment,
    });
  },

  async updateReview(
    reviewId: string,
    payload: UpdateReviewPayload,
  ): Promise<Review> {
    const review = await placeDetailDataSource.updateReview(reviewId, payload);
    return enrichReviewForImmediateUi(review, {
      rating: payload.rating ?? undefined,
      comment: payload.comment ?? undefined,
    });
  },

  async deleteReview(reviewId: string): Promise<void> {
    await placeDetailDataSource.deleteReview(reviewId);
  },

  async getReviewById(reviewId: string): Promise<Review> {
    return placeDetailDataSource.getReviewById(reviewId);
  },

  async getUserReviews(
    userId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    return placeDetailDataSource.getUserReviews(userId, params);
  },

  async getMyReview(venueId: string): Promise<Review | null> {
    return placeDetailDataSource.getMyReview(venueId);
  },

  async getAverageRating(venueId: string): Promise<VenueAverageRating> {
    return placeDetailDataSource.getAverageRating(venueId);
  },

  async reportReview(
    reviewId: string,
    payload: ReportReviewRequest,
  ): Promise<void> {
    await placeDetailDataSource.reportReview(reviewId, payload);
  },

  async recordInteraction(data: RecordInteractionRequest): Promise<void> {
    try {
      await placeDetailDataSource.recordInteraction(data);
    } catch {
      // Non-critical — swallow so the UI is not affected
    }
  },
};

export const getPlaceById = placeDetailService.getPlaceById;
export const toggleLike = placeDetailService.toggleLike;
export const getPlaceReviews = placeDetailService.getPlaceReviews;
export const getSocialMediaReviews = placeDetailService.getSocialMediaReviews;
export const submitReview = placeDetailService.submitReview;
export const updateReview = placeDetailService.updateReview;
export const deleteReview = placeDetailService.deleteReview;
export const getReviewById = placeDetailService.getReviewById;
export const getUserReviews = placeDetailService.getUserReviews;
export const getMyReview = placeDetailService.getMyReview;
export const getAverageRating = placeDetailService.getAverageRating;
export const reportReview = placeDetailService.reportReview;
export const recordInteraction = placeDetailService.recordInteraction;
