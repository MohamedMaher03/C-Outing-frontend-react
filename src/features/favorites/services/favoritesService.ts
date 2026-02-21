/**
 * Favorites Service
 * Handles all API calls related to saved/favorite places
 */

// import { apiClient } from "./client"; // TODO: Uncomment when backend is ready
import type { Place } from "@/mocks/mockData";
import { PLACES } from "@/mocks/mockData";

// ============ Types ============
export interface FavoritePlace extends Place {
  savedAt: Date;
}

export interface ToggleFavoriteResponse {
  success: boolean;
  isFavorite: boolean;
  message?: string;
}

// ============ Mock Data ============
// Simulate in-memory favorites storage
let MOCK_FAVORITES: FavoritePlace[] = PLACES.slice(0, 3).map((place) => ({
  ...place,
  savedAt: new Date(),
  isSaved: true,
}));

// ============ Service Functions ============

/**
 * Fetch all saved places for the current user
 * TODO: Replace with real API call when backend is ready
 */
export const getFavorites = async (): Promise<FavoritePlace[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Promise.resolve(MOCK_FAVORITES);

  // TODO: Uncomment when backend is ready
  // return apiClient.get<FavoritePlace[]>("/favorites");
};

/**
 * Add a place to favorites
 * TODO: Replace with real API call when backend is ready
 */
export const addToFavorites = async (
  placeId: string,
): Promise<ToggleFavoriteResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const place = PLACES.find((p) => p.id === placeId);
  if (place && !MOCK_FAVORITES.find((f) => f.id === placeId)) {
    MOCK_FAVORITES.push({ ...place, savedAt: new Date(), isSaved: true });
  }

  return Promise.resolve({
    success: true,
    isFavorite: true,
  });

  // TODO: Uncomment when backend is ready
  // return apiClient.post<ToggleFavoriteResponse>("/favorites", { placeId });
};

/**
 * Remove a place from favorites
 * TODO: Replace with real API call when backend is ready
 */
export const removeFromFavorites = async (
  placeId: string,
): Promise<ToggleFavoriteResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  MOCK_FAVORITES = MOCK_FAVORITES.filter((f) => f.id !== placeId);

  return Promise.resolve({
    success: true,
    isFavorite: false,
  });

  // TODO: Uncomment when backend is ready
  // return apiClient.delete<ToggleFavoriteResponse>(`/favorites/${placeId}`);
};

/**
 * Toggle favorite status for a place
 * TODO: Replace with real API call when backend is ready
 */
export const toggleFavorite = async (
  placeId: string,
  isFavorite: boolean,
): Promise<ToggleFavoriteResponse> => {
  if (isFavorite) {
    return removeFromFavorites(placeId);
  } else {
    return addToFavorites(placeId);
  }
};

/**
 * Check if a place is favorited
 * TODO: Replace with real API call when backend is ready
 */
export const checkIsFavorite = async (placeId: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return Promise.resolve(!!MOCK_FAVORITES.find((f) => f.id === placeId));

  // TODO: Uncomment when backend is ready
  // const response = await apiClient.get<{ isFavorite: boolean }>(
  //   `/favorites/check/${placeId}`,
  // );
  // return response.isFavorite;
};
