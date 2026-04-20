import type { NotificationsDataSource } from "../types/dataSource";
import { notificationsApi } from "../api/notificationsApi";
import { notificationsMock } from "../mocks";
import { selectDataSource } from "@/utils/dataSourceResolver";

export type { NotificationsDataSource } from "../types/dataSource";

export const notificationsDataSource: NotificationsDataSource =
  selectDataSource(
    import.meta.env.VITE_NOTIFICATIONS_USE_MOCKS,
    notificationsMock,
    notificationsApi,
  );
