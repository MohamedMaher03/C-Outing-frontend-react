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
  UserPreferences,
  UpdatePreferencesRequest,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
} from "../types";

export const profileApi = {
  // ── Profile ────────────────────────────────────────────────

  async getProfile(userId: number): Promise<UserProfile> {
    const { data } = await axiosInstance.get<UserProfile>(
      API_ENDPOINTS.users.getProfile(userId),
    );
    return data;
  },

  async updateProfile(
    userId: number,
    payload: Partial<EditProfileData>,
  ): Promise<UserProfile> {
    const { data } = await axiosInstance.put<UserProfile>(
      API_ENDPOINTS.users.updateProfile(userId),
      payload,
    );
    return data;
  },

  // ── Avatar ─────────────────────────────────────────────────

  async uploadAvatar(
    userId: number,
    file: File,
  ): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await axiosInstance.post<{ avatarUrl: string }>(
      API_ENDPOINTS.profile.uploadAvatar(userId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  // ── Preferences ────────────────────────────────────────────

  async getPreferences(userId: number): Promise<UserPreferences> {
    const { data } = await axiosInstance.get<UserPreferences>(
      API_ENDPOINTS.users.getPreferences(userId),
    );
    return data;
  },

  async updatePreferences(
    userId: number,
    payload: UpdatePreferencesRequest,
  ): Promise<UserPreferences> {
    const { data } = await axiosInstance.put<UserPreferences>(
      API_ENDPOINTS.users.updatePreferences(userId),
      payload,
    );
    return data;
  },

  // ── Notifications ──────────────────────────────────────────

  async getNotifications(userId: number): Promise<NotificationSettings> {
    const { data } = await axiosInstance.get<NotificationSettings>(
      API_ENDPOINTS.profile.getNotifications(userId),
    );
    return data;
  },

  async updateNotifications(
    userId: number,
    payload: NotificationSettings,
  ): Promise<NotificationSettings> {
    const { data } = await axiosInstance.put<NotificationSettings>(
      API_ENDPOINTS.profile.updateNotifications(userId),
      payload,
    );
    return data;
  },

  // ── Privacy ────────────────────────────────────────────────

  async getPrivacy(userId: number): Promise<PrivacySettings> {
    const { data } = await axiosInstance.get<PrivacySettings>(
      API_ENDPOINTS.profile.getPrivacy(userId),
    );
    return data;
  },

  async updatePrivacy(
    userId: number,
    payload: PrivacySettings,
  ): Promise<PrivacySettings> {
    const { data } = await axiosInstance.put<PrivacySettings>(
      API_ENDPOINTS.profile.updatePrivacy(userId),
      payload,
    );
    return data;
  },

  // ── Account Management ─────────────────────────────────────

  async downloadData(userId: number): Promise<Blob> {
    const { data } = await axiosInstance.get<Blob>(
      API_ENDPOINTS.profile.downloadData(userId),
      { responseType: "blob" },
    );
    return data;
  },

  async deleteAccount(userId: number): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.profile.deleteAccount(userId));
  },
};
