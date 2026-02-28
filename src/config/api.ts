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

  // Profile settings (notifications, privacy, account)
  profile: {
    getNotifications: (userId: number) =>
      `${API_BASE_URL}/users/${userId}/notifications`,
    updateNotifications: (userId: number) =>
      `${API_BASE_URL}/users/${userId}/notifications`,
    getPrivacy: (userId: number) => `${API_BASE_URL}/users/${userId}/privacy`,
    updatePrivacy: (userId: number) =>
      `${API_BASE_URL}/users/${userId}/privacy`,
    downloadData: (userId: number) =>
      `${API_BASE_URL}/users/${userId}/data/export`,
    deleteAccount: (userId: number) =>
      `${API_BASE_URL}/users/${userId}/account`,
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
