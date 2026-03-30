import { ApiError, isApiError } from "@/utils/apiError";
import type { PublicUserProfile, UserReviewActivity } from "../types";
import {
  buildFallbackPublicProfileFromReviews,
  mapProfileDtoToPublicProfile,
  mapReviewsPageToActivity,
} from "../mappers/userMapper";
import { usersDataSource } from "./userDataSource";

const DEFAULT_REVIEWS_PAGE_INDEX = 1;
const DEFAULT_REVIEWS_PAGE_SIZE = 10;
const PUBLIC_PROFILE_CACHE_TTL_MS = 60_000;

interface CacheEntry {
  value: PublicProfileBundle;
  expiresAt: number;
}

const bundleCache = new Map<string, CacheEntry>();
const inFlightBundleRequests = new Map<string, Promise<PublicProfileBundle>>();

const normalizeUserId = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("This profile link is invalid.");
  }

  return normalized;
};

const toReviewsWarning = (error: unknown): string => {
  if (isApiError(error)) {
    if (error.statusCode === 403) {
      return "Recent reviews are hidden for this user.";
    }
    if (error.statusCode === 429) {
      return "Recent reviews are temporarily rate-limited. Try again shortly.";
    }
  }

  return "Recent reviews are unavailable right now. You can still view profile details.";
};

export interface PublicProfileBundle {
  profile: PublicUserProfile;
  reviews: UserReviewActivity[];
  reviewsWarning: string | null;
}

interface GetPublicProfileBundleOptions {
  forceRefresh?: boolean;
}

const getBundleCacheKey = (userId: string, currentUserId?: string): string =>
  `${userId}:${currentUserId ?? "anonymous"}`;

const readCachedBundle = (cacheKey: string): PublicProfileBundle | null => {
  const cachedEntry = bundleCache.get(cacheKey);
  if (!cachedEntry) return null;

  if (cachedEntry.expiresAt <= Date.now()) {
    bundleCache.delete(cacheKey);
    return null;
  }

  return cachedEntry.value;
};

const writeCachedBundle = (
  cacheKey: string,
  value: PublicProfileBundle,
): void => {
  bundleCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + PUBLIC_PROFILE_CACHE_TTL_MS,
  });
};

const fetchPublicProfileBundle = async (
  normalizedUserId: string,
  normalizedCurrentUserId?: string,
): Promise<PublicProfileBundle> => {
  const reviewsPromise = usersDataSource.getUserReviews(
    normalizedUserId,
    DEFAULT_REVIEWS_PAGE_INDEX,
    DEFAULT_REVIEWS_PAGE_SIZE,
  );

  if (normalizedCurrentUserId && normalizedCurrentUserId === normalizedUserId) {
    const [reviewsResult, ownProfileResult] = await Promise.allSettled([
      reviewsPromise,
      usersDataSource.getCurrentProfile(),
    ]);

    if (ownProfileResult.status === "rejected") {
      throw ownProfileResult.reason;
    }

    const profile = mapProfileDtoToPublicProfile(ownProfileResult.value, 0);

    if (reviewsResult.status === "rejected") {
      return {
        profile,
        reviews: [],
        reviewsWarning: toReviewsWarning(reviewsResult.reason),
      };
    }

    return {
      profile: mapProfileDtoToPublicProfile(
        ownProfileResult.value,
        reviewsResult.value.totalCount,
      ),
      reviews: mapReviewsPageToActivity(reviewsResult.value),
      reviewsWarning: null,
    };
  }

  const [reviewsResult, publicProfileResult] = await Promise.allSettled([
    reviewsPromise,
    usersDataSource.getPublicProfile(normalizedUserId),
  ]);

  if (publicProfileResult.status === "fulfilled") {
    if (reviewsResult.status === "fulfilled") {
      return {
        profile: mapProfileDtoToPublicProfile(
          publicProfileResult.value,
          reviewsResult.value.totalCount,
        ),
        reviews: mapReviewsPageToActivity(reviewsResult.value),
        reviewsWarning: null,
      };
    }

    return {
      profile: mapProfileDtoToPublicProfile(publicProfileResult.value, 0),
      reviews: [],
      reviewsWarning: toReviewsWarning(reviewsResult.reason),
    };
  }

  if (reviewsResult.status === "fulfilled") {
    return {
      profile: buildFallbackPublicProfileFromReviews(
        normalizedUserId,
        reviewsResult.value,
      ),
      reviews: mapReviewsPageToActivity(reviewsResult.value),
      reviewsWarning:
        "Some profile details are unavailable right now. Showing review-based profile fallback.",
    };
  }

  if (isApiError(publicProfileResult.reason)) {
    throw publicProfileResult.reason;
  }

  if (publicProfileResult.reason instanceof Error) {
    throw publicProfileResult.reason;
  }

  throw new ApiError("Failed to load public profile");
};

/**
 * Fetches public profile data + recent reviews with backend-aware fallbacks.
 * Keeps profile rendering resilient even when review activity endpoint fails.
 */
export const getPublicProfileBundle = async (
  userId: string,
  currentUserId?: string,
  options: GetPublicProfileBundleOptions = {},
): Promise<PublicProfileBundle> => {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedCurrentUserId = currentUserId?.trim();
  const cacheKey = getBundleCacheKey(normalizedUserId, normalizedCurrentUserId);
  const forceRefresh = options.forceRefresh === true;

  if (!forceRefresh) {
    const cachedValue = readCachedBundle(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }
  }

  const existingRequest = inFlightBundleRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const request = fetchPublicProfileBundle(
    normalizedUserId,
    normalizedCurrentUserId,
  )
    .then((result) => {
      writeCachedBundle(cacheKey, result);
      return result;
    })
    .finally(() => {
      inFlightBundleRequests.delete(cacheKey);
    });

  inFlightBundleRequests.set(cacheKey, request);
  return request;
};

export const clearPublicProfileBundleCache = (
  userId?: string,
  currentUserId?: string,
): void => {
  if (!userId) {
    bundleCache.clear();
    return;
  }

  const normalizedUserId = normalizeUserId(userId);
  const normalizedCurrentUserId = currentUserId?.trim();
  bundleCache.delete(
    getBundleCacheKey(normalizedUserId, normalizedCurrentUserId),
  );
};

export const userService = {
  getPublicProfileBundle,
  clearPublicProfileBundleCache,
};
