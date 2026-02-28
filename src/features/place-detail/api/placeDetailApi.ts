/**
 * Place Detail API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 *
 * To switch to mocks during development, swap the import in placeDetailService.ts:
 *   import { placeDetailMock as placeDetailApi } from "../mocks/placeDetailMock";
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { Place } from "@/mocks/mockData";
import type {
  PlaceDetail,
  Review,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "../types";

export const placeDetailApi = {
  /**
   * GET /places/:placeId
   * Fetches full place details.
   */
  async getPlaceById(placeId: string): Promise<PlaceDetail> {
    const { data } = await axiosInstance.get<PlaceDetail>(
      API_ENDPOINTS.places.getById(placeId),
    );
    return data;
  },

  /**
   * GET /places/:placeId/reviews
   * Fetches user-submitted reviews for a place.
   */
  async getPlaceReviews(placeId: string): Promise<Review[]> {
    const { data } = await axiosInstance.get<Review[]>(
      API_ENDPOINTS.places.getReviews(placeId),
    );
    return data;
  },

  /**
   * GET /places/:placeId/social-reviews
   * Fetches scraped social-media reviews for a place.
   */
  async getSocialMediaReviews(placeId: string): Promise<SocialMediaReview[]> {
    const { data } = await axiosInstance.get<SocialMediaReview[]>(
      API_ENDPOINTS.places.getSocialReviews(placeId),
    );
    return data;
  },

  /**
   * GET /places/:placeId/review-summary
   * Fetches the NLP-generated review summary for a place.
   */
  async getReviewSummary(placeId: string): Promise<ReviewSummary> {
    const { data } = await axiosInstance.get<ReviewSummary>(
      API_ENDPOINTS.places.getReviewSummary(placeId),
    );
    return data;
  },

  /**
   * POST /places/:placeId/reviews
   * Submits a new user review for a place.
   */
  async submitReview(
    placeId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    const { data } = await axiosInstance.post<Review>(
      API_ENDPOINTS.places.submitReview(placeId),
      { rating, comment },
    );
    return data;
  },

  /**
   * GET /places/:placeId/similar
   * Fetches places similar to the given one.
   */
  async getSimilarPlaces(placeId: string): Promise<Place[]> {
    const { data } = await axiosInstance.get<Place[]>(
      API_ENDPOINTS.places.getSimilar(placeId),
    );
    return data;
  },

  /**
   * POST /interactions
   * Records a user interaction event (view, click, rate, etc.).
   */
  async recordInteraction(payload: RecordInteractionRequest): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.interactions.record, payload);
  },
};
