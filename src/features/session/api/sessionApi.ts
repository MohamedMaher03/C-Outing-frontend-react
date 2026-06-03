import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";

import type {
  Session,
  SessionRecommendation,
  SessionVotes,
} from "../types/session.types";
import {
  normalizeSession,
  normalizeSessionVotes,
} from "../utils/normalizeSessionPayload";

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

const mapVenueToRecommendation = (
  venue: SessionRecommendationVenue,
): SessionRecommendation => ({
  id: venue.id,
  name: venue.name,
  address: venue.location,
  category: venue.category,
  imageUrl: venue.displayImageUrl ?? venue.thumbnailUrl,
  rating: typeof venue.averageRating === "number" ? venue.averageRating : null,
  priceRange: venue.priceRange,
  atmosphereTags: Array.isArray(venue.atmosphereTags)
    ? venue.atmosphereTags
    : [],
});

export const sessionApi = {
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

  async joinSession(code: string): Promise<Session> {
    const response = await axiosInstance.post<Session>(
      API_ENDPOINTS.session.join(code),
    );
    return normalizeSession(response.data) ?? response.data;
  },

  async leaveSession(code: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.session.leave(code));
  },

  async getSession(code: string): Promise<Session> {
    const response = await axiosInstance.get<Session>(
      API_ENDPOINTS.session.get(code),
    );
    return normalizeSession(response.data) ?? response.data;
  },

  async getRecommendations(
    code: string,
    params?: { count?: number },
  ): Promise<SessionRecommendation[]> {
    const response = await axiosInstance.get<SessionRecommendationsResponse>(
      API_ENDPOINTS.session.recommend(code),
      { params: { count: params?.count ?? 10 } },
    );
    const entries = response.data?.recommendations ?? [];
    return [...entries]
      .sort((left, right) => left.rank - right.rank)
      .map(({ venue }) => mapVenueToRecommendation(venue));
  },

  async endSession(code: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.session.end(code));
  },

  async submitVote(code: string, venueId: string): Promise<SessionVotes> {
    const response = await axiosInstance.post<SessionVotes>(
      API_ENDPOINTS.session.vote(code),
      { venueId },
    );
    return (
      normalizeSessionVotes(response.data, code) ?? {
        code,
        totalMembers: 0,
        submittedVotes: 0,
        options: [],
        winningVenueId: null,
      }
    );
  },

  async finalizeVotes(code: string): Promise<SessionVotes> {
    const response = await axiosInstance.post<SessionVotes>(
      API_ENDPOINTS.session.voteFinalize(code),
    );
    return (
      normalizeSessionVotes(response.data, code) ?? {
        code,
        totalMembers: 0,
        submittedVotes: 0,
        options: [],
        winningVenueId: null,
      }
    );
  },

  async getVotes(code: string): Promise<SessionVotes | null> {
    const response = await axiosInstance.get<SessionVotes>(
      API_ENDPOINTS.session.votes(code),
    );
    return normalizeSessionVotes(response.data, code);
  },
};
