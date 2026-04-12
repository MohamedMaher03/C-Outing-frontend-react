import type { Review } from "../types";

export type ReviewIdentityInput = Pick<
  Review,
  "id" | "venueId" | "userId" | "createdAt"
>;

export const getReviewIdentity = (review: ReviewIdentityInput): string =>
  review.id?.trim()
    ? `id:${review.id}`
    : `k:${review.venueId}:${review.userId}:${review.createdAt}`;
