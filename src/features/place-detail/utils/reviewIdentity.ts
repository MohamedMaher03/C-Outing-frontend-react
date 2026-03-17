import type { Review } from "../types";

export type ReviewIdentityInput = Pick<
  Review,
  "reviewId" | "venueId" | "userId" | "createdAt"
>;

export const getReviewIdentity = (review: ReviewIdentityInput): string =>
  review.reviewId?.trim()
    ? `id:${review.reviewId}`
    : `k:${review.venueId}:${review.userId}:${review.createdAt}`;
