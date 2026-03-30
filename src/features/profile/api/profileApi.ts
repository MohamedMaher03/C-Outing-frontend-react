/**
 * Profile API Layer
 *
 * Pure HTTP functions with no business-side effects.
 * The service layer owns validation/normalization and can swap this API
 * source with mocks via `profileDataSource`.
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  NotificationSettings,
  PrivacySettings,
  UpdatePreferencesRequest,
  UserProfile,
  UpdateUserProfileRequest,
  UserPreferences,
} from "../types";
import type { ProfileDataSource } from "../types/dataSource";

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

  async getNotifications(): Promise<NotificationSettings> {
    const { data } = await axiosInstance.get<NotificationSettings>(
      API_ENDPOINTS.profile.getCurrentNotifications,
    );
    return data;
  },

  async updateNotifications(
    payload: NotificationSettings,
  ): Promise<NotificationSettings> {
    const { data } = await axiosInstance.put<NotificationSettings>(
      API_ENDPOINTS.profile.updateCurrentNotifications,
      payload,
    );
    return data;
  },

  // ── Privacy ────────────────────────────────────────────────

  async getPrivacy(): Promise<PrivacySettings> {
    const { data } = await axiosInstance.get<PrivacySettings>(
      API_ENDPOINTS.profile.getCurrentPrivacy,
    );
    return data;
  },

  async updatePrivacy(payload: PrivacySettings): Promise<PrivacySettings> {
    const { data } = await axiosInstance.put<PrivacySettings>(
      API_ENDPOINTS.profile.updateCurrentPrivacy,
      payload,
    );
    return data;
  },

  // ── Account Management ─────────────────────────────────────

  async downloadData(): Promise<Blob> {
    const { data } = await axiosInstance.get<Blob>(
      API_ENDPOINTS.profile.downloadData("me"),
      { responseType: "blob" },
    );
    return data;
  },

  async deleteAccount(): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.profile.deleteCurrentAccount);
  },

  async signOut(): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.auth.logout);
  },
} satisfies ProfileDataSource;
