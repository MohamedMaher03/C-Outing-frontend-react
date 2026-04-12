import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export interface NotificationsCountContextType {
  unreadCount: number;
  setUnreadCount: Dispatch<SetStateAction<number>>;
}

export const NotificationsCountContext = createContext<
  NotificationsCountContextType | undefined
>(undefined);
