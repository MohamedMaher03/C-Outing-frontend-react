import type {
  PlaceDetail,
  MetroStation,
  Review,
  ReviewListResponse,
  SocialReviewListResponse,
  VenueAverageRating,
  SocialMediaReview,
  ReviewSummary,
  ReportReviewRequest,
} from "../types";
import {
  getDefaultAvatarDataUrl,
  getDefaultVenueImageDataUrl,
} from "../utils/defaultImages";
import { getReviewIdentity } from "../utils/reviewIdentity";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const unwrapApiData = (raw: unknown, maxDepth = 3): unknown => {
  let current: unknown = raw;
  let depth = 0;

  while (
    depth < maxDepth &&
    isRecord(current) &&
    Object.prototype.hasOwnProperty.call(current, "data")
  ) {
    const next = current.data;
    if (next === undefined || next === null) {
      break;
    }

    current = next;
    depth += 1;
  }

  return current;
};

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
    const collapsed = normalized.replace(/[\s_-]+/g, "");

    if (collapsed === "pricecheapest" || collapsed === "cheapest") {
      return "cheapest";
    }

    if (
      collapsed === "cheap" ||
      collapsed === "budget" ||
      collapsed === "low"
    ) {
      return "cheap";
    }

    if (
      collapsed === "midrange" ||
      collapsed === "medium" ||
      collapsed === "moderate"
    ) {
      return "midrange";
    }

    if (
      collapsed === "expensive" ||
      collapsed === "premium" ||
      collapsed === "high"
    ) {
      return "expensive";
    }

    if (collapsed === "luxury") {
      return "luxury";
    }
  }

  const numeric = asNumber(raw);
  if (numeric === undefined) return undefined;

  if (numeric <= 1) return "cheapest";
  if (numeric <= 2) return "cheap";
  if (numeric <= 3) return "midrange";
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

const normalizeMetroStations = (raw: unknown): MetroStation[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((station, index) => ({
      rank: Math.max(
        1,
        Math.round(asNumber(station.rank, station.Rank) ?? index + 1),
      ),
      stationName:
        asString(station.station_name, station.stationName, station.name) ??
        "Unknown Station",
      distance: asString(station.Distance, station.distance) ?? "-",
      time: asString(station.Time, station.time) ?? "-",
    }))
    .sort((a, b) => a.rank - b.rank);
};

export const normalizePlaceDetail = (raw: unknown): PlaceDetail => {
  const payload = unwrapApiData(raw);
  const data = isRecord(payload) ? payload : {};
  const location = isRecord(data.location) ? data.location : undefined;

  const venueName = asString(data.name, data.title) ?? "Unknown Place";

  const imageUrls = asStringArray(data.imageUrls);
  const menuImagesUrls = asStringArray(
    data.menuImagesUrls ?? data.menuImageUrls,
  );
  const metroStations = normalizeMetroStations(data.metroStations);
  const reviewCount = Math.max(
    0,
    Math.round(asNumber(data.reviewCount, data.ratingCount) ?? 0),
  );
  const rating = asNumber(data.averageRating, data.rating) ?? 0;
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
    asString(data.address, location?.address, data.location) ?? "";
  const resolvedLocation =
    asString(data.location, data.district, resolvedAddress) ?? resolvedAddress;

  const rawPriceRange = asString(data.priceRange);
  const normalizedPriceRangeDisplay =
    asString(data.priceRange_Display, data.priceRangeDisplay) ?? rawPriceRange;

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
    location: resolvedLocation,
    address: resolvedAddress || resolvedLocation,
    district: asString(data.district),
    type: asString(data.type),
    rating,
    averageRating: rating,
    reviewCount,
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
    priceRange: rawPriceRange ?? normalizedPriceRangeDisplay,
    priceRangeDisplay: normalizedPriceRangeDisplay,
    priceLevel: toPriceLevel(
      data.priceRange_Display ??
        data.priceRangeDisplay ??
        data.priceRange ??
        data.priceLevel,
    ),
    hours: asString(data.hours, data.openingHours),
    isOpen: asBoolean(data.isOpen),
    atmosphereTags: asStringArray(data.atmosphereTags),
    socialBadges: normalizeSocialBadges(data.socialBadges),
    hasWifi: asBoolean(data.hasWifi),
    hasToilet: asBoolean(data.hasToilet),
    seatingType: normalizeSeatingType(data.seatingType),
    parkingAvailable: asBoolean(data.parkingAvailable),
    accessibilityScore: asNumber(data.accessibilityScore),
    noiseScore: asNumber(data.noiseScore),
    menuImagesCount: Math.max(
      asNumber(data.menuImagesCount) ?? 0,
      menuImagesUrls.length,
    ),
    menuImagesUrls,
    menuCurrency: asString(data.menuCurrency),
    metroStations: metroStations.length > 0 ? metroStations : undefined,
    isSaved: asBoolean(data.isSaved, data.isFavorited),
    isFavorited: asBoolean(data.isFavorited, data.isSaved),
    isLiked: asBoolean(data.isLiked),
    matchScore: asNumber(data.matchScore),
    googleMapsRatingStars: asString(data.googleMapsRatingStars),
    googleMapsRatingCount: asNumber(data.googleMapsRatingCount, reviewCount),
  };
};

export const normalizeReview = (raw: unknown): Review => {
  const payload = unwrapApiData(raw);
  const data = isRecord(payload) ? payload : {};

  const venueId = asString(data.venueId) ?? "";
  const userId =
    asString(data.userId, data.authorId, data.reviewerId) ?? "unknown-user";
  const createdAt = toDate(data.createdAt ?? data.date ?? data.updatedAt);
  const updatedAtValue = asString(data.updatedAt);
  const reviewId =
    asString(data.id, data.reviewId) ??
    `k:${venueId}:${userId}:${createdAt.toISOString()}`;

  return {
    id: reviewId,
    venueId,
    venueName: asString(data.venueName, data.placeName, data.venueTitle) ?? "",
    userId,
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
    updatedAt: updatedAtValue ? toDate(updatedAtValue).toISOString() : null,
  };
};

export const normalizeSocialReview = (raw: unknown): SocialMediaReview => {
  const payload = unwrapApiData(raw);
  const data = isRecord(payload) ? payload : {};

  const fallbackSocialId = [
    asString(data.venueId) ?? "venue",
    asString(data.userId, data.userName, data.authorName) ?? "author",
    asString(data.createdAt, data.date) ?? "date",
    (asString(data.comment, data.content, data.text) ?? "text").slice(0, 32),
  ]
    .join("_")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const source =
    asString(data.source, data.platform, data.userName, data.siteName) ??
    "Google Maps";
  const normalizedSource = source.trim();
  const platformCandidate = normalizedSource.toLowerCase();

  const platform = platformCandidate.includes("instagram")
    ? "instagram"
    : platformCandidate.includes("twitter")
      ? "twitter"
      : platformCandidate.includes("facebook")
        ? "facebook"
        : platformCandidate.includes("tiktok")
          ? "tiktok"
          : platformCandidate.includes("google")
            ? "google"
            : asString(data.platform, data.source)?.toLowerCase();

  const normalizedPlatform: SocialMediaReview["platform"] =
    platform === "instagram" ||
    platform === "twitter" ||
    platform === "facebook" ||
    platform === "tiktok" ||
    platform === "google"
      ? platform
      : "google";

  const sentimentScore = asNumber(data.sentimentScore, data.sentiment_value);
  const sentiment = asString(data.sentiment)?.toLowerCase();
  const normalizedSentiment: SocialMediaReview["sentiment"] =
    sentiment === "positive" ||
    sentiment === "neutral" ||
    sentiment === "negative"
      ? sentiment
      : (sentimentScore ?? 0) > 0.2
        ? "positive"
        : (sentimentScore ?? 0) < -0.2
          ? "negative"
          : "neutral";

  const normalizedRating = clampRating(data.rating, data.stars);

  return {
    id: asString(data.id, data.reviewId, data.externalId) ?? fallbackSocialId,
    platform: normalizedPlatform,
    source: normalizedSource,
    author: asString(data.author, data.authorName, data.userName) ?? "Unknown",
    authorAvatar: asString(data.authorAvatar, data.avatarUrl),
    content: asString(data.content, data.comment, data.text) ?? "",
    rating: normalizedRating > 0 ? normalizedRating : undefined,
    sentiment: normalizedSentiment,
    sentimentScore: sentimentScore ?? undefined,
    date: toDate(data.date ?? data.createdAt),
    likes: asNumber(data.likes, data.likeCount, data.helpfulCount),
    url: asString(data.url, data.link),
  };
};

const normalizePaginatedItems = <TItem>(
  raw: unknown,
  itemMapper: (item: unknown) => TItem,
  keySelector: (item: TItem) => string,
): {
  items: TItem[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
} => {
  const payload = unwrapApiData(raw);

  if (Array.isArray(payload)) {
    return {
      items: payload.map(itemMapper),
      pageIndex: 0,
      pageSize: payload.length,
      totalCount: payload.length,
      totalPages: payload.length > 0 ? 1 : 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  if (!isRecord(payload)) {
    return {
      items: [],
      pageIndex: 0,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const pageRecord = isRecord(payload.data) ? payload.data : payload;

  const itemsRaw = Array.isArray(pageRecord.items)
    ? pageRecord.items
    : Array.isArray(pageRecord.data)
      ? pageRecord.data
      : [];

  const mapped = itemsRaw.map(itemMapper);
  const uniqueItems = Array.from(
    new Map(mapped.map((item) => [keySelector(item), item])).values(),
  );

  const resolvedPageIndex = asNumber(
    pageRecord.pageIndex,
    pageRecord.currentPageIndex,
  );
  const resolvedOneBasedPage = asNumber(
    pageRecord.page,
    pageRecord.pageNumber,
    pageRecord.currentPage,
  );
  const pageIndex =
    resolvedPageIndex !== undefined
      ? Math.max(0, Math.round(resolvedPageIndex))
      : Math.max(0, Math.round((resolvedOneBasedPage ?? 1) - 1));

  const fallbackPageSize = uniqueItems.length > 0 ? uniqueItems.length : 10;
  const pageSize = Math.max(
    1,
    Math.round(
      asNumber(pageRecord.pageSize, pageRecord.size, pageRecord.limit) ??
        fallbackPageSize,
    ),
  );
  const totalCount = Math.max(
    uniqueItems.length,
    Math.round(
      asNumber(pageRecord.totalCount, pageRecord.count, pageRecord.total) ??
        uniqueItems.length,
    ),
  );
  const totalPages = Math.max(
    0,
    Math.round(
      asNumber(pageRecord.totalPages, pageRecord.pages) ??
        (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0),
    ),
  );

  return {
    items: uniqueItems,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage:
      asBoolean(pageRecord.hasPreviousPage) ??
      (pageIndex > 0 && totalPages > 0),
    hasNextPage:
      asBoolean(pageRecord.hasNextPage) ??
      (totalPages > 0 ? pageIndex + 1 < totalPages : false),
  };
};

export const normalizeReviewSummary = (raw: unknown): ReviewSummary => {
  const payload = unwrapApiData(raw);
  const data = isRecord(payload) ? payload : {};

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

export const normalizePaginatedReviews = (raw: unknown): ReviewListResponse => {
  return normalizePaginatedItems(raw, normalizeReview, getReviewIdentity);
};

export const normalizePaginatedSocialReviews = (
  raw: unknown,
): SocialReviewListResponse => {
  return normalizePaginatedItems(raw, normalizeSocialReview, (item) => item.id);
};

export const normalizeAverageRating = (
  venueId: string,
  raw: unknown,
): VenueAverageRating => {
  const payload = unwrapApiData(raw);

  if (typeof payload === "number") {
    return { venueId, averageRating: payload };
  }

  if (!isRecord(payload)) {
    return { venueId, averageRating: 0 };
  }

  return {
    venueId: asString(payload.venueId) ?? venueId,
    averageRating: asNumber(payload.averageRating, payload.rating) ?? 0,
  };
};

export const normalizeLikeState = (raw: unknown): boolean | null => {
  const payload = unwrapApiData(raw);
  if (typeof payload === "boolean") return payload;
  if (!isRecord(payload)) return null;

  const state = asBoolean(
    payload.isLiked,
    payload.liked,
    payload.value,
    payload.result,
  );
  return state ?? null;
};

export const sanitizeReportPayload = (
  payload: ReportReviewRequest,
): ReportReviewRequest => {
  const reason = payload.reason.trim();
  if (reason.length < 5 || reason.length > 100) {
    throw new Error("Report reason must be between 5 and 100 characters");
  }

  const description = payload.description?.trim() ?? "";
  if (description.length > 500) {
    throw new Error("Report description must be 500 characters or less");
  }

  return {
    reason,
    description: description.length > 0 ? description : null,
  };
};
