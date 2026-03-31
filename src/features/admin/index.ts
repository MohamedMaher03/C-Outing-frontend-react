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

// Shared admin UI components
export {
  AdminPageHeader,
  AdminErrorBanner,
  AdminFilterChips,
  AdminEmptyState,
  AdminPageLayout,
  AdminSection,
} from "./components";

// Types
export type {
  AdminStats,
  AdminUser,
  AdminUserId,
  AdminUserRole,
  AdminUserRoleFilter,
  AdminUserStatus,
  AdminPlace,
  AdminPlaceStatus,
  AdminPlaceStatusFilter,
  AdminReview,
  AdminReviewStatus,
  AdminReviewStatusFilter,
  AdminCategory,
  AdminCategoryStatus,
  SystemSettings,
  RecentActivity,
  AdminActivityType,
  CreateAdminPlaceInput,
  AdminToast,
  PlaceFormData,
  PlaceFormErrors,
} from "./types";
export type { AdminDataSource } from "./types/dataSource";

// Mocks (development use)
export { adminMock } from "./mocks/adminMock";
