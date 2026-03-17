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

const normalizePlaceDetail = (raw: unknown): PlaceDetail => {
  const data = isRecord(raw) ? raw : {};
  const location = isRecord(data.location) ? data.location : undefined;

  const socialBadgesRaw = Array.isArray(data.socialBadges)
    ? data.socialBadges
    : [];

  const socialBadges = socialBadgesRaw.filter(
    (
      badge,
    ): badge is "Good for Solo" | "Good for Couples" | "Good for Groups" =>
      badge === "Good for Solo" ||
      badge === "Good for Couples" ||
      badge === "Good for Groups",
  );

  const seatingTypeRaw = Array.isArray(data.seatingType)
    ? data.seatingType
    : [];
  const seatingType = seatingTypeRaw.filter(
    (seat): seat is "indoor" | "outdoor" =>
      seat === "indoor" || seat === "outdoor",
  );

  return {
    id: asString(data.id, data.venueId) ?? "",
    name: asString(data.name, data.title) ?? "Unknown Place",
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
    address: asString(data.address, location?.address) ?? "",
    rating: asNumber(data.rating, data.averageRating) ?? 0,
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
    description: asString(data.description, data.about) ?? "",
    image:
      asString(data.image, data.imageUrl, data.thumbnailUrl, data.coverImage) ??
      "",
    phone: asString(data.phone, data.phoneNumber),
    website: asString(data.website, data.websiteUrl),
    menuUrl: asString(data.menuUrl, data.menuLink),
    bookingUrl: asString(data.bookingUrl, data.bookingLink),
    priceRange: asString(data.priceRange),
    priceLevel:
      (asString(data.priceLevel) as
        | "price_cheapest"
        | "cheap"
        | "mid_range"
        | "expensive"
        | "luxury"
        | undefined) ?? undefined,
    hours: asString(data.hours, data.openingHours),
    isOpen: asBoolean(data.isOpen),
    atmosphereTags: asStringArray(data.atmosphereTags),
    socialBadges,
    hasWifi: asBoolean(data.hasWifi),
    hasToilet: asBoolean(data.hasToilet),
    seatingType,
    parkingAvailable: asBoolean(data.parkingAvailable),
    accessibilityScore: asNumber(data.accessibilityScore),
    menuImagesCount: asNumber(data.menuImagesCount),
    menuImagesUrls: asStringArray(data.menuImagesUrls),
    isSaved: asBoolean(data.isSaved),
    matchScore: asNumber(data.matchScore),
  };
};

const normalizeReview = (raw: unknown): Review => {
  const data = isRecord(raw) ? raw : {};
  const createdAt = toDate(data.createdAt ?? data.date ?? data.updatedAt);
  const updatedAt = toDate(data.updatedAt ?? data.createdAt ?? data.date);

  return {
    reviewId: asString(data.reviewId, data.id),
    venueId: asString(data.venueId) ?? "",
    venueName: asString(data.venueName, data.placeName, data.venueTitle) ?? "",
    userId:
      asString(data.userId, data.authorId, data.reviewerId) ?? "unknown-user",
    userName:
      asString(data.userName, data.authorName, data.reviewerName) ??
      "Anonymous",
    userAvatar: asString(data.userAvatar, data.avatarUrl, data.authorAvatar),
    rating: clampRating(data.rating, data.stars),
    comment: asString(data.comment, data.content, data.reviewText) ?? "",
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
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

const getReviewIdentity = (review: Review): string => {
  if (review.reviewId && review.reviewId.trim().length > 0) {
    return `id:${review.reviewId}`;
  }

  return `k:${review.venueId}:${review.userId}:${review.createdAt}`;
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
    return enrichReviewForImmediateUi(normalizeReview(data), {
      venueId,
      venueName: "",
      rating,
      comment,
    });
  },

  async updateReview(
    reviewId: string,
    payload: UpdateReviewPayload,
  ): Promise<Review> {
    const { data } = await axiosInstance.put<unknown>(
      API_ENDPOINTS.places.editReview(reviewId),
      payload,
    );

    return enrichReviewForImmediateUi(normalizeReview(data), {
      rating: payload.rating ?? undefined,
      comment: payload.comment ?? undefined,
    });
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
    await axiosInstance.post(API_ENDPOINTS.places.reportReview(reviewId), {
      reason: payload.reason,
      description: payload.description?.trim() || undefined,
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
