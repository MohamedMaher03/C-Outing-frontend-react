/**
 * Place Detail Mock Implementations
 *
 * Drop-in datasource replacement for placeDetailApi.
 * Enabled via VITE_USE_MOCKS=true through placeDetailDataSource.
 */

import { PLACES } from "@/mocks/mockData";
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
import type { PlaceDetailDataSource } from "../types/dataSource";
import { sanitizeReportPayload } from "../mappers/placeDetailMapper";
import {
  MOCK_REVIEWS,
  MOCK_SOCIAL_REVIEWS,
  MOCK_REVIEW_SUMMARIES,
  DEFAULT_REVIEWS,
  DEFAULT_SOCIAL_REVIEWS,
  DEFAULT_REVIEW_SUMMARY,
} from "./index";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const cloneReview = (review: Review): Review => ({ ...review });

const clonePlace = (place: PlaceDetail): PlaceDetail => ({
  ...place,
  reviews: place.reviews?.map(cloneReview),
  atmosphereTags: place.atmosphereTags ? [...place.atmosphereTags] : undefined,
  socialBadges: place.socialBadges ? [...place.socialBadges] : undefined,
  seatingType: place.seatingType ? [...place.seatingType] : undefined,
  imageUrls: place.imageUrls ? [...place.imageUrls] : undefined,
  menuImagesUrls: place.menuImagesUrls ? [...place.menuImagesUrls] : undefined,
});

const cloneSummary = (summary: ReviewSummary): ReviewSummary => ({
  ...summary,
  highlights: [...summary.highlights],
  commonTopics: summary.commonTopics.map((topic) => ({ ...topic })),
});

const sanitizePositiveInt = (value: unknown, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
};

const paginateReviews = (
  items: Review[],
  params?: ReviewListParams,
): ReviewListResponse => {
  const pageIndex = sanitizePositiveInt(params?.page, 1);
  const pageSize = sanitizePositiveInt(params?.pageSize, 10);
  const sorted = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalCount = sorted.length;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
  const safePageIndex = totalPages === 0 ? 1 : Math.min(pageIndex, totalPages);
  const start = (safePageIndex - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: sorted.slice(start, end).map(cloneReview),
    pageIndex: safePageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: safePageIndex > 1,
    hasNextPage: safePageIndex < totalPages,
  };
};

const parseAuthUser = (): { userId: string; userName: string } => {
  try {
    const raw = localStorage.getItem("authUser");
    if (!raw) return { userId: "user_1", userName: "Current User" };

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const userId =
      (typeof parsed.userId === "string" && parsed.userId.trim()) ||
      (typeof parsed.id === "string" && parsed.id.trim()) ||
      "user_1";
    const userName =
      (typeof parsed.name === "string" && parsed.name.trim()) || "Current User";

    return { userId, userName };
  } catch {
    return { userId: "user_1", userName: "Current User" };
  }
};

const placesStore: Record<string, PlaceDetail> = Object.fromEntries(
  PLACES.map((place) => [
    place.id,
    {
      ...(place as PlaceDetail),
      isFavorited: place.isSaved ?? false,
      isLiked: false,
      likeCount: 0,
      totalReviews: place.totalReviews ?? place.reviewCount,
    },
  ]),
);

const reviewsStore: Record<string, Review[]> = { ...MOCK_REVIEWS };
const socialReviewsStore: Record<string, SocialMediaReview[]> = {
  ...MOCK_SOCIAL_REVIEWS,
};
const summaryStore: Record<string, ReviewSummary> = {
  ...MOCK_REVIEW_SUMMARIES,
};

const findReviewById = (
  reviewId: string,
): { venueId: string; review: Review; index: number } | null => {
  for (const [venueId, reviews] of Object.entries(reviewsStore)) {
    const index = reviews.findIndex(
      (review) => review.reviewId === reviewId || review.id === reviewId,
    );
    if (index >= 0) {
      return { venueId, review: reviews[index], index };
    }
  }

  return null;
};

const getReviewsForVenue = (venueId: string): Review[] => {
  return reviewsStore[venueId] ?? [];
};

const updateVenueRatingMetadata = (venueId: string): void => {
  const venue = placesStore[venueId];
  if (!venue) return;

  const venueReviews = getReviewsForVenue(venueId);
  const totalCount = venueReviews.length;
  if (totalCount === 0) {
    venue.reviewCount = 0;
    venue.totalReviews = 0;
    venue.rating = 0;
    venue.averageRating = 0;
    venue.reviews = [];
    return;
  }

  const averageRating =
    venueReviews.reduce((sum, review) => sum + review.rating, 0) / totalCount;

  venue.reviewCount = totalCount;
  venue.totalReviews = totalCount;
  venue.rating = Number(averageRating.toFixed(1));
  venue.averageRating = venue.rating;
  venue.reviews = [...venueReviews]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map(cloneReview);
};

for (const venueId of Object.keys(reviewsStore)) {
  updateVenueRatingMetadata(venueId);
}

export const placeDetailMock: PlaceDetailDataSource = {
  async getPlaceById(placeId: string): Promise<PlaceDetail> {
    await delay(250);

    const place = placesStore[placeId];
    if (!place) {
      throw new Error("Place not found");
    }

    updateVenueRatingMetadata(placeId);
    return clonePlace(place);
  },

  async toggleLike(venueId: string): Promise<boolean | null> {
    await delay(120);

    const place = placesStore[venueId];
    if (!place) return null;

    const nextLiked = !place.isLiked;
    place.isLiked = nextLiked;
    place.likeCount = Math.max(
      0,
      (place.likeCount ?? 0) + (nextLiked ? 1 : -1),
    );

    return nextLiked;
  },

  async getPlaceReviews(
    venueId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    await delay(220);

    const reviews = getReviewsForVenue(venueId);
    const fallback = reviews.length > 0 ? reviews : DEFAULT_REVIEWS;
    return paginateReviews(fallback, params);
  },

  async getSocialMediaReviews(venueId: string): Promise<SocialMediaReview[]> {
    await delay(260);
    const items = socialReviewsStore[venueId] ?? DEFAULT_SOCIAL_REVIEWS;
    return items.map((item) => ({ ...item }));
  },

  async getReviewSummary(venueId: string): Promise<ReviewSummary> {
    await delay(300);
    return cloneSummary(summaryStore[venueId] ?? DEFAULT_REVIEW_SUMMARY);
  },

  async submitReview(
    venueId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    await delay(220);

    const authUser = parseAuthUser();
    const createdAt = new Date().toISOString();
    const newReview: Review = {
      reviewId: `mock_review_${Date.now()}`,
      id: `mock_review_${Date.now()}`,
      venueId,
      venueName: placesStore[venueId]?.name ?? "Mock Venue",
      userId: authUser.userId,
      userName: authUser.userName,
      rating,
      comment,
      createdAt,
      updatedAt: createdAt,
    };

    reviewsStore[venueId] = [newReview, ...(reviewsStore[venueId] ?? [])];
    updateVenueRatingMetadata(venueId);

    return cloneReview(newReview);
  },

  async updateReview(
    reviewId: string,
    payload: UpdateReviewPayload,
  ): Promise<Review> {
    await delay(180);

    const found = findReviewById(reviewId);
    if (!found) {
      throw new Error("Review not found");
    }

    const current = found.review;
    const updated: Review = {
      ...current,
      rating:
        typeof payload.rating === "number"
          ? Math.max(1, Math.min(5, Math.round(payload.rating)))
          : current.rating,
      comment:
        typeof payload.comment === "string" && payload.comment.trim().length > 0
          ? payload.comment.trim()
          : current.comment,
      updatedAt: new Date().toISOString(),
    };

    reviewsStore[found.venueId] = reviewsStore[found.venueId].map(
      (review, index) => (index === found.index ? updated : review),
    );
    updateVenueRatingMetadata(found.venueId);

    return cloneReview(updated);
  },

  async deleteReview(reviewId: string): Promise<void> {
    await delay(180);

    const found = findReviewById(reviewId);
    if (!found) {
      throw new Error("Review not found");
    }

    reviewsStore[found.venueId] = reviewsStore[found.venueId].filter(
      (_, index) => index !== found.index,
    );
    updateVenueRatingMetadata(found.venueId);
  },

  async getReviewById(reviewId: string): Promise<Review> {
    await delay(140);

    const found = findReviewById(reviewId);
    if (!found) {
      throw new Error("Review not found");
    }

    return cloneReview(found.review);
  },

  async getUserReviews(
    userId: string,
    params?: ReviewListParams,
  ): Promise<ReviewListResponse> {
    await delay(220);

    const allReviews = Object.values(reviewsStore).flat();
    const userReviews = allReviews.filter((review) => review.userId === userId);

    return paginateReviews(userReviews, params);
  },

  async getMyReview(venueId: string): Promise<Review | null> {
    await delay(160);

    const authUser = parseAuthUser();
    const review = getReviewsForVenue(venueId).find(
      (item) => item.userId === authUser.userId,
    );

    return review ? cloneReview(review) : null;
  },

  async getAverageRating(venueId: string): Promise<VenueAverageRating> {
    await delay(140);
    updateVenueRatingMetadata(venueId);

    return {
      venueId,
      averageRating: placesStore[venueId]?.rating ?? 0,
    };
  },

  async reportReview(
    reviewId: string,
    payload: ReportReviewRequest,
  ): Promise<void> {
    await delay(170);

    const found = findReviewById(reviewId);
    if (!found) {
      throw new Error("Review not found");
    }

    sanitizeReportPayload(payload);
  },

  async recordInteraction(payload: RecordInteractionRequest): Promise<void> {
    await delay(80);
    void payload;
  },
};
