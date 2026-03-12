/**
 * Place Detail Mock Implementations
 *
 * Drop-in replacement for placeDetailApi — mirrors the same interface so it
 * can be swapped in placeDetailService.ts without changing any other code:
 *
 *   // placeDetailService.ts — swap this one line:
 *   import { placeDetailMock as placeDetailApi } from "../mocks/placeDetailMock";
 *
 * Simulates realistic network latency and returns data from local mock stores.
 */

import { PLACES } from "@/mocks/mockData";
import type { Place } from "@/mocks/mockData";
import type {
  PlaceDetail,
  Review,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "../types";
import {
  MOCK_REVIEWS,
  MOCK_SOCIAL_REVIEWS,
  MOCK_REVIEW_SUMMARIES,
  DEFAULT_REVIEWS,
  DEFAULT_SOCIAL_REVIEWS,
  DEFAULT_REVIEW_SUMMARY,
} from "./index";

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock Place Detail API ────────────────────────────────────
// Interface intentionally mirrors placeDetailApi so they are interchangeable.

export const placeDetailMock = {
  /**
   * Mock GET /places/:placeId
   */
  async getPlaceById(placeId: string): Promise<PlaceDetail> {
    await delay(500);

    const place = PLACES.find((p) => p.id === placeId);
    if (!place) throw new Error("Place not found");

    return { ...place };
  },

  /**
   * Mock GET /places/:placeId/reviews
   */
  async getPlaceReviews(placeId: string): Promise<Review[]> {
    await delay(400);
    return MOCK_REVIEWS[placeId] || DEFAULT_REVIEWS;
  },

  /**
   * Mock GET /places/:placeId/social-reviews
   */
  async getSocialMediaReviews(placeId: string): Promise<SocialMediaReview[]> {
    await delay(600);
    return MOCK_SOCIAL_REVIEWS[placeId] || DEFAULT_SOCIAL_REVIEWS;
  },

  /**
   * Mock GET /places/:placeId/review-summary
   */
  async getReviewSummary(placeId: string): Promise<ReviewSummary> {
    await delay(800);
    return MOCK_REVIEW_SUMMARIES[placeId] || DEFAULT_REVIEW_SUMMARY;
  },

  /**
   * Mock POST /places/:placeId/reviews
   */
  async submitReview(
    placeId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    await delay(500);

    const mockReview: Review = {
      id: `review_${Date.now()}`,
      userId: "user_1",
      userName: "Current User",
      rating,
      comment,
      date: new Date(),
    };

    if (!MOCK_REVIEWS[placeId]) {
      MOCK_REVIEWS[placeId] = [];
    }
    MOCK_REVIEWS[placeId].unshift(mockReview);

    console.log("[Mock] Review submitted for place:", placeId, mockReview);
    return mockReview;
  },

  /**
   * Mock GET /places/:placeId/similar
   */
  async getSimilarPlaces(placeId: string): Promise<Place[]> {
    await delay(500);
    return PLACES.filter((p) => p.id !== placeId).slice(0, 3);
  },

  /**
   * Mock POST /interactions
   */
  async recordInteraction(payload: RecordInteractionRequest): Promise<void> {
    await delay(100);
    console.log("[Mock] Interaction recorded:", payload);
  },
};
