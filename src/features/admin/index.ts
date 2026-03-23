/**
 * Admin Feature — Public API
 */

// Hooks
export { useAdminDashboard } from "./hooks/useAdminDashboard";
export { useManageUsers } from "./hooks/useManageUsers";
export { useManagePlaces } from "./hooks/useManagePlaces";
export { useManageReviews } from "./hooks/useManageReviews";
export { useManageCategories } from "./hooks/useManageCategories";
export { useSystemSettings } from "./hooks/useSystemSettings";

// API layer (exposed for advanced usage / testing)
export { adminApi } from "./api/adminApi";

// Services
export { adminService } from "./services/adminService";

// Types
export type {
  AdminStats,
  AdminUser,
  AdminUserId,
  AdminUserRole,
  AdminUserStatus,
  AdminPlace,
  AdminReview,
  AdminCategory,
  SystemSettings,
  RecentActivity,
  CreateAdminPlaceInput,
  AdminToast,
  PlaceFormData,
  PlaceFormErrors,
} from "./types";

// Mocks (development use)
export { adminMock } from "./mocks/adminMock";
