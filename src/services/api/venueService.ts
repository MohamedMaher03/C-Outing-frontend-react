/**
 * Venue Service
 * Handles venue retrieval, search, and filtering
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "../../config/api";
import {
  Venue,
  VenueDetails,
  ApiResponse,
  PaginatedResponse,
  VenueFilter,
} from "../../types";

export const venueService = {
  /**
   * Get paginated list of venues
   */
  async listVenues(filters?: VenueFilter): Promise<PaginatedResponse<Venue>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Venue>>>(
      API_ENDPOINTS.venues.list,
      { params: filters },
    );
    return response.data!;
  },

  /**
   * Get detailed venue information
   */
  async getVenueDetails(venueId: number): Promise<VenueDetails> {
    const response = await apiClient.get<ApiResponse<VenueDetails>>(
      API_ENDPOINTS.venues.getById(venueId),
    );
    return response.data!;
  },

  /**
   * Search venues by query
   */
  async searchVenues(
    query: string,
    filters?: Omit<VenueFilter, "searchQuery">,
  ): Promise<PaginatedResponse<Venue>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Venue>>>(
      API_ENDPOINTS.venues.search,
      { params: { ...filters, searchQuery: query } },
    );
    return response.data!;
  },
};
