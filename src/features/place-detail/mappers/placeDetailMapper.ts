import type { PaginatedResponse } from "@/types";
import type {
  MenuItem,
  MetroStation,
  PlaceDetail,
  ReportReviewRequest,
  Review,
  ReviewListResponse,
  ReviewSummary,
  SocialMediaReview,
  SocialReviewListResponse,
  VenueAverageRating,
  VenuePhotos,
} from "../types";
import {
  getDefaultAvatarDataUrl,
  getDefaultVenueImageDataUrl,
} from "../utils/defaultImages";
import { getReviewIdentity } from "../utils/reviewIdentity";
import { normalizeOpenStatus } from "@/utils/openStatus";
import {
  coerceBoolean,
  coerceFirstBoolean,
  coerceFirstFiniteNumber,
  coerceFirstNonEmptyString,
  coerceNonNegativeInteger,
  coerceStringArray,
  coerceValidDate,
  dedupeByKey,
  resolveVenuePriceLevel,
  unwrapNestedDataPayload,
} from "@/mapper";
import { isObjectRecord } from "@/utils/typeGuards";

const clampReviewRating = (...values: unknown[]): number =>
  Math.max(1, Math.min(5, Math.round(coerceFirstFiniteNumber(...values) ?? 0)));

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
      coerceStringArray(raw, Number.MAX_SAFE_INTEGER)
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
      coerceStringArray(raw, Number.MAX_SAFE_INTEGER)
        .map((seat) => seat.toLowerCase())
        .filter((seat) => seat === "indoor" || seat === "outdoor")
        .map((seat) => (seat === "outdoor" ? "outdoor" : "indoor")),
    ),
  );

const resolveSeatingType = (
  data: Record<string, unknown>,
): Array<"indoor" | "outdoor"> => {
  const fromArray = normalizeSeatingType(data.seatingType ?? data.seatingTypes);
  if (fromArray.length > 0) return fromArray;

  return [
    ...(coerceBoolean(data.hasIndoorSeating) ? (["indoor"] as const) : []),
    ...(coerceBoolean(data.hasOutdoorSeating) ? (["outdoor"] as const) : []),
  ];
};

const normalizeMenus = (raw: unknown): MenuItem[] => {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (typeof item === "string" && item.trim().length > 0) {
      return [{ url: item.trim() }];
    }

    if (!isObjectRecord(item)) return [];

    const url = coerceFirstNonEmptyString(item.url, item.imageUrl, item.image);
    if (!url) return [];

    return [{ url, date: coerceFirstNonEmptyString(item.date) }];
  });
};

const normalizeVenuePhotos = (raw: unknown): VenuePhotos | undefined => {
  if (!isObjectRecord(raw)) return undefined;
  const header = coerceStringArray(raw.header, Number.MAX_SAFE_INTEGER);
  return header.length > 0 ? { header } : undefined;
};

const normalizeMetroStations = (raw: unknown): MetroStation[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => isObjectRecord(item))
    .map((station, index) => ({
      rank: Math.max(
        1,
        Math.round(
          coerceFirstFiniteNumber(station.rank, station.Rank) ?? index + 1,
        ),
      ),
      stationName:
        coerceFirstNonEmptyString(
          station.station_name,
          station.stationName,
          station.name,
        ) ?? "",
      distance:
        coerceFirstNonEmptyString(station.Distance, station.distance) ?? "",
      time: coerceFirstNonEmptyString(station.Time, station.time) ?? "",
    }))
    .filter(
      (station) =>
        station.stationName.trim().length > 0 ||
        station.distance.trim().length > 0 ||
        station.time.trim().length > 0,
    )
    .sort((left, right) => left.rank - right.rank);
};

export const normalizePlaceDetail = (raw: unknown): PlaceDetail => {
  const payload = unwrapNestedDataPayload(raw);
  const data = isObjectRecord(payload) ? payload : {};
  const location = isObjectRecord(data.location) ? data.location : undefined;

  const venueName =
    coerceFirstNonEmptyString(data.name, data.title) ?? "Unknown Place";
  const imageUrls = coerceStringArray(data.imageUrls, Number.MAX_SAFE_INTEGER);
  const venuePhotos = normalizeVenuePhotos(data.venuePhotos);
  const headerPhotos = venuePhotos?.header ?? [];
  const menus = normalizeMenus(data.menus);
  const legacyMenuUrls = coerceStringArray(
    data.menuImagesUrls ?? data.menuImageUrls,
    Number.MAX_SAFE_INTEGER,
  );
  const menuImagesUrls =
    menus.length > 0 ? menus.map((menu) => menu.url) : legacyMenuUrls;
  const mergedImageUrls =
    imageUrls.length > 0
      ? imageUrls
      : headerPhotos.length > 0
        ? headerPhotos
        : imageUrls;
  const metroStations = normalizeMetroStations(data.metroStations);
  const reviewCount = coerceNonNegativeInteger(
    coerceFirstFiniteNumber(data.reviewCount, data.ratingCount),
  );
  const rating = coerceFirstFiniteNumber(data.averageRating, data.rating) ?? 0;
  const displayImageUrl = coerceFirstNonEmptyString(data.displayImageUrl);
  const selectedImage =
    coerceFirstNonEmptyString(
      displayImageUrl,
      mergedImageUrls[0],
      headerPhotos[0],
      data.image,
      data.imageUrl,
      data.thumbnailUrl,
      data.coverImage,
    ) ?? getDefaultVenueImageDataUrl(venueName);

  const resolvedAddress =
    coerceFirstNonEmptyString(data.address, location?.address, data.location) ??
    "";
  const resolvedLocation =
    coerceFirstNonEmptyString(data.location, data.district, resolvedAddress) ??
    resolvedAddress;
  const rawPriceRange = coerceFirstNonEmptyString(data.priceRange);
  const normalizedPriceRangeDisplay =
    coerceFirstNonEmptyString(
      data.priceRange_Display,
      data.priceRangeDisplay,
    ) ?? rawPriceRange;

  return {
    id: coerceFirstNonEmptyString(data.id, data.venueId) ?? "",
    name: venueName,
    category:
      coerceFirstNonEmptyString(data.category, data.type) ?? "Uncategorized",
    latitude:
      coerceFirstFiniteNumber(
        data.latitude,
        data.lat,
        location?.latitude,
        location?.lat,
      ) ?? 0,
    longitude:
      coerceFirstFiniteNumber(
        data.longitude,
        data.lng,
        data.lon,
        location?.longitude,
        location?.lng,
      ) ?? 0,
    location: resolvedLocation,
    address: resolvedAddress || resolvedLocation,
    district: coerceFirstNonEmptyString(data.district),
    type: coerceFirstNonEmptyString(data.type),
    rating,
    averageRating: rating,
    reviewCount,
    likeCount: coerceNonNegativeInteger(
      coerceFirstFiniteNumber(data.likeCount),
    ),
    description: coerceFirstNonEmptyString(data.description, data.about) ?? "",
    image: selectedImage,
    displayImageUrl: displayImageUrl ?? selectedImage,
    imageUrls: mergedImageUrls,
    createdAt: coerceFirstNonEmptyString(data.createdAt),
    phone: coerceFirstNonEmptyString(data.phone, data.phoneNumber),
    website: coerceFirstNonEmptyString(data.website, data.websiteUrl),
    menuUrl: coerceFirstNonEmptyString(data.menuUrl, data.menuLink),
    bookingUrl: coerceFirstNonEmptyString(data.bookingUrl, data.bookingLink),
    priceRange: rawPriceRange ?? normalizedPriceRangeDisplay,
    priceRangeDisplay: normalizedPriceRangeDisplay,
    priceLevel: resolveVenuePriceLevel(data),
    hours: coerceFirstNonEmptyString(data.hours, data.openingHours),
    isOpen: normalizeOpenStatus(data.isOpen),
    atmosphereTags: Array.from(
      new Set([
        ...coerceStringArray(data.atmosphereTags, Number.MAX_SAFE_INTEGER),
        ...coerceStringArray(data.atmospheres, Number.MAX_SAFE_INTEGER),
      ]),
    ),
    socialBadges: normalizeSocialBadges(data.socialBadges),
    hasWifi: coerceBoolean(data.hasWifi),
    freeWifi: coerceBoolean(data.freeWifi),
    hasToilet: coerceBoolean(data.hasToilet),
    seatingType: resolveSeatingType(data),
    hasIndoorSeating: coerceBoolean(data.hasIndoorSeating),
    hasOutdoorSeating: coerceBoolean(data.hasOutdoorSeating),
    hasDriveThrough: coerceBoolean(data.hasDriveThrough),
    offersDelivery: coerceBoolean(data.offersDelivery),
    parkingAvailable: coerceBoolean(data.parkingAvailable),
    streetParking: coerceBoolean(data.streetParking),
    lotParking: coerceBoolean(data.lotParking),
    valetParking: coerceBoolean(data.valetParking),
    garageParking: coerceBoolean(data.garageParking),
    multiStoreyParking: coerceBoolean(data.multiStoreyParking),
    wheelchairEntrance: coerceBoolean(data.wheelchairEntrance),
    wheelchairSeating: coerceBoolean(data.wheelchairSeating),
    wheelchairCarPark: coerceBoolean(data.wheelchairCarPark),
    wheelchairToilet: coerceBoolean(data.wheelchairToilet),
    assistiveHearingLoop: coerceBoolean(data.assistiveHearingLoop),
    acceptsCards: coerceBoolean(data.acceptsCards),
    acceptsDebitCards: coerceBoolean(data.acceptsDebitCards),
    acceptsCreditCards: coerceBoolean(data.acceptsCreditCards),
    acceptsNfcMobile: coerceBoolean(data.acceptsNfcMobile),
    accessibilityScore: coerceFirstFiniteNumber(data.accessibilityScore),
    noiseScore: coerceFirstFiniteNumber(data.noiseScore),
    menus: menus.length > 0 ? menus : undefined,
    menuImagesCount: Math.max(
      coerceFirstFiniteNumber(data.menuImagesCount) ?? 0,
      menus.length,
      menuImagesUrls.length,
    ),
    menuImagesUrls,
    menuCurrency: coerceFirstNonEmptyString(data.menuCurrency),
    venuePhotos,
    cuisines: coerceStringArray(data.cuisines, Number.MAX_SAFE_INTEGER),
    dietaryAttributes: coerceStringArray(
      data.dietaryAttributes,
      Number.MAX_SAFE_INTEGER,
    ),
    priceMeanPerPerson: coerceFirstFiniteNumber(data.priceMeanPerPerson),
    googleMapsTotalReviews: coerceFirstFiniteNumber(
      data.googleMapsTotalReviews,
    ),
    originalGoogleMapsUrl: coerceFirstNonEmptyString(
      data.originalGoogleMapsUrl,
      data.googleMapsUrl,
    ),
    status: coerceFirstNonEmptyString(data.status),
    isDeprecated: coerceBoolean(data.isDeprecated),
    personalPriceRange:
      coerceFirstNonEmptyString(data.personalPriceRange) ?? null,
    platformRating: coerceFirstFiniteNumber(data.platformRating),
    metroStations: metroStations.length > 0 ? metroStations : undefined,
    isSaved: coerceFirstBoolean(data.isSaved, data.isFavorited),
    isFavorited: coerceFirstBoolean(data.isFavorited, data.isSaved),
    isLiked: coerceBoolean(data.isLiked),
    matchScore: coerceFirstFiniteNumber(data.matchScore),
    googleMapsRatingStars: coerceFirstNonEmptyString(
      data.googleMapsRatingStars,
    ),
    googleMapsRatingCount: coerceFirstFiniteNumber(
      data.googleMapsRatingCount,
      reviewCount,
    ),
  };
};

export const normalizeReview = (raw: unknown): Review => {
  const payload = unwrapNestedDataPayload(raw);
  const data = isObjectRecord(payload) ? payload : {};

  const venueId = coerceFirstNonEmptyString(data.venueId) ?? "";
  const userId =
    coerceFirstNonEmptyString(data.userId, data.authorId, data.reviewerId) ??
    "unknown-user";
  const createdAt = coerceValidDate(
    data.createdAt ?? data.date ?? data.updatedAt,
  );
  const updatedAtValue = coerceFirstNonEmptyString(data.updatedAt);
  const reviewId =
    coerceFirstNonEmptyString(data.id, data.reviewId) ??
    `k:${venueId}:${userId}:${createdAt.toISOString()}`;

  return {
    id: reviewId,
    venueId,
    venueName:
      coerceFirstNonEmptyString(
        data.venueName,
        data.placeName,
        data.venueTitle,
      ) ?? "",
    userId,
    userName:
      coerceFirstNonEmptyString(
        data.userName,
        data.authorName,
        data.reviewerName,
      ) ?? "Anonymous",
    userAvatar:
      coerceFirstNonEmptyString(
        data.userAvatar,
        data.avatarUrl,
        data.authorAvatar,
      ) ??
      getDefaultAvatarDataUrl(
        coerceFirstNonEmptyString(
          data.userName,
          data.authorName,
          data.reviewerName,
        ) ?? "Anonymous",
      ),
    rating: clampReviewRating(data.rating, data.stars),
    comment:
      coerceFirstNonEmptyString(data.comment, data.content, data.reviewText) ??
      "",
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAtValue
      ? coerceValidDate(updatedAtValue).toISOString()
      : null,
  };
};

export const normalizeSocialReview = (raw: unknown): SocialMediaReview => {
  const payload = unwrapNestedDataPayload(raw);
  const data = isObjectRecord(payload) ? payload : {};

  const fallbackSocialId = [
    coerceFirstNonEmptyString(data.venueId) ?? "venue",
    coerceFirstNonEmptyString(data.userId, data.userName, data.authorName) ??
      "author",
    coerceFirstNonEmptyString(data.createdAt, data.date) ?? "date",
    (
      coerceFirstNonEmptyString(data.comment, data.content, data.text) ?? "text"
    ).slice(0, 32),
  ]
    .join("_")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const platformCandidate = (
    coerceFirstNonEmptyString(data.source, data.platform, data.siteName) ??
    "google"
  )
    .trim()
    .toLowerCase();

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
            : coerceFirstNonEmptyString(
                data.platform,
                data.source,
              )?.toLowerCase();

  const normalizedPlatform: SocialMediaReview["platform"] =
    platform === "instagram" ||
    platform === "twitter" ||
    platform === "facebook" ||
    platform === "tiktok" ||
    platform === "google"
      ? platform
      : "google";

  const sentimentScore = coerceFirstFiniteNumber(
    data.sentimentScore,
    data.sentiment_value,
  );
  const sentiment = coerceFirstNonEmptyString(data.sentiment)?.toLowerCase();
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

  const normalizedRating = clampReviewRating(data.rating, data.stars);

  return {
    id:
      coerceFirstNonEmptyString(data.id, data.reviewId, data.externalId) ??
      fallbackSocialId,
    platform: normalizedPlatform,
    author:
      coerceFirstNonEmptyString(data.author, data.authorName, data.userName) ??
      "Unknown",
    authorAvatar: coerceFirstNonEmptyString(data.authorAvatar, data.avatarUrl),
    content:
      coerceFirstNonEmptyString(data.content, data.comment, data.text) ?? "",
    rating: normalizedRating > 0 ? normalizedRating : undefined,
    sentiment: normalizedSentiment,
    sentimentScore: sentimentScore ?? undefined,
    date: coerceValidDate(data.date ?? data.createdAt),
    likes: coerceFirstFiniteNumber(
      data.likes,
      data.likeCount,
      data.helpfulCount,
    ),
    url: coerceFirstNonEmptyString(data.url, data.link),
  };
};

const normalizePaginatedItems = <TItem>(
  raw: unknown,
  itemMapper: (item: unknown) => TItem,
  keySelector: (item: TItem) => string,
): PaginatedResponse<TItem> => {
  const payload = unwrapNestedDataPayload(raw);

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

  if (!isObjectRecord(payload)) {
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

  const pageRecord = isObjectRecord(payload.data) ? payload.data : payload;
  const itemsRaw = Array.isArray(pageRecord.items)
    ? pageRecord.items
    : Array.isArray(pageRecord.data)
      ? pageRecord.data
      : [];
  const uniqueItems = dedupeByKey(itemsRaw.map(itemMapper), keySelector);
  const resolvedPageIndex = coerceFirstFiniteNumber(
    pageRecord.pageIndex,
    pageRecord.currentPageIndex,
  );
  const resolvedOneBasedPage = coerceFirstFiniteNumber(
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
      coerceFirstFiniteNumber(
        pageRecord.pageSize,
        pageRecord.size,
        pageRecord.limit,
      ) ?? fallbackPageSize,
    ),
  );
  const totalCount = Math.max(
    uniqueItems.length,
    Math.round(
      coerceFirstFiniteNumber(
        pageRecord.totalCount,
        pageRecord.count,
        pageRecord.total,
      ) ?? uniqueItems.length,
    ),
  );
  const totalPages = Math.max(
    0,
    Math.round(
      coerceFirstFiniteNumber(pageRecord.totalPages, pageRecord.pages) ??
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
      coerceBoolean(pageRecord.hasPreviousPage) ??
      (pageIndex > 0 && totalPages > 0),
    hasNextPage:
      coerceBoolean(pageRecord.hasNextPage) ??
      (totalPages > 0 ? pageIndex + 1 < totalPages : false),
  };
};

export const normalizeReviewSummary = (raw: unknown): ReviewSummary => {
  const payload = unwrapNestedDataPayload(raw);
  const data = isObjectRecord(payload) ? payload : {};

  const sentiment = coerceFirstNonEmptyString(
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
    averageRating:
      coerceFirstFiniteNumber(data.averageRating, data.avgRating) ?? 0,
    totalReviews: coerceNonNegativeInteger(
      coerceFirstFiniteNumber(data.totalReviews, data.reviewsCount),
    ),
    summary: coerceFirstNonEmptyString(data.summary, data.description) ?? "",
    highlights: coerceStringArray(data.highlights, Number.MAX_SAFE_INTEGER),
    commonTopics: rawTopics
      .filter((topic): topic is Record<string, unknown> =>
        isObjectRecord(topic),
      )
      .map((topic) => {
        const topicSentiment = coerceFirstNonEmptyString(
          topic.sentiment,
        )?.toLowerCase();
        return {
          topic:
            coerceFirstNonEmptyString(topic.topic, topic.name) ?? "General",
          count: coerceNonNegativeInteger(
            coerceFirstFiniteNumber(topic.count, topic.mentions),
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

export const normalizePaginatedReviews = (raw: unknown): ReviewListResponse =>
  normalizePaginatedItems(raw, normalizeReview, getReviewIdentity);

export const normalizePaginatedSocialReviews = (
  raw: unknown,
): SocialReviewListResponse =>
  normalizePaginatedItems(raw, normalizeSocialReview, (item) => item.id);

export const normalizeAverageRating = (
  venueId: string,
  raw: unknown,
): VenueAverageRating => {
  const payload = unwrapNestedDataPayload(raw);

  if (typeof payload === "number") {
    return { venueId, averageRating: payload };
  }

  if (!isObjectRecord(payload)) {
    return { venueId, averageRating: 0 };
  }

  return {
    venueId: coerceFirstNonEmptyString(payload.venueId) ?? venueId,
    averageRating:
      coerceFirstFiniteNumber(payload.averageRating, payload.rating) ?? 0,
  };
};

export const normalizeLikeState = (raw: unknown): boolean | null => {
  const payload = unwrapNestedDataPayload(raw);
  if (typeof payload === "boolean") return payload;
  if (!isObjectRecord(payload)) return null;

  return (
    coerceFirstBoolean(
      payload.isLiked,
      payload.liked,
      payload.value,
      payload.result,
    ) ?? null
  );
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
