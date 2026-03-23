/**
 * Users Feature — Type Definitions
 *
 * Covers both the "public-view" of another user's profile and
 * the lightweight activity data surfaced on that page.
 */

/** Public-facing profile — safe to expose to any authenticated user. */
export interface PublicUserProfile {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  reviewCount: number;
  joinedDate?: string | Date;
  age?: number;
  role?: number;
  totalInteractions?: number;
  isBanned?: boolean;
  isEmailVerified?: boolean;
}

/** A review activity item shown on the public profile page */
export interface UserReviewActivity {
  reviewId: string;
  placeId: string;
  placeName: string;
  placeImage?: string;
  placeCategory?: string;
  rating: number;
  comment: string;
  date: string | Date;
  sentimentScore?: number;
  userAvatar?: string;
}

/** Aggregated public stats for the hero section */
export interface UserStats {
  reviewCount: number;
  placesVisited: number;
}
