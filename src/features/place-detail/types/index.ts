/**
 * Place Detail Feature — Type Definitions
 */

import type { Place } from "@/mocks/mockData";

/**
 * Extended place with detail-page-only fields.
 * All venue metadata (phone, website, hours, etc.) lives on the base Place type.
 */
export interface PlaceDetail extends Place {
  reviews?: Review[];
  similarPlaces?: Place[];
}

/** A user-submitted review on the website */
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
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
  actionType: "Click" | "ViewDetails" | "Rate" | "Favorite" | "Share";
  ratingValue?: number;
  comment?: string;
  sessionId: string;
  positionInList?: number;
}
