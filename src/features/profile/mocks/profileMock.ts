import type { ProfileDataSource } from "../types/dataSource";
import {
  MOCK_EDIT_PROFILE,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_PREFERENCES,
  MOCK_PRIVACY_SETTINGS,
  MOCK_PROFILE,
} from "./profileFixtures";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read uploaded avatar."));
    reader.readAsDataURL(file);
  });

let mockProfile = clone(MOCK_PROFILE);
let mockPreferences = clone(MOCK_PREFERENCES);
let mockNotifications = clone(MOCK_NOTIFICATION_SETTINGS);
let mockPrivacy = clone(MOCK_PRIVACY_SETTINGS);

export const profileMock: ProfileDataSource = {
  async getProfile() {
    await delay(250);
    return clone(mockProfile);
  },

  async updateProfile(payload, avatarFile) {
    await delay(400);

    mockProfile = {
      ...mockProfile,
      ...payload,
      name: payload.name ?? mockProfile.name,
      phoneNumber: payload.phoneNumber ?? mockProfile.phoneNumber,
      birthDate: payload.birthDate ?? mockProfile.birthDate,
      updatedAt: new Date().toISOString(),
    };

    if (avatarFile) {
      const avatarUrl = await fileToDataUrl(avatarFile);
      mockProfile = {
        ...mockProfile,
        avatarUrl,
      };
    }

    return clone(mockProfile);
  },

  async getPreferences(_userId) {
    void _userId;
    await delay(250);
    return clone(mockPreferences);
  },

  async updatePreferences(_userId, payload) {
    await delay(350);
    mockPreferences = {
      ...mockPreferences,
      ...payload,
    };
    return clone(mockPreferences);
  },

  async getNotifications() {
    await delay(250);
    return clone(mockNotifications);
  },

  async updateNotifications(payload) {
    await delay(350);
    mockNotifications = clone(payload);
    return clone(mockNotifications);
  },

  async getPrivacy() {
    await delay(250);
    return clone(mockPrivacy);
  },

  async updatePrivacy(payload) {
    await delay(350);
    mockPrivacy = clone(payload);
    return clone(mockPrivacy);
  },

  async downloadData() {
    await delay(350);
    const payload = {
      profile: mockProfile,
      preferences: mockPreferences,
      notifications: mockNotifications,
      privacy: mockPrivacy,
      exportedAt: new Date().toISOString(),
    };

    return new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
  },

  async deleteAccount() {
    await delay(450);
    mockProfile = clone({
      ...MOCK_PROFILE,
      ...MOCK_EDIT_PROFILE,
      id: "",
      name: "Guest User",
      email: "",
      phoneNumber: "",
    });
    mockPreferences = clone(MOCK_PREFERENCES);
    mockNotifications = clone(MOCK_NOTIFICATION_SETTINGS);
    mockPrivacy = clone(MOCK_PRIVACY_SETTINGS);
  },

  async signOut() {
    await delay(180);
  },
};
