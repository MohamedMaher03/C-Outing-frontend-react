/**
 * Place Detail Service
 * Handles all API calls related to place details and interactions
 */

// import { apiClient } from "./client"; // TODO: Uncomment when backend is ready
import type { Place } from "../../data/mockData";
import { PLACES } from "../../data/mockData";

// ============ Types ============
export interface PlaceDetail extends Place {
  openingHours?: {
    open: string;
    close: string;
  };
  phoneNumber?: string;
  website?: string;
  reviews?: Review[];
  similarPlaces?: Place[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface RecordInteractionRequest {
  placeId: string;
  actionType: "Click" | "ViewDetails" | "Rate" | "Favorite" | "Share";
  ratingValue?: number;
  comment?: string;
  sessionId: string;
  positionInList?: number;
}

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

  console.log("[Mock] Review submitted for place:", placeId, mockReview);
  return Promise.resolve(mockReview);

  // TODO: Uncomment when backend is ready
  // return apiClient.post<Review>(`/places/${placeId}/reviews`, {
  //   rating,
  //   comment,
  // });
};
