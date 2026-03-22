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
  getDefaultAvatarDataUrl,
  getDefaultVenueImageDataUrl,
} from "../utils/defaultImages";
import { getReviewIdentity } from "../utils/reviewIdentity";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const asNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
};

const asBoolean = (...values: unknown[]): boolean | undefined => {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return undefined;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const toDate = (value: unknown): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return new Date();
};

const clampRating = (...values: unknown[]): number => {
  const rating = asNumber(...values);
  if (rating === undefined) return 0;
  return Math.max(1, Math.min(5, Math.round(rating)));
};

const toPriceLevel = (raw: unknown): PlaceDetail["priceLevel"] => {
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (
      normalized === "price_cheapest" ||
      normalized === "cheap" ||
      normalized === "mid_range" ||
      normalized === "expensive" ||
      normalized === "luxury"
    ) {
      return normalized;
    }
  }

  const numeric = asNumber(raw);
  if (numeric === undefined) return undefined;

  if (numeric <= 1) return "price_cheapest";
  if (numeric <= 2) return "cheap";
  if (numeric <= 3) return "mid_range";
  if (numeric <= 4) return "expensive";
  return "luxury";
};

const normalizeSocialBadges = (
  raw: unknown,
): Array<"Good for Solo" | "Good for Couples" | "Good for Groups"> => {
  const allowed = new Set([
    "good for solo",
    "good for couples",
    "good for groups",
  ]);

  return Array.from(
    new Set(
      asStringArray(raw)
        .map((badge) => badge.toLowerCase())
        .filter((badge) => allowed.has(badge))
        .map((badge) => {
          if (badge === "good for solo") return "Good for Solo";
          if (badge === "good for couples") return "Good for Couples";
          return "Good for Groups";
        }),
    ),
  );
};

const normalizeSeatingType = (raw: unknown): Array<"indoor" | "outdoor"> =>
  Array.from(
    new Set(
      asStringArray(raw)
        .map((seat) => seat.toLowerCase())
        .filter((seat) => seat === "indoor" || seat === "outdoor")
        .map((seat) => (seat === "outdoor" ? "outdoor" : "indoor")),
    ),
  );

const normalizePlaceDetail = (raw: unknown): PlaceDetail => {
  const data = isRecord(raw) ? raw : {};
  const location = isRecord(data.location) ? data.location : undefined;

  const venueName = asString(data.name, data.title) ?? "Unknown Place";

  const imageUrls = asStringArray(data.imageUrls);
  const displayImageUrl = asString(data.displayImageUrl);
  const selectedImage =
    asString(
      displayImageUrl,
      imageUrls[0],
      data.image,
      data.imageUrl,
      data.thumbnailUrl,
      data.coverImage,
    ) ?? getDefaultVenueImageDataUrl(venueName);

  const resolvedAddress =
    asString(data.location, data.address, location?.address) ?? "";

  const numericPriceRange = asNumber(data.priceRange);
  const normalizedPriceRange =
    asString(data.priceRange_Display, data.priceRange) ??
    (numericPriceRange !== undefined ? String(numericPriceRange) : undefined);

  const normalizedReviews = Array.isArray(data.reviews)
    ? data.reviews.map(normalizeReview)
    : [];

  return {
    id: asString(data.id, data.venueId) ?? "",
    name: venueName,
    category: asString(data.category, data.type) ?? "Uncategorized",
    latitude:
      asNumber(data.latitude, data.lat, location?.latitude, location?.lat) ?? 0,
    longitude:
      asNumber(
        data.longitude,
        data.lng,
        data.lon,
        location?.longitude,
        location?.lng,
      ) ?? 0,
    location: resolvedAddress,
    address: resolvedAddress,
    district: asString(data.district),
    type: asString(data.type),
    rating: asNumber(data.rating, data.averageRating) ?? 0,
    averageRating: asNumber(data.averageRating, data.rating) ?? 0,
    reviewCount: Math.max(
      0,
      Math.round(
        asNumber(data.reviewCount, data.ratingCount, data.totalReviews) ?? 0,
      ),
    ),
    totalReviews: Math.max(
      0,
      Math.round(
        asNumber(data.totalReviews, data.reviewCount, data.ratingCount) ?? 0,
      ),
    ),
    likeCount: Math.max(0, Math.round(asNumber(data.likeCount) ?? 0)),
    description: asString(data.description, data.about) ?? "",
    image: selectedImage,
    displayImageUrl: displayImageUrl ?? selectedImage,
    imageUrls,
    createdAt: asString(data.createdAt),
    phone: asString(data.phone, data.phoneNumber),
    website: asString(data.website, data.websiteUrl),
    menuUrl: asString(data.menuUrl, data.menuLink),
    bookingUrl: asString(data.bookingUrl, data.bookingLink),
    priceRange: normalizedPriceRange,
    priceRangeDisplay: asString(data.priceRange_Display),
    priceLevel: toPriceLevel(data.priceRange ?? data.priceLevel),
    hours: asString(data.hours, data.openingHours),
    isOpen: asBoolean(data.isOpen),
    atmosphereTags: asStringArray(data.atmosphereTags),
    socialBadges: normalizeSocialBadges(data.socialBadges),
    hasWifi: asBoolean(data.hasWifi),
    hasToilet: asBoolean(data.hasToilet),
    seatingType: normalizeSeatingType(data.seatingType),
    parkingAvailable: asBoolean(data.parkingAvailable),
    accessibilityScore: asNumber(data.accessibilityScore),
    menuImagesCount: asNumber(data.menuImagesCount),
    menuImagesUrls: asStringArray(data.menuImagesUrls),
    isSaved: asBoolean(data.isSaved, data.isFavorited),
    isFavorited: asBoolean(data.isFavorited, data.isSaved),
    isLiked: asBoolean(data.isLiked),
    matchScore: asNumber(data.matchScore),
    reviews: normalizedReviews,
  };
};

const normalizeReview = (raw: unknown): Review => {
  const data = isRecord(raw) ? raw : {};
  const createdAt = toDate(data.createdAt ?? data.date ?? data.updatedAt);
  const updatedAt = toDate(data.updatedAt ?? data.createdAt ?? data.date);

  return {
    id: asString(data.id, data.reviewId),
    reviewId: asString(data.reviewId, data.id),
    venueId: asString(data.venueId) ?? "",
    venueName: asString(data.venueName, data.placeName, data.venueTitle) ?? "",
    userId:
      asString(data.userId, data.authorId, data.reviewerId) ?? "unknown-user",
    userName:
      asString(data.userName, data.authorName, data.reviewerName) ??
      "Anonymous",
    userAvatar:
      asString(data.userAvatar, data.avatarUrl, data.authorAvatar) ??
      getDefaultAvatarDataUrl(
        asString(data.userName, data.authorName, data.reviewerName) ??
          "Anonymous",
      ),
    rating: clampRating(data.rating, data.stars),
    comment: asString(data.comment, data.content, data.reviewText) ?? "",
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

const normalizeSocialReview = (raw: unknown): SocialMediaReview => {
  const data = isRecord(raw) ? raw : {};

  const platform = asString(data.platform, data.source)?.toLowerCase();
  const normalizedPlatform: SocialMediaReview["platform"] =
    platform === "instagram" ||
    platform === "twitter" ||
    platform === "facebook" ||
    platform === "tiktok" ||
    platform === "google"
      ? platform
      : "google";

  const sentiment = asString(data.sentiment)?.toLowerCase();
  const normalizedSentiment: SocialMediaReview["sentiment"] =
    sentiment === "positive" ||
    sentiment === "neutral" ||
    sentiment === "negative"
      ? sentiment
      : "neutral";

  return {
    id: asString(data.id, data.reviewId) ?? `social_${Date.now()}`,
    platform: normalizedPlatform,
    author: asString(data.author, data.authorName, data.userName) ?? "Unknown",
    authorAvatar: asString(data.authorAvatar, data.avatarUrl),
    content: asString(data.content, data.comment, data.text) ?? "",
    sentiment: normalizedSentiment,
    date: toDate(data.date ?? data.createdAt),
    likes: asNumber(data.likes, data.likeCount),
    url: asString(data.url, data.link),
  };
};

const normalizeReviewSummary = (raw: unknown): ReviewSummary => {
  const data = isRecord(raw) ? raw : {};

  const sentiment = asString(
    data.overallSentiment,
    data.sentiment,
  )?.toLowerCase();
  const overallSentiment: ReviewSummary["overallSentiment"] =
    sentiment === "positive" ||
    sentiment === "neutral" ||
    sentiment === "negative"
      ? sentiment
      : "neutral";

  const rawTopics = Array.isArray(data.commonTopics) ? data.commonTopics : [];

  return {
    overallSentiment,
    averageRating: asNumber(data.averageRating, data.avgRating) ?? 0,
    totalReviews: Math.max(
      0,
      Math.round(asNumber(data.totalReviews, data.reviewsCount) ?? 0),
    ),
    summary: asString(data.summary, data.description) ?? "",
    highlights: asStringArray(data.highlights),
    commonTopics: rawTopics
      .filter((topic): topic is Record<string, unknown> => isRecord(topic))
      .map((topic) => {
        const topicSentiment = asString(topic.sentiment)?.toLowerCase();
        return {
          topic: asString(topic.topic, topic.name) ?? "General",
          count: Math.max(
            0,
            Math.round(asNumber(topic.count, topic.mentions) ?? 0),
          ),
          sentiment:
            topicSentiment === "positive" ||
            topicSentiment === "neutral" ||
            topicSentiment === "negative"
              ? topicSentiment
              : "neutral",
        };
      }),
  };
};

const normalizePaginatedReviews = (raw: unknown): ReviewListResponse => {
  if (Array.isArray(raw)) {
    return {
      items: raw.map(normalizeReview),
      pageIndex: 1,
      pageSize: raw.length,
      totalCount: raw.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  if (!isRecord(raw)) {
    return {
      items: [],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const itemsRaw = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.data)
      ? raw.data
      : [];
  const items = itemsRaw.map(normalizeReview);
  const uniqueItems = Array.from(
    new Map(
      items.map((review) => [getReviewIdentity(review), review]),
    ).values(),
  );

  const pageIndex = Math.max(
    1,
    Math.round(asNumber(raw.pageIndex, raw.page, raw.currentPage) ?? 1),
  );
  const fallbackPageSize = uniqueItems.length > 0 ? uniqueItems.length : 10;
  const pageSize = Math.max(
    1,
    Math.round(asNumber(raw.pageSize, raw.size, raw.limit) ?? fallbackPageSize),
  );
  const totalCount = Math.max(
    uniqueItems.length,
    Math.round(
      asNumber(raw.totalCount, raw.count, raw.total) ?? uniqueItems.length,
    ),
  );
  const totalPages = Math.max(
    1,
    Math.round(
      asNumber(raw.totalPages, raw.pages) ?? Math.ceil(totalCount / pageSize),
    ),
  );

  return {
    items: uniqueItems,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: asBoolean(raw.hasPreviousPage) ?? pageIndex > 1,
    hasNextPage: asBoolean(raw.hasNextPage) ?? pageIndex < totalPages,
  };
};

const normalizeAverageRating = (
  venueId: string,
  raw: unknown,
): VenueAverageRating => {
  if (typeof raw === "number") {
    return { venueId, averageRating: raw };
  }

  if (!isRecord(raw)) {
    return { venueId, averageRating: 0 };
  }

  return {
    venueId: asString(raw.venueId) ?? venueId,
    averageRating: asNumber(raw.averageRating, raw.rating) ?? 0,
  };
};

const normalizeLikeState = (raw: unknown): boolean | null => {
  if (typeof raw === "boolean") return raw;
  if (!isRecord(raw)) return null;

  const state = asBoolean(raw.isLiked, raw.liked, raw.value, raw.result);
  return state ?? null;
};

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
    const reason = payload.reason.trim();
    if (reason.length < 5 || reason.length > 100) {
      throw new Error("Report reason must be between 5 and 100 characters");
    }

    const description = payload.description?.trim() ?? "";
    if (description.length > 500) {
      throw new Error("Report description must be 500 characters or less");
    }

    await axiosInstance.post(API_ENDPOINTS.places.reportReview(reviewId), {
      reason,
      description: description.length > 0 ? description : null,
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
