/**
 * Home Service
 * Handles API calls for home page data (places, recommendations, etc.)
 */

import type { Place } from "../../data/mockData";
import { PLACES } from "../../data/mockData";
// import axiosInstance from "../../config/axios.config";

/**
 * Fetch all places/venues
 * TODO: Replace with actual API endpoint when backend is ready
 */
export const fetchPlaces = async (): Promise<Place[]> => {
  try {
    // TODO: Uncomment when backend API is ready
    // const response = await axiosInstance.get<Place[]>('/venues');
    // return response.data;

    // Using mock data for now
    return Promise.resolve(PLACES.map((p) => ({ ...p, isSaved: false })));
  } catch (error) {
    console.error("Error fetching places:", error);
    throw new Error("Failed to fetch places");
  }
};

/**
 * Fetch personalized recommendations for a user
 * @param userId - The user ID
 * TODO: Implement actual API call when backend is ready
 */
export const fetchRecommendations = async (
  userId: number,
): Promise<Place[]> => {
  try {
    // TODO: Uncomment when backend API is ready
    // const response = await axiosInstance.get<Place[]>(`/recommendations/${userId}`);
    // return response.data;

    // Using mock data for now
    console.log("Fetching recommendations for user:", userId);
    return Promise.resolve(
      PLACES.slice(0, 5).map((p) => ({ ...p, isSaved: false })),
    );
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw new Error("Failed to fetch recommendations");
  }
};

/**
 * Toggle save/bookmark status for a place
 * @param placeId - The place ID
 * @param isSaved - Whether to save or unsave
 * TODO: Implement actual API call when backend is ready
 */
export const togglePlaceSave = async (
  placeId: string,
  isSaved: boolean,
): Promise<void> => {
  try {
    // TODO: Uncomment when backend API is ready
    // await axiosInstance.post(`/venues/${placeId}/save`, { isSaved });

    // Mock implementation
    console.log(`Toggle save for place ${placeId}:`, isSaved);
    return Promise.resolve();
  } catch (error) {
    console.error("Error toggling place save:", error);
    throw new Error("Failed to toggle place save");
  }
};

/**
 * Search places by query
 * @param query - Search query string
 * TODO: Implement actual API call when backend is ready
 */
export const searchPlaces = async (query: string): Promise<Place[]> => {
  try {
    // TODO: Uncomment when backend API is ready
    // const response = await axiosInstance.get<Place[]>('/venues/search', {
    //   params: { q: query }
    // });
    // return response.data;

    // Mock implementation
    console.log("Searching places with query:", query);
    return Promise.resolve(PLACES);
  } catch (error) {
    console.error("Error searching places:", error);
    throw new Error("Failed to search places");
  }
};
