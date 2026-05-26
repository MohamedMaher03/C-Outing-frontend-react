import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { Session, SessionRecommendation } from "../types/session.types";

interface SessionRecommendationVenue {
  id: string;
  name: string;
  location: string;
  category: string | null;
  priceRange: string | null;
  averageRating: number | null;
  displayImageUrl: string | null;
  thumbnailUrl: string | null;
  atmosphereTags: string[] | null;
}

interface SessionRecommendationEntry {
  rank: number;
  venue: SessionRecommendationVenue;
}

interface SessionRecommendationsResponse {
  recommendations: SessionRecommendationEntry[];
}

export const sessionApi = {
  /**
   * POST /api/v1/Session
   * Backend returns data as a plain string code e.g. "302174"
   */
  async createSession(): Promise<string> {
    const response = await axiosInstance.post<string>(
      API_ENDPOINTS.session.create,
    );
    const code = response.data;
    if (!code || typeof code !== "string") {
      throw new Error("Server did not return a valid session code.");
    }
    return code;
  },

  /** POST /api/v1/Session/{code}/join */
  async joinSession(code: string): Promise<Session> {
    const response = await axiosInstance.post<Session>(
      API_ENDPOINTS.session.join(code),
    );
    return response.data;
  },

  /** POST /api/v1/Session/{code}/leave */
  async leaveSession(code: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.session.leave(code));
  },

  /** GET /api/v1/Session/{code} — poll for current session state */
  async getSession(code: string): Promise<Session> {
    const response = await axiosInstance.get<Session>(
      API_ENDPOINTS.session.get(code),
    );
    return response.data;
  },

  /** GET /api/v1/Session/{code}/recommend — get group recommendations */
  async getRecommendations(
    code: string,
    params?: { count?: number },
  ): Promise<SessionRecommendation[]> {
    const response = await axiosInstance.get<SessionRecommendationsResponse>(
      API_ENDPOINTS.session.recommend(code),
      {
        params: { count: params?.count ?? 10 },
      },
    );
    const entries = response.data?.recommendations ?? [];
    return [...entries]
      .sort((a, b) => a.rank - b.rank)
      .map(({ venue }) => ({
        id: venue.id,
        name: venue.name,
        address: venue.location,
        category: venue.category,
        imageUrl: venue.displayImageUrl ?? venue.thumbnailUrl,
        rating:
          typeof venue.averageRating === "number" ? venue.averageRating : null,
        priceRange: venue.priceRange,
        atmosphereTags: Array.isArray(venue.atmosphereTags)
          ? venue.atmosphereTags
          : [],
      }));
  },
};
