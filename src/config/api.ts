/**
 * API Configuration
 * Centralized API endpoints and configuration for backend integration
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/users/login`,
    register: `${API_BASE_URL}/users/register`,
    logout: `${API_BASE_URL}/users/logout`,
  },

  // Users
  users: {
    getProfile: (userId: number) => `${API_BASE_URL}/users/${userId}`,
    updateProfile: (userId: number) => `${API_BASE_URL}/users/${userId}`,
    getPreferences: (userId: number) =>
      `${API_BASE_URL}/users/${userId}/preferences`,
    updatePreferences: (userId: number) =>
      `${API_BASE_URL}/users/${userId}/preferences`,
  },

  // Recommendations
  recommendations: {
    getByUserId: (userId: number) =>
      `${API_BASE_URL}/recommendations/${userId}`,
  },

  // Venues
  venues: {
    list: `${API_BASE_URL}/venues`,
    getById: (venueId: number) => `${API_BASE_URL}/venue/${venueId}`,
    search: `${API_BASE_URL}/venues/search`,
  },

  // Interactions & Ratings
  interactions: {
    track: `${API_BASE_URL}/interactions`,
  },
  ratings: {
    submit: (venueId: number) => `${API_BASE_URL}/rate/${venueId}`,
  },
};

// API Configuration Constants
export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 10,
  maxPageSize: 100,
};
