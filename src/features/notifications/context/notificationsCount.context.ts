import { createContext } from "react";

export interface NotificationsCountContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const NotificationsCountContext = createContext<
  NotificationsCountContextType | undefined
>(undefined);
