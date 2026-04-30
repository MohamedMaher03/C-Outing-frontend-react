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
  SocialReviewListResponse,
  RecordInteractionRequest,
} from "../types";
import {
  normalizeAverageRating,
  normalizeLikeState,
  normalizePaginatedReviews,
  normalizePaginatedSocialReviews,
  normalizePlaceDetail,
  normalizeReview,
  sanitizeReportPayload,
} from "../mappers/placeDetailMapper";

const resolvePageIndex = (params?: ReviewListParams): number => {
  if (
    typeof params?.pageIndex === "number" &&
    Number.isFinite(params.pageIndex)
  ) {
    return Math.max(0, Math.floor(params.pageIndex));
  }

  if (typeof params?.page === "number" && Number.isFinite(params.page)) {
    return Math.max(0, Math.floor(params.page) - 1);
  }

  return 0;
};

const buildPaginationParams = (params?: ReviewListParams) => {
  const pageIndex = resolvePageIndex(params);
  return {
    pageIndex,
    page: pageIndex + 1,
    pageSize: params?.pageSize ?? 10,
  };
};

export const placeDetailApi = {
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

  async getPlaceReviews(
    venueId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    const { data } = await axiosInstance.get<PaginatedResponse<unknown>>(
      API_ENDPOINTS.places.getReviews(venueId),
      {
        params: buildPaginationParams(params),
      },
    );
    return normalizePaginatedReviews(data);
  },

  async getSocialMediaReviews(
    venueId: string,
    params?: ReviewListParams,
  ): Promise<SocialReviewListResponse> {
    const { data } = await axiosInstance.get<PaginatedResponse<unknown>>(
      API_ENDPOINTS.places.getSocialReviews(venueId),
      {
        params: buildPaginationParams(params),
      },
    );
    return normalizePaginatedSocialReviews(data);
  },

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
        params: buildPaginationParams(params),
      },
    );
    return normalizePaginatedReviews(data);
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

  async recordInteraction(payload: RecordInteractionRequest): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.interactions.record, {
      venueId: payload.venueId,
      actionType: payload.actionType,
    });
  },
};
