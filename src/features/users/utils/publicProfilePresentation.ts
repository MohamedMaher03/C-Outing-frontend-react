import type { PublicUserProfile } from "@/features/users/types";

export type PublicProfileLiveStatusKey =
  | "refreshing"
  | "partial"
  | "upToDate";

export interface PublicProfileSidebarView {
  joinedYear: number | null;
  isBanned: boolean;
  showMetaBadges: boolean;
  reviewCountLabel: string;
  recentCountLabel: string;
  interactionCountLabel: string;
  profileBio: string;
  liveStatusKey: PublicProfileLiveStatusKey;
}

export const clampStarRating = (rating: number): number =>
  Math.min(5, Math.max(0, Math.round(rating)));

export const formatProfileActivityDate = (
  value: string | Date,
  formatter: Intl.DateTimeFormat,
  fallback: string,
): string => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : formatter.format(parsed);
};

export const extractJoinedYear = (
  joinedDate?: string | Date,
): number | null => {
  if (!joinedDate) return null;
  const year = new Date(joinedDate).getFullYear();
  return Number.isNaN(year) ? null : year;
};

export const buildPublicProfileSidebarView = (
  profile: PublicUserProfile,
  reviewTotal: number,
  numberFormatter: Intl.NumberFormat,
  liveStatus: {
    isReloading: boolean;
    hasReviewsWarning: boolean;
  },
): PublicProfileSidebarView => {
  const isBanned = Boolean(profile.isBanned);
  const hasAgeBadge = typeof profile.age === "number" && profile.age >= 0;

  return {
    joinedYear: extractJoinedYear(profile.joinedDate),
    isBanned,
    showMetaBadges: hasAgeBadge || isBanned,
    reviewCountLabel: numberFormatter.format(Math.max(0, profile.reviewCount)),
    recentCountLabel: numberFormatter.format(reviewTotal),
    interactionCountLabel: numberFormatter.format(
      Math.max(0, profile.totalInteractions ?? 0),
    ),
    profileBio: profile.bio?.trim() ?? "",
    liveStatusKey: liveStatus.isReloading
      ? "refreshing"
      : liveStatus.hasReviewsWarning
        ? "partial"
        : "upToDate",
  };
};

export const resolvePublicProfileLiveMessageKey = (
  liveStatusKey: PublicProfileLiveStatusKey,
): `users.publicProfile.live.${PublicProfileLiveStatusKey}` =>
  `users.publicProfile.live.${liveStatusKey}`;
