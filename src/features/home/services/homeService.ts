/**
 * Home Service
 * Handles API calls for home page data (places, recommendations, etc.)
 */

import type { Place } from "@/mocks/mockData";
import { PLACES } from "@/mocks/mockData";
// import axiosInstance from "../../config/axios.config";

export interface HomePageData {
  curatedPlaces: Place[];
  trendingPlaces: Place[];
  topRatedPlaces: Place[];
}

/**
 * Fetch home page data — backend returns pre-computed sections.
 * The backend is responsible for curating, trending, and top-rated lists.
 * TODO: Replace with actual API endpoints when backend is ready.
 */
export const fetchHomePageData = async (): Promise<HomePageData> => {
  try {
    // TODO: Replace with real API calls, e.g.:
    // const [curated, trending, topRated] = await Promise.all([
    //   axiosInstance.get<Place[]>('/venues/curated'),
    //   axiosInstance.get<Place[]>('/venues/trending'),
    //   axiosInstance.get<Place[]>('/venues/top-rated'),
    // ]);
    // return { curatedPlaces: curated.data, trendingPlaces: trending.data, topRatedPlaces: topRated.data };

    // Simulate backend computing these sections from PLACES data
    const all = PLACES.map((p) => ({ ...p, isSaved: false }));

    const curatedPlaces = [...all]
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
      .slice(0, 5);

    const trendingPlaces = [...all]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 6);

    const topRatedPlaces = [...all].sort((a, b) => b.rating - a.rating);

    return Promise.resolve({ curatedPlaces, trendingPlaces, topRatedPlaces });
  } catch (error) {
    console.error("Error fetching home page data:", error);
    throw new Error("Failed to fetch home page data");
  }
};

/**
 * @deprecated Use fetchHomePageData instead.
 * Kept for backwards compatibility during migration.
 */
export const fetchPlaces = async (): Promise<Place[]> => {
  try {
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
