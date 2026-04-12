import type { NotificationsDataSource } from "../types/dataSource";
import { notificationsApi } from "../api/notificationsApi";
import { notificationsMock } from "../mocks";

export type { NotificationsDataSource } from "../types/dataSource";

const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const resolveFeatureMockFlag = (featureValue: unknown): boolean => {
  if (typeof featureValue === "string") {
    return parseBooleanEnv(featureValue);
  }

  return parseBooleanEnv(import.meta.env.VITE_USE_MOCKS);
};

const shouldUseMocks = resolveFeatureMockFlag(
  import.meta.env.VITE_NOTIFICATIONS_USE_MOCKS,
);

// API is the default source to keep production behavior explicit.
export const notificationsDataSource: NotificationsDataSource = shouldUseMocks
  ? notificationsMock
  : notificationsApi;
