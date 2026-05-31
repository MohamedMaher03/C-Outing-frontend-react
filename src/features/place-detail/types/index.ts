import type { PaginatedResponse } from "@/types";
import type { InteractionActionType } from "@/features/interactions";
import type { CanonicalPriceLevel } from "@/utils/priceLevels";

export type PriceLevel = CanonicalPriceLevel;
export type { InteractionActionType };

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

export interface MenuItem {
  url: string;
  date?: string;
}

export interface VenuePhotos {
  header?: string[];
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
  isOpen?: boolean | null;
  atmosphereTags?: string[];
  socialBadges?: Array<
    "Good for Solo" | "Good for Couples" | "Good for Groups"
  >;
  hasWifi?: boolean;
  freeWifi?: boolean;
  hasToilet?: boolean;
  seatingType?: Array<"indoor" | "outdoor">;
  hasIndoorSeating?: boolean;
  hasOutdoorSeating?: boolean;
  hasDriveThrough?: boolean;
  offersDelivery?: boolean;
  parkingAvailable?: boolean;
  streetParking?: boolean;
  lotParking?: boolean;
  valetParking?: boolean;
  garageParking?: boolean;
  multiStoreyParking?: boolean;
  wheelchairEntrance?: boolean;
  wheelchairSeating?: boolean;
  wheelchairCarPark?: boolean;
  wheelchairToilet?: boolean;
  assistiveHearingLoop?: boolean;
  acceptsCards?: boolean;
  acceptsDebitCards?: boolean;
  acceptsCreditCards?: boolean;
  acceptsNfcMobile?: boolean;
  accessibilityScore?: number;
  noiseScore?: number;
  menus?: MenuItem[];
  menuImagesCount?: number;
  menuImagesUrls?: string[];
  menuCurrency?: string;
  venuePhotos?: VenuePhotos;
  cuisines?: string[];
  dietaryAttributes?: string[];
  priceMeanPerPerson?: number | null;
  googleMapsTotalReviews?: number | null;
  originalGoogleMapsUrl?: string;
  status?: string;
  isDeprecated?: boolean;
  personalPriceRange?: string | null;
  platformRating?: number | null;
  metroStations?: MetroStation[];
  isSaved?: boolean;
  isFavorited?: boolean;
  isLiked?: boolean;
  matchScore?: number;
  googleMapsRatingStars?: string;
  googleMapsRatingCount?: number;
}

export type PlaceDetail = PlaceBase;

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

export interface SocialMediaReview {
  id: string;
  platform: "instagram" | "twitter" | "facebook" | "tiktok" | "google";
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

export interface RecordInteractionRequest {
  venueId: string;
  actionType: InteractionActionType;
}
