/**
 * Admin Service — Business Logic Layer
 *
 * Sits between hooks and the HTTP layer (adminApi).
 * Responsibilities:
 *   • Call adminApi functions
 *   • Transform DTOs to UI models if needed
 *   • Centralise error handling
 *
 * ┌───────────────────────────────────────────────────────────────┐
 * │  useAdmin*  →  adminService  →  adminApi  →  axios            │
 * └───────────────────────────────────────────────────────────────┘
 *
 * 🔧 To use mocks during development, swap the import:
 *   import { adminMock as adminApi } from "../mocks/adminMock";
 */

// import { adminApi } from "../api/adminApi"; // (WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
import { adminMock as adminApi } from "../mocks/adminMock";
import type {
  AdminStats,
  AdminUser,
  AdminPlace,
  AdminReview,
  AdminCategory,
  SystemSettings,
  RecentActivity,
} from "../types";

// ── Admin Service ─────────────────────────────────────────────

export const adminService = {
  async getStats(): Promise<AdminStats> {
    try {
      return await adminApi.getStats();
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw new Error("Failed to load admin stats");
    }
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      return await adminApi.getRecentActivity();
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw new Error("Failed to load recent activity");
    }
  },

  async getUsers(): Promise<AdminUser[]> {
    try {
      return await adminApi.getUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to load users");
    }
  },

  async updateUserRole(
    userId: number,
    role: "user" | "moderator" | "admin",
  ): Promise<void> {
    try {
      await adminApi.updateUserRole(userId, role);
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Failed to update user role");
    }
  },

  async updateUserStatus(
    userId: number,
    status: "active" | "banned" | "suspended",
  ): Promise<void> {
    try {
      await adminApi.updateUserStatus(userId, status);
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error("Failed to update user status");
    }
  },

  async getPlaces(): Promise<AdminPlace[]> {
    try {
      return await adminApi.getPlaces();
    } catch (error) {
      console.error("Error fetching places:", error);
      throw new Error("Failed to load places");
    }
  },

  async addPlace(
    placeData: Omit<
      AdminPlace,
      "id" | "rating" | "reviewCount" | "createdAt" | "status"
    >,
  ): Promise<AdminPlace> {
    try {
      return await adminApi.addPlace(placeData);
    } catch (error) {
      console.error("Error adding place:", error);
      throw new Error("Failed to add place");
    }
  },

  async updatePlaceStatus(
    placeId: string,
    status: AdminPlace["status"],
  ): Promise<void> {
    try {
      await adminApi.updatePlaceStatus(placeId, status);
    } catch (error) {
      console.error("Error updating place status:", error);
      throw new Error("Failed to update place status");
    }
  },

  async deletePlace(placeId: string): Promise<void> {
    try {
      await adminApi.deletePlace(placeId);
    } catch (error) {
      console.error("Error deleting place:", error);
      throw new Error("Failed to delete place");
    }
  },

  async getReviews(): Promise<AdminReview[]> {
    try {
      return await adminApi.getReviews();
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw new Error("Failed to load reviews");
    }
  },

  async updateReviewStatus(
    reviewId: string,
    status: AdminReview["status"],
  ): Promise<void> {
    try {
      await adminApi.updateReviewStatus(reviewId, status);
    } catch (error) {
      console.error("Error updating review status:", error);
      throw new Error("Failed to update review status");
    }
  },

  async deleteReview(reviewId: string): Promise<void> {
    try {
      await adminApi.deleteReview(reviewId);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw new Error("Failed to delete review");
    }
  },

  async getCategories(): Promise<AdminCategory[]> {
    try {
      return await adminApi.getCategories();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to load categories");
    }
  },

  async updateCategory(
    categoryId: string,
    data: Partial<AdminCategory>,
  ): Promise<void> {
    try {
      await adminApi.updateCategory(categoryId, data);
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Failed to update category");
    }
  },

  async getSettings(): Promise<SystemSettings> {
    try {
      return await adminApi.getSettings();
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw new Error("Failed to load settings");
    }
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    try {
      await adminApi.updateSettings(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw new Error("Failed to update settings");
    }
  },
};
