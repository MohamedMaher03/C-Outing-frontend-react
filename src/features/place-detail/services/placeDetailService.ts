/**
 * Place Detail Service
 * Handles all API calls related to place details, reviews, and interactions
 */

// import { apiClient } from "./client"; // TODO: Uncomment when backend is ready
import { PLACES } from "@/mocks/mockData";
import type {
  PlaceDetail,
  Review,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "@/features/place-detail/types";
import {
  MOCK_REVIEWS,
  MOCK_SOCIAL_REVIEWS,
  MOCK_REVIEW_SUMMARIES,
  DEFAULT_REVIEWS,
  DEFAULT_SOCIAL_REVIEWS,
  DEFAULT_REVIEW_SUMMARY,
} from "@/features/place-detail/mocks";

// Re-export types for consumers that import from this service
export type {
  PlaceDetail,
  Review,
  SocialMediaReview,
  ReviewSummary,
  RecordInteractionRequest,
} from "@/features/place-detail/types";

// ============ Service Functions ============

/**
 * Fetch place details by ID
 * TODO: Replace with real API call when backend is ready
 */
export const getPlaceById = async (placeId: string): Promise<PlaceDetail> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const place = PLACES.find((p) => p.id === placeId);
  if (!place) {
    throw new Error("Place not found");
  }

  // Return place with additional details
  return Promise.resolve({
    ...place,
    openingHours: {
      open: "09:00 AM",
      close: "11:00 PM",
    },
  });

  // TODO: Uncomment when backend is ready
  // return apiClient.get<PlaceDetail>(`/places/${placeId}`);
};

/**
 * Fetch user reviews for a place (from the website)
 * TODO: Replace with real API call when backend is ready
 */
export const getPlaceReviews = async (placeId: string): Promise<Review[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return Promise.resolve(MOCK_REVIEWS[placeId] || DEFAULT_REVIEWS);

  // TODO: Uncomment when backend is ready
  // return apiClient.get<Review[]>(`/places/${placeId}/reviews`);
};

/**
 * Fetch social media reviews (from scraping) for a place
 * TODO: Replace with real API call when backend is ready
 */
export const getSocialMediaReviews = async (
  placeId: string,
): Promise<SocialMediaReview[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return Promise.resolve(
    MOCK_SOCIAL_REVIEWS[placeId] || DEFAULT_SOCIAL_REVIEWS,
  );

  // TODO: Uncomment when backend is ready
  // return apiClient.get<SocialMediaReview[]>(`/places/${placeId}/social-reviews`);
};

/**
 * Fetch NLP-generated review summary for a place
 * TODO: Replace with real API call when backend is ready
 */
export const getReviewSummary = async (
  placeId: string,
): Promise<ReviewSummary> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return Promise.resolve(
    MOCK_REVIEW_SUMMARIES[placeId] || DEFAULT_REVIEW_SUMMARY,
  );

  // TODO: Uncomment when backend is ready
  // return apiClient.get<ReviewSummary>(`/places/${placeId}/review-summary`);
};

/**
 * Record user interaction with a place
 * TODO: Replace with real API call when backend is ready
 */
export const recordInteraction = async (
  data: RecordInteractionRequest,
): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("[Mock] Interaction recorded:", data);
  return Promise.resolve();

  // TODO: Uncomment when backend is ready
  // await apiClient.post("/interactions", data);
};

/**
 * Get similar places based on current place
 * TODO: Replace with real API call when backend is ready
 */
export const getSimilarPlaces = async (placeId: string): Promise<Place[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return random places as similar
  const otherPlaces = PLACES.filter((p) => p.id !== placeId);
  return Promise.resolve(otherPlaces.slice(0, 3));

  // TODO: Uncomment when backend is ready
  // return apiClient.get<Place[]>(`/places/${placeId}/similar`);
};

/**
 * Submit a review for a place
 * TODO: Replace with real API call when backend is ready
 */
export const submitReview = async (
  placeId: string,
  rating: number,
  comment: string,
): Promise<Review> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockReview: Review = {
    id: `review_${Date.now()}`,
    userId: "user_1",
    userName: "Current User",
    rating,
    comment,
    date: new Date(),
  };

  // Add to mock data
  if (!MOCK_REVIEWS[placeId]) {
    MOCK_REVIEWS[placeId] = [];
  }
  MOCK_REVIEWS[placeId].unshift(mockReview);

  console.log("[Mock] Review submitted for place:", placeId, mockReview);
  return Promise.resolve(mockReview);

  // TODO: Uncomment when backend is ready
  // return apiClient.post<Review>(`/places/${placeId}/reviews`, {
  //   rating,
  //   comment,
  // });
};
