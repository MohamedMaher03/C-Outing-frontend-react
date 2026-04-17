import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  NotificationsCountContext,
  type NotificationsCountContextType,
} from "@/features/notifications/context/notificationsCount.context";
import { useNotificationsCount } from "@/features/notifications/hooks/useNotificationsCount";

describe("useNotificationsCount", () => {
  it("throws when used outside NotificationsCountProvider", () => {
    expect(() => renderHook(() => useNotificationsCount())).toThrow(
      "useNotificationsCount must be used within NotificationsCountProvider",
    );
  });

  it("returns unread count context values when provided", () => {
    const setUnreadCount = jest.fn();

    const wrapper = ({ children }: { children: ReactNode }) => {
      const value: NotificationsCountContextType = {
        unreadCount: 7,
        setUnreadCount,
      };

      return (
        <NotificationsCountContext.Provider value={value}>
          {children}
        </NotificationsCountContext.Provider>
      );
    };

    const { result } = renderHook(() => useNotificationsCount(), { wrapper });

    expect(result.current.unreadCount).toBe(7);
    expect(result.current.setUnreadCount).toBe(setUnreadCount);
  });
});
