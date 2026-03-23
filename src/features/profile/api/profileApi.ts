/**
 * Profile API Layer
 *
 * Pure HTTP functions — no business logic, no side effects.
 * Each function maps 1-to-1 with a backend endpoint using the shared
 * axiosInstance (src/config/axios.config.ts) which automatically:
 *   • Attaches the Authorization header on every request
 *   • Handles 401 responses globally
 *
 * ⚠️  CURRENTLY UNUSED — profileService.ts uses mock data.
 *     When the backend is ready, import and call these functions
 *     from profileService.ts instead of the mock helpers.
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  UserProfile,
  UpdateUserProfileRequest,
  UserPreferences,
  UpdatePreferencesRequest,
  NotificationSettings,
  PrivacySettings,
} from "../types";

const toDateOnly = (value: string): string => {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return trimmed;
};
// NOTE: All axiosInstance calls below use `T` as the generic (not `ApiResponse<T>`).
// The axiosInstance response interceptor automatically unwraps the
// { success, data: T, message } envelope, so response.data IS T directly.

export const profileApi = {
  // ── Profile ────────────────────────────────────────────────

  async getProfile(): Promise<UserProfile> {
    const { data } = await axiosInstance.get<UserProfile>(
      API_ENDPOINTS.profile.getCurrentProfile,
    );
    return data;
  },

  async updateProfile(
    payload: UpdateUserProfileRequest,
    avatarFile?: File,
  ): Promise<UserProfile> {
    if (avatarFile) {
      const formData = new FormData();

      if (payload.name !== undefined) {
        formData.append("Name", payload.name);
      }
      if (payload.birthDate !== undefined) {
        formData.append("BirthDate", toDateOnly(payload.birthDate));
      }
      if (payload.phoneNumber !== undefined) {
        formData.append("PhoneNumber", payload.phoneNumber);
      }
      formData.append("Avatar", avatarFile);

      const { data } = await axiosInstance.put<UserProfile>(
        API_ENDPOINTS.profile.updateCurrentProfile,
        formData,
      );
      return data;
    }

    const formBody = new URLSearchParams();
    if (payload.name !== undefined) {
      formBody.append("Name", payload.name);
    }
    if (payload.birthDate !== undefined) {
      formBody.append("BirthDate", toDateOnly(payload.birthDate));
    }
    if (payload.phoneNumber !== undefined) {
      formBody.append("PhoneNumber", payload.phoneNumber);
    }

    const { data } = await axiosInstance.put<UserProfile>(
      API_ENDPOINTS.profile.updateCurrentProfile,
      formBody,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return data;
  },

  // ── Preferences ────────────────────────────────────────────

  async getPreferences(userId: string): Promise<UserPreferences> {
    const { data } = await axiosInstance.get<UserPreferences>(
      API_ENDPOINTS.users.getPreferences(userId),
    );
    return data;
  },

  async updatePreferences(
    userId: string,
    payload: UpdatePreferencesRequest,
  ): Promise<UserPreferences> {
    const { data } = await axiosInstance.put<UserPreferences>(
      API_ENDPOINTS.users.updatePreferences(userId),
      payload,
    );
    return data;
  },

  // ── Notifications ──────────────────────────────────────────

  async getNotifications(userId: string): Promise<NotificationSettings> {
    const { data } = await axiosInstance.get<NotificationSettings>(
      API_ENDPOINTS.profile.getNotifications(userId),
    );
    return data;
  },

  async updateNotifications(
    userId: string,
    payload: NotificationSettings,
  ): Promise<NotificationSettings> {
    const { data } = await axiosInstance.put<NotificationSettings>(
      API_ENDPOINTS.profile.updateNotifications(userId),
      payload,
    );
    return data;
  },

  // ── Privacy ────────────────────────────────────────────────

  async getPrivacy(userId: string): Promise<PrivacySettings> {
    const { data } = await axiosInstance.get<PrivacySettings>(
      API_ENDPOINTS.profile.getPrivacy(userId),
    );
    return data;
  },

  async updatePrivacy(
    userId: string,
    payload: PrivacySettings,
  ): Promise<PrivacySettings> {
    const { data } = await axiosInstance.put<PrivacySettings>(
      API_ENDPOINTS.profile.updatePrivacy(userId),
      payload,
    );
    return data;
  },

  // ── Account Management ─────────────────────────────────────

  async downloadData(userId: string): Promise<Blob> {
    const { data } = await axiosInstance.get<Blob>(
      API_ENDPOINTS.profile.downloadData(userId),
      { responseType: "blob" },
    );
    return data;
  },

  async deleteAccount(userId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.profile.deleteAccount(userId));
  },
};
