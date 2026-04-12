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
    // NOTE: public profile by userId is currently pending backend confirmation.
    getPublicProfile: (userId: string) => `/api/v1/User/${userId}/profile`,
    getReviews: (userId: string) => `/api/v1/Review/user/${userId}`,
  },

  profile: {
    getCurrentProfile: "/api/v1/User/profile",
    updateCurrentProfile: "/api/v1/User/profile",
    getCurrentNotifications: "/api/v1/User/profile/notifications",
    updateCurrentNotifications: "/api/v1/User/profile/notifications",
    getCurrentPrivacy: "/api/v1/User/profile/privacy",
    updateCurrentPrivacy: "/api/v1/User/profile/privacy",
    deleteCurrentAccount: "/api/v1/User/profile",
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
    getAll: "/api/v1/Favorite",
    add: "/api/v1/Favorite",
    remove: (venueId: string) => `/api/v1/Favorite/${venueId}`,
    check: (venueId: string) => `/api/v1/Favorite/check/${venueId}`,
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
    getById: (id: string) => `/api/v1/Venue/${id}`,
    scrapeInitiate: "/api/v1/Venue/scrape/initiate",
    toggleLike: (id: string) => `/api/v1/Venue/${id}/like`,
    getReviews: (venueId: string) => `/api/v1/Review/venue/${venueId}`,
    submitReview: "/api/v1/Review",
    getSocialReviews: (venueId: string) =>
      `/api/v1/Review/social/venue/${venueId}`,
    getReviewById: (reviewId: string) => `/api/v1/Review/${reviewId}`,
    editReview: (reviewId: string) => `/api/v1/Review/${reviewId}`,
    deleteReview: (reviewId: string) => `/api/v1/Review/${reviewId}`,
    reportReview: (reviewId: string) => `/api/v1/Review/${reviewId}/report`,
    getUserReviews: (userId: string) => `/api/v1/Review/user/${userId}`,
    getMyReview: (venueId: string) =>
      `/api/v1/Review/venue/${venueId}/my-review`,
    getAverageRating: (venueId: string) =>
      `/api/v1/Review/venue/${venueId}/average-rating`,
  },

  // ── Notifications (in-app feed) ────────────────────────────
  notifications: {
    getAll: "/api/v1/Notification",
    getUnread: "/api/v1/Notification/unread",
    getUnreadCount: "/api/v1/Notification/unread-count",
    markRead: (notificationId: string) =>
      `/api/v1/Notification/${notificationId}/read`,
    markAllRead: "/api/v1/Notification/read-all",
    delete: (notificationId: string) =>
      `/api/v1/Notification/${notificationId}`,
  },

  // ── Interactions ─────────────────────────────────────────────
  interactions: {
    record: "/interactions",
  },

  // ── Admin ─────────────────────────────────────────────────────
  admin: {
    getStats: "/api/v1/Admin/stats",
    getUsers: "/api/v1/Admin/users",
    getUserById: (userId: string) => `/api/v1/Admin/users/${userId}`,
    deleteUser: (userId: string) => `/api/v1/Admin/users/${userId}`,
    banUser: (userId: string) => `/api/v1/Admin/users/${userId}/ban`,
    unbanUser: (userId: string) => `/api/v1/Admin/users/${userId}/unban`,
    getVenues: "/api/v1/Admin/venues",
    deleteVenue: (venueId: string) => `/api/v1/Admin/venues/${venueId}`,
    updateVenueStatus: (venueId: string) =>
      `/api/v1/Admin/venues/${venueId}/status`,
    getReportedVenues: "/api/v1/Admin/venues/reported",
    getCategories: "/api/v1/Admin/categories",
    getReviews: "/api/v1/Admin/reviews",
    updateReviewStatus: (reviewId: string) =>
      `/api/v1/Admin/reviews/${reviewId}/status`,
    deleteReview: (reviewId: string) => `/api/v1/Admin/reviews/${reviewId}`,
    getSystemHealth: "/api/v1/Admin/system/health",
  },

  // ── Moderator ────────────────────────────────────────────────
  moderator: {
    getStats: "/api/v1/Moderator/stats",
    getReportedContent: "/api/v1/Moderator/reports",
    updateReportStatus: (reportId: string) =>
      `/api/v1/Moderator/reports/${reportId}/status`,
    getRecentActions: "/api/v1/Moderator/actions",
    deleteReview: (reportId: string) =>
      `/api/v1/Moderator/reports/${reportId}/delete-review`,
    warnUser: (reportId: string) =>
      `/api/v1/Moderator/reports/${reportId}/warn`,
    banUser: (reportId: string) => `/api/v1/Moderator/reports/${reportId}/ban`,
  },
};
