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

// import { placeDetailApi } from "../api/placeDetailApi"; // (WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
import { placeDetailMock as placeDetailApi } from "../mocks/placeDetailMock";
import type { Place } from "@/mocks/mockData";
import type {
  PlaceDetail,
  Review,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "@/features/place-detail/types";

// Re-export types for consumers that import from this service
export type {
  PlaceDetail,
  Review,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "@/features/place-detail/types";

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
  async getPlaceReviews(placeId: string): Promise<Review[]> {
    try {
      return await placeDetailApi.getPlaceReviews(placeId);
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
      return await placeDetailApi.submitReview(placeId, rating, comment);
    } catch (error) {
      console.error("Error submitting review:", error);
      throw new Error("Failed to submit review");
    }
  },

  /**
   * Get similar places based on the current place.
   */
  async getSimilarPlaces(placeId: string): Promise<Place[]> {
    try {
      return await placeDetailApi.getSimilarPlaces(placeId);
    } catch (error) {
      console.error("Error fetching similar places:", error);
      throw new Error("Failed to load similar places");
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
export const getSimilarPlaces = placeDetailService.getSimilarPlaces;
export const recordInteraction = placeDetailService.recordInteraction;
