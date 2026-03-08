/**
 * API Configuration
 * Centralized API endpoints and configuration for backend integration.
 *
 * Every endpoint used by any feature is defined here so that URL strings
 * live in a single, auditable place.  Feature-level `*Api.ts` files
 * import from this module — they never hard-code paths.
 */

export const API_ENDPOINTS = {
  // ── Auth ─────────────────────────────────────────────────────
  auth: {
    login: "/login",
    register: "/register",
    logout: "/logout",
  },

  // ── Users / Profile ──────────────────────────────────────────
  users: {
    getMe: "/users/me",
    getProfile: (userId: number) => `/users/${userId}`,
    updateProfile: (userId: number) => `/users/${userId}`,
    getPreferences: (userId: number) => `/users/${userId}/preferences`,
    updatePreferences: (userId: number) => `/users/${userId}/preferences`,
    // Public-user endpoints (used by features/users)
    getPublicProfile: (userId: string) => `/users/${userId}`,
    getReviews: (userId: string) => `/users/${userId}/reviews`,
    follow: (userId: string) => `/users/${userId}/follow`,
  },

  profile: {
    uploadAvatar: (userId: number) => `/users/${userId}/avatar`,
    getNotifications: (userId: number) => `/users/${userId}/notifications`,
    updateNotifications: (userId: number) => `/users/${userId}/notifications`,
    getPrivacy: (userId: number) => `/users/${userId}/privacy`,
    updatePrivacy: (userId: number) => `/users/${userId}/privacy`,
    downloadData: (userId: number) => `/users/${userId}/data/export`,
    deleteAccount: (userId: number) => `/users/${userId}/account`,
  },

  // ── Home / Venues ────────────────────────────────────────────
  home: {
    // NOTE: curatedPlaces are personalized recommendations — userId is REQUIRED.
    // There is no generic /venues/curated endpoint; the backend computes
    // a ranked list from the user's preference vector.
    curated: (userId: number) => `/recommendations/${userId}`,
    trending: "/venues/trending",
    topRated: "/venues/top-rated",
    toggleSave: (placeId: string) => `/venues/${placeId}/save`,
  },

  // ── Favorites ────────────────────────────────────────────────
  favorites: {
    getAll: (userId: number) => `/users/${userId}/favorites`,
    add: (userId: number) => `/users/${userId}/favorites`,
    remove: (userId: number, placeId: string) =>
      `/users/${userId}/favorites/${placeId}`,
    check: (userId: number, placeId: string) =>
      `/users/${userId}/favorites/${placeId}/check`,
  },

  // ── Onboarding (preferences submission) ──────────────────────
  // Re-uses users.updatePreferences for the actual save.
  // A dedicated key is provided so onboarding code reads naturally.
  onboarding: {
    submitPreferences: (userId: number) => `/users/${userId}/preferences`,
    updatePreferences: (userId: number) => `/users/${userId}/preferences`,
  },

  // ── Places / Detail ──────────────────────────────────────────
  places: {
    getById: (placeId: string) => `/places/${placeId}`,
    getReviews: (placeId: string) => `/places/${placeId}/reviews`,
    submitReview: (placeId: string) => `/places/${placeId}/reviews`,
    getSocialReviews: (placeId: string) => `/places/${placeId}/social-reviews`,
    getReviewSummary: (placeId: string) => `/places/${placeId}/review-summary`,
    getSimilar: (placeId: string) => `/places/${placeId}/similar`,
  },

  // ── Notifications (in-app feed) ────────────────────────────
  notifications: {
    getAll: (userId: number) => `/users/${userId}/notifications`,
    markRead: (notificationId: string) =>
      `/notifications/${notificationId}/read`,
    markAllRead: (userId: number) => `/users/${userId}/notifications/read-all`,
    delete: (notificationId: string) => `/notifications/${notificationId}`,
  },

  // ── Interactions ─────────────────────────────────────────────
  interactions: {
    record: "/interactions",
  },

  // ── Admin ─────────────────────────────────────────────────────
  admin: {
    getStats: "/admin/stats",
    getRecentActivity: "/admin/activity",
    getUsers: "/admin/users",
    updateUserRole: (userId: number) => `/admin/users/${userId}/role`,
    updateUserStatus: (userId: number) => `/admin/users/${userId}/status`,
    getPlaces: "/admin/places",
    addPlace: "/admin/places",
    updatePlaceStatus: (placeId: string) => `/admin/places/${placeId}/status`,
    deletePlace: (placeId: string) => `/admin/places/${placeId}`,
    getReviews: "/admin/reviews",
    updateReviewStatus: (reviewId: string) =>
      `/admin/reviews/${reviewId}/status`,
    deleteReview: (reviewId: string) => `/admin/reviews/${reviewId}`,
    getCategories: "/admin/categories",
    updateCategory: (categoryId: string) => `/admin/categories/${categoryId}`,
    getSettings: "/admin/settings",
    updateSettings: "/admin/settings",
  },

  // ── Moderator ────────────────────────────────────────────────
  moderator: {
    getStats: "/moderator/stats",
    getReportedContent: "/moderator/reports",
    updateReportStatus: (reportId: string) =>
      `/moderator/reports/${reportId}/status`,
    getRecentActions: "/moderator/actions",
    deleteReview: (reportId: string) =>
      `/moderator/reports/${reportId}/delete-review`,
    warnUser: (reportId: string) => `/moderator/reports/${reportId}/warn`,
    banUser: (reportId: string) => `/moderator/reports/${reportId}/ban`,
  },
};
