import type { NotificationsDataSource } from "../types/dataSource";
import { notificationsApi } from "../api/notificationsApi";
import { notificationsMock } from "../mocks";

export type { NotificationsDataSource } from "../types/dataSource";

const shouldUseMocks = import.meta.env.VITE_NOTIFICATIONS_USE_MOCKS === "true";

// API is the default source to keep production behavior explicit.
export const notificationsDataSource: NotificationsDataSource = shouldUseMocks
  ? notificationsMock
  : notificationsApi;
