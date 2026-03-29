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
import type { PaginatedResponse } from "@/types";
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
} from "../types";
import {
  normalizeAverageRating,
  normalizeLikeState,
  normalizePaginatedReviews,
  normalizePlaceDetail,
  normalizeReview,
  normalizeReviewSummary,
  normalizeSocialReview,
  sanitizeReportPayload,
} from "../mappers/placeDetailMapper";

export const placeDetailApi = {
  /**
   * GET /places/:placeId
   * Fetches full place details.
   */
  async getPlaceById(placeId: string): Promise<PlaceDetail> {
    const { data } = await axiosInstance.get<unknown>(
      API_ENDPOINTS.places.getById(placeId),
    );
    return normalizePlaceDetail(data);
  },

  async toggleLike(venueId: string): Promise<boolean | null> {
    const { data } = await axiosInstance.post<unknown>(
      API_ENDPOINTS.places.toggleLike(venueId),
    );

    return normalizeLikeState(data);
  },

  /**
   * GET /places/:placeId/reviews
   * Fetches user-submitted reviews for a place.
   */
  async getPlaceReviews(
    venueId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    const { data } = await axiosInstance.get<PaginatedResponse<unknown>>(
      API_ENDPOINTS.places.getReviews(venueId),
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
        },
      },
    );
    return normalizePaginatedReviews(data);
  },

  /**
   * GET /places/:placeId/social-reviews
   * Fetches scraped social-media reviews for a place.
   */
  async getSocialMediaReviews(venueId: string): Promise<SocialMediaReview[]> {
    const { data } = await axiosInstance.get<unknown[]>(
      API_ENDPOINTS.places.getSocialReviews(venueId),
    );
    return Array.isArray(data) ? data.map(normalizeSocialReview) : [];
  },

  /**
   * GET /places/:placeId/review-summary
   * Fetches the NLP-generated review summary for a place.
   */
  async getReviewSummary(venueId: string): Promise<ReviewSummary> {
    const { data } = await axiosInstance.get<unknown>(
      API_ENDPOINTS.places.getReviewSummary(venueId),
    );
    return normalizeReviewSummary(data);
  },

  /**
   * POST /places/:placeId/reviews
   * Submits a new user review for a place.
   */
  async submitReview(
    venueId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    const { data } = await axiosInstance.post<unknown>(
      API_ENDPOINTS.places.submitReview,
      {
        venueId,
        rating,
        comment,
      },
    );
    return normalizeReview(data);
  },

  async updateReview(
    reviewId: string,
    payload: UpdateReviewPayload,
  ): Promise<Review> {
    const { data } = await axiosInstance.put<unknown>(
      API_ENDPOINTS.places.editReview(reviewId),
      payload,
    );
    return normalizeReview(data);
  },

  async deleteReview(reviewId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.places.deleteReview(reviewId));
  },

  async getReviewById(reviewId: string): Promise<Review> {
    const { data } = await axiosInstance.get<unknown>(
      API_ENDPOINTS.places.getReviewById(reviewId),
    );
    return normalizeReview(data);
  },

  async getUserReviews(
    userId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    const { data } = await axiosInstance.get<PaginatedResponse<unknown>>(
      API_ENDPOINTS.places.getUserReviews(userId),
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
        },
      },
    );
    return normalizePaginatedReviews(data);
  },

  async getMyReview(venueId: string): Promise<Review | null> {
    const { data } = await axiosInstance.get<unknown>(
      API_ENDPOINTS.places.getMyReview(venueId),
    );

    if (data === null || data === undefined) return null;
    return normalizeReview(data);
  },

  async getAverageRating(venueId: string): Promise<VenueAverageRating> {
    const { data } = await axiosInstance.get<unknown>(
      API_ENDPOINTS.places.getAverageRating(venueId),
    );

    return normalizeAverageRating(venueId, data);
  },

  async reportReview(
    reviewId: string,
    payload: ReportReviewRequest,
  ): Promise<void> {
    const normalizedPayload = sanitizeReportPayload(payload);
    await axiosInstance.post(API_ENDPOINTS.places.reportReview(reviewId), {
      reason: normalizedPayload.reason,
      description: normalizedPayload.description,
    });
  },

  /**
   * GET /places/:placeId/similar
   * Fetches places similar to the given one.
   */
  // async getSimilarPlaces(placeId: string): Promise<Place[]> {
  //   const { data } = await axiosInstance.get<Place[]>(
  //     API_ENDPOINTS.places.getSimilar(placeId),
  //   );
  //   return data;
  // },

  /**
   * POST /interactions
   * Records a user interaction event (view, click, rate, etc.).
   */
  async recordInteraction(payload: RecordInteractionRequest): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.interactions.record, payload);
  },
};
