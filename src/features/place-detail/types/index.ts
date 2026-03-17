/**
 * Place Detail Feature — Type Definitions
 */

import type { PaginatedResponse } from "@/types";

export type PriceLevel =
  | "price_cheapest"
  | "cheap"
  | "mid_range"
  | "expensive"
  | "luxury";

export type InteractionActionType =
  | "Click"
  | "ViewDetails"
  | "Rate"
  | "Favorite"
  | "Share";

export const REPORT_REASONS = [
  "Spam",
  "Harassment",
  "Inaccurate Information",
  "Inappropriate Content",
  "Hate Speech",
  "Copyright Violation",
  "Other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface ReportPayload {
  reviewId: string;
  reason: ReportReason;
  description: string;
}

export interface PlaceBase {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  rating: number;
  reviewCount: number;
  totalReviews?: number;
  description: string;
  image: string;
  phone?: string;
  website?: string;
  menuUrl?: string;
  bookingUrl?: string;
  priceRange?: string;
  priceLevel?: PriceLevel;
  hours?: string;
  isOpen?: boolean;
  atmosphereTags?: string[];
  socialBadges?: Array<
    "Good for Solo" | "Good for Couples" | "Good for Groups"
  >;
  hasWifi?: boolean;
  hasToilet?: boolean;
  seatingType?: Array<"indoor" | "outdoor">;
  parkingAvailable?: boolean;
  accessibilityScore?: number;
  menuImagesCount?: number;
  menuImagesUrls?: string[];
  isSaved?: boolean;
  matchScore?: number;
}

/**
 * Extended place with detail-page-only fields.
 * All venue metadata (phone, website, hours, etc.) lives on the base Place type.
 */
export interface PlaceDetail extends PlaceBase {
  reviews?: Review[];
}

/** A user-submitted review on the website */
export interface Review {
  reviewId?: string;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListParams {
  page?: number;
  pageSize?: number;
}

export type ReviewListResponse = PaginatedResponse<Review>;

export interface CreateReviewPayload {
  venueId: string;
  comment: string;
  rating: number;
}

export interface UpdateReviewPayload {
  comment?: string | null;
  rating?: number | null;
}

export interface ReportReviewRequest {
  reason: string;
  description?: string;
}

export interface VenueAverageRating {
  venueId: string;
  averageRating: number;
}

/** A review scraped from a social media platform */
export interface SocialMediaReview {
  id: string;
  platform: "instagram" | "twitter" | "facebook" | "tiktok" | "google";
  author: string;
  authorAvatar?: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  date: Date;
  likes?: number;
  url?: string;
}

/** NLP-generated review summary for a place */
export interface ReviewSummary {
  overallSentiment: "positive" | "neutral" | "negative";
  averageRating: number;
  totalReviews: number;
  summary: string;
  highlights: string[];
  commonTopics: {
    topic: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
  }[];
}

/** Payload for recording a user interaction event */
export interface RecordInteractionRequest {
  placeId: string;
  actionType: InteractionActionType;
  ratingValue?: number;
  comment?: string;
  sessionId: string;
  positionInList?: number;
}
