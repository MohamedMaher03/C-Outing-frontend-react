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
    login: "/api/v1/Auth/login",
    register: "/api/v1/Auth/register",
    logout: "/api/v1/Auth/logout",
    verifyEmail: "/api/v1/Auth/verify-email",
    resendOtp: "/api/v1/Auth/resend-reset-password-otp",
    forgotPassword: "/api/v1/Auth/forgot-password",
    resetPassword: "/api/v1/Auth/reset-password",
  },

  // ── Users / Profile ──────────────────────────────────────────
  users: {
    getMe: "/users/me",
    getProfile: (userId: string) => `/users/${userId}`,
    updateProfile: (userId: string) => `/users/${userId}`,
    getPreferences: (userId: string) => `/users/${userId}/preferences`,
    updatePreferences: (userId: string) => `/users/${userId}/preferences`,
    // Public-user endpoints (used by features/users)
    getPublicProfile: (userId: string) => `/users/${userId}`,
    getReviews: (userId: string) => `/users/${userId}/reviews`,
    follow: (userId: string) => `/users/${userId}/follow`,
  },

  profile: {
    uploadAvatar: (userId: string) => `/users/${userId}/avatar`,
    getNotifications: (userId: string) => `/users/${userId}/notifications`,
    updateNotifications: (userId: string) => `/users/${userId}/notifications`,
    getPrivacy: (userId: string) => `/users/${userId}/privacy`,
    updatePrivacy: (userId: string) => `/users/${userId}/privacy`,
    downloadData: (userId: string) => `/users/${userId}/data/export`,
    deleteAccount: (userId: string) => `/users/${userId}/account`,
  },

  // ── Home / Venues ────────────────────────────────────────────
  home: {
    // NOTE: curatedPlaces are personalized recommendations — userId is REQUIRED.
    // There is no generic /venues/curated endpoint; the backend computes
    // a ranked list from the user's preference vector.

    toggleSave: (placeId: string) => `/api/v1/Venue/${placeId}/save`,
    // Returns places filtered by mood (e.g., "chill", "romantic").
    // The backend applies its own mood-to-attribute mapping.
    moodPlaces: (moodId: string) => `/api/v1/Venue/mood/${moodId}`,

    // Venue discovery endpoints (standard envelope: ApiResponse<HomePlace[]>)
    venuesByDistrict: (district: string) =>
      `/api/v1/Venue/district/${encodeURIComponent(district)}`,
    venuesByType: (type: string) =>
      `/api/v1/Venue/type/${encodeURIComponent(type)}`,
    venuesByPriceRange: (priceRange: string) =>
      `/api/v1/Venue/price-range/${encodeURIComponent(priceRange)}`,
    venueTopRated: "/api/v1/Venue/top-rated",
    venueTopRatedInArea: "/api/v1/Venue/top-rated-in-area",
  },

  // ── Recommendations ────────────────────────────────────────────────
  recommendations: {
    curated: "/api/v1/Recommendation/personalized",
    similar: (venueId: string) => `/api/v1/Recommendation/similar/${venueId}`,
    trending: "/api/v1/Recommendation/trending",
  },
  // ── Favorites ────────────────────────────────────────────────
  favorites: {
    getAll: (userId: string) => `/users/${userId}/favorites`,
    add: (userId: string) => `/users/${userId}/favorites`,
    remove: (userId: string, placeId: string) =>
      `/users/${userId}/favorites/${placeId}`,
    check: (userId: string, placeId: string) =>
      `/users/${userId}/favorites/${placeId}/check`,
  },

  // ── Onboarding (preferences submission) ──────────────────────
  // Re-uses users.updatePreferences for the actual save.
  // A dedicated key is provided so onboarding code reads naturally.
  onboarding: {
    submitPreferences: (userId: string) => `/users/${userId}/preferences`,
    updatePreferences: (userId: string) => `/users/${userId}/preferences`,
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
    getAll: (userId: string) => `/api/v1/users/${userId}/notifications`,
    markRead: (notificationId: string) =>
      `/api/v1/notifications/${notificationId}/read`,
    markAllRead: (userId: string) =>
      `/api/v1/users/${userId}/notifications/read-all`,
    delete: (notificationId: string) =>
      `/api/v1/notifications/${notificationId}`,
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
    updateUserRole: (userId: string) => `/admin/users/${userId}/role`,
    updateUserStatus: (userId: string) => `/admin/users/${userId}/status`,
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
