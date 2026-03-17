/**
 * Place Detail Service — Business Logic Layer
 *
 * Sits between hooks/components and the HTTP layer (placeDetailApi).
 * Responsibilities:
 *   • Call placeDetailApi functions
 *   • Transform DTOs to UI models if needed
 *   • Centralise error handling
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  usePlaceDetail  →  placeDetailService  →  placeDetailApi  →  axios │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * 🔧 To use mocks during development, swap the import:
 *   import { placeDetailMock as placeDetailApi } from "../mocks/placeDetailMock";
 */

import { placeDetailApi } from "../api/placeDetailApi"; // (WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
//import { placeDetailMock as placeDetailApi } from "../mocks/placeDetailMock";
import { isApiError } from "@/utils/apiError";
import type {
  PlaceDetail,
  Review,
  ReviewListParams,
  ReviewListResponse,
  ReportReviewRequest,
  UpdateReviewPayload,
  VenueAverageRating,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "@/features/place-detail/types";

// Re-export types for consumers that import from this service
export type {
  PlaceDetail,
  Review,
  ReviewListParams,
  ReviewListResponse,
  ReportReviewRequest,
  UpdateReviewPayload,
  VenueAverageRating,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "@/features/place-detail/types";

const asString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const getCurrentAuthUser = (): {
  userId?: string;
  userName?: string;
  userAvatar?: string;
} => {
  try {
    const rawUser = localStorage.getItem("authUser");
    if (!rawUser) return {};

    const parsed = JSON.parse(rawUser) as Record<string, unknown>;
    return {
      userId: asString(parsed.userId),
      userName: asString(parsed.name),
      userAvatar: asString(parsed.avatar, parsed.avatarUrl, parsed.imageUrl),
    };
  } catch {
    return {};
  }
};

const enrichReviewForImmediateUi = (
  review: Review,
  fallback: {
    venueId?: string;
    venueName?: string;
    rating?: number;
    comment?: string;
  },
): Review => {
  const authUser = getCurrentAuthUser();

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

// ── Place Detail Service ─────────────────────────────────────

export const placeDetailService = {
  /**
   * Fetch place details by ID.
   */
  async getPlaceById(placeId: string): Promise<PlaceDetail> {
    try {
      return await placeDetailApi.getPlaceById(placeId);
    } catch (error) {
      console.error("Error fetching place details:", error);
      throw new Error("Failed to load place details");
    }
  },

  /**
   * Fetch user reviews for a place (from the website).
   */
  async getPlaceReviews(
    placeId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    try {
      return await placeDetailApi.getPlaceReviews(placeId, params);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw new Error("Failed to load reviews");
    }
  },

  /**
   * Fetch social media reviews (from scraping) for a place.
   */
  async getSocialMediaReviews(placeId: string): Promise<SocialMediaReview[]> {
    try {
      return await placeDetailApi.getSocialMediaReviews(placeId);
    } catch (error) {
      console.error("Error fetching social reviews:", error);
      throw new Error("Failed to load social reviews");
    }
  },

  /**
   * Fetch NLP-generated review summary for a place.
   */
  async getReviewSummary(placeId: string): Promise<ReviewSummary> {
    try {
      return await placeDetailApi.getReviewSummary(placeId);
    } catch (error) {
      console.error("Error fetching review summary:", error);
      throw new Error("Failed to load review summary");
    }
  },

  /**
   * Submit a review for a place.
   */
  async submitReview(
    placeId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    try {
      const review = await placeDetailApi.submitReview(
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
    } catch (error) {
      console.error("Error submitting review:", error);
      throw new Error("Failed to submit review");
    }
  },

  async updateReview(
    reviewId: string,
    payload: UpdateReviewPayload,
  ): Promise<Review> {
    try {
      const review = await placeDetailApi.updateReview(reviewId, payload);
      return enrichReviewForImmediateUi(review, {
        rating: payload.rating ?? undefined,
        comment: payload.comment ?? undefined,
      });
    } catch (error) {
      console.error("Error updating review:", error);
      throw new Error("Failed to update review");
    }
  },

  async deleteReview(reviewId: string): Promise<void> {
    try {
      await placeDetailApi.deleteReview(reviewId);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw new Error("Failed to delete review");
    }
  },

  async getReviewById(reviewId: string): Promise<Review> {
    try {
      return await placeDetailApi.getReviewById(reviewId);
    } catch (error) {
      console.error("Error fetching review:", error);
      throw new Error("Failed to load review");
    }
  },

  async getUserReviews(
    userId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    try {
      return await placeDetailApi.getUserReviews(userId, params);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      throw new Error("Failed to load user reviews");
    }
  },

  async getMyReview(venueId: string): Promise<Review | null> {
    try {
      return await placeDetailApi.getMyReview(venueId);
    } catch (error) {
      if (isApiError(error) && error.statusCode === 404) {
        return null;
      }
      console.error("Error fetching my review:", error);
      throw new Error("Failed to load your review");
    }
  },

  async getAverageRating(venueId: string): Promise<VenueAverageRating> {
    try {
      return await placeDetailApi.getAverageRating(venueId);
    } catch (error) {
      console.error("Error fetching average rating:", error);
      throw new Error("Failed to load average rating");
    }
  },

  async reportReview(
    reviewId: string,
    payload: ReportReviewRequest,
  ): Promise<void> {
    try {
      await placeDetailApi.reportReview(reviewId, payload);
    } catch (error) {
      console.error("Error reporting review:", error);
      throw new Error("Failed to submit report");
    }
  },

  /**
   * Record a user interaction event.
   */
  async recordInteraction(data: RecordInteractionRequest): Promise<void> {
    try {
      await placeDetailApi.recordInteraction(data);
    } catch (error) {
      console.error("Error recording interaction:", error);
      // Non-critical — swallow so the UI is not affected
    }
  },
};

// ── Legacy named exports (keep backward compatibility with hooks) ──

export const getPlaceById = placeDetailService.getPlaceById;
export const getPlaceReviews = placeDetailService.getPlaceReviews;
export const getSocialMediaReviews = placeDetailService.getSocialMediaReviews;
export const getReviewSummary = placeDetailService.getReviewSummary;
export const submitReview = placeDetailService.submitReview;
export const updateReview = placeDetailService.updateReview;
export const deleteReview = placeDetailService.deleteReview;
export const getReviewById = placeDetailService.getReviewById;
export const getUserReviews = placeDetailService.getUserReviews;
export const getMyReview = placeDetailService.getMyReview;
export const getAverageRating = placeDetailService.getAverageRating;
export const reportReview = placeDetailService.reportReview;
export const recordInteraction = placeDetailService.recordInteraction;
