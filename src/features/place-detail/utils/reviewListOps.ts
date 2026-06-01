import type { Review, SocialMediaReview } from "@/features/place-detail/types";
import { getReviewIdentity } from "@/features/place-detail/utils/reviewIdentity";

export const mergeReviewsByIdentity = (
  current: Review[],
  incoming: Review[],
): Review[] => {
  const byIdentity = new Map<string, Review>();
  current.forEach((review) =>
    byIdentity.set(getReviewIdentity(review), review),
  );
  incoming.forEach((review) =>
    byIdentity.set(getReviewIdentity(review), review),
  );

  return Array.from(byIdentity.values()).sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );
};

export const mergeSocialReviewsById = (
  current: SocialMediaReview[],
  incoming: SocialMediaReview[],
): SocialMediaReview[] => {
  const byId = new Map<string, SocialMediaReview>();
  current.forEach((review) => byId.set(review.id, review));
  incoming.forEach((review) => byId.set(review.id, review));

  return Array.from(byId.values()).sort(
    (first, second) => second.date.getTime() - first.date.getTime(),
  );
};

export const locateUserReview = (
  items: Review[],
  currentUserId: string | null,
): Review | null => {
  if (!currentUserId) return null;
  return items.find((review) => review.userId === currentUserId) ?? null;
};
