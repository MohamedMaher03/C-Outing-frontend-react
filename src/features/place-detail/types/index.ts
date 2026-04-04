/**
 * Place Detail Feature — Type Definitions
 */

import type { PaginatedResponse } from "@/types";
import type { CanonicalPriceLevel } from "@/utils/priceLevels";

export type PriceLevel = CanonicalPriceLevel;

export type InteractionActionType =
  | "Click"
  | "ViewDetails"
  | "Rate"
  | "Favorite"
  | "Share";

export const REPORT_REASONS = [
  "Spam Content",
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
  description?: string;
}

export interface MetroStation {
  rank: number;
  stationName: string;
  distance: string;
  time: string;
}

export interface PlaceBase {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  location?: string;
  address: string;
  district?: string;
  type?: string;
  rating: number;
  averageRating?: number;
  reviewCount: number;
  likeCount?: number;
  description: string;
  image: string;
  displayImageUrl?: string;
  imageUrls?: string[];
  createdAt?: string;
  phone?: string;
  website?: string;
  menuUrl?: string;
  bookingUrl?: string;
  priceRange?: string;
  priceRangeDisplay?: string;
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
  noiseScore?: number;
  menuImagesCount?: number;
  menuImagesUrls?: string[];
  menuCurrency?: string;
  metroStations?: MetroStation[];
  isSaved?: boolean;
  isFavorited?: boolean;
  isLiked?: boolean;
  matchScore?: number;
  googleMapsRatingStars?: string;
  googleMapsRatingCount?: number;
}

/** Place detail payload from venue endpoint. */
export interface PlaceDetail extends PlaceBase {}

/** A user-submitted review on the website */
export interface Review {
  id: string;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ReviewListParams {
  pageIndex?: number;
  page?: number;
  pageSize?: number;
}

export type ReviewListResponse = PaginatedResponse<Review>;
export type SocialReviewListResponse = PaginatedResponse<SocialMediaReview>;

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
  description?: string | null;
}

export interface VenueAverageRating {
  venueId: string;
  averageRating: number;
}

/** A review scraped from a social media platform */
export interface SocialMediaReview {
  id: string;
  platform: "instagram" | "twitter" | "facebook" | "tiktok" | "google";
  source?: string;
  author: string;
  authorAvatar?: string;
  content: string;
  rating?: number;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore?: number;
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
