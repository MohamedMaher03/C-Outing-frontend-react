import { act, renderHook, waitFor } from "@testing-library/react";
import { useNotifications } from "../../../../../features/notifications/hooks/useNotifications";
import { notificationsService } from "../../../../../features/notifications/services/notificationsService";
import { useNotificationsCount } from "../../../../../features/notifications/hooks/useNotificationsCount";
import type {
  Notification,
  NotificationsResponse,
} from "../../../../../features/notifications/types";

jest.mock("@/features/notifications/services/notificationsService", () => ({
  notificationsService: {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
}));

jest.mock("@/features/notifications/hooks/useNotificationsCount", () => ({
  useNotificationsCount: jest.fn(),
}));

const mockedNotificationsService = notificationsService as jest.Mocked<
  typeof notificationsService
>;
const mockedUseNotificationsCount =
  useNotificationsCount as jest.MockedFunction<typeof useNotificationsCount>;

const buildNotification = (
  overrides: Partial<Notification> = {},
): Notification => ({
  id: "n-1",
  type: "system",
  title: "Welcome",
  message: "Hello there",
  isRead: false,
  createdAt: "2026-04-16T10:00:00.000Z",
  ...overrides,
});

const buildResponse = (
  items: Notification[],
  hasNextPage = false,
): NotificationsResponse => ({
  items,
  pageIndex: 1,
  pageSize: 50,
  totalCount: items.length,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage,
});

describe("useNotifications", () => {
  let setUnreadCountMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setUnreadCountMock = jest.fn();
    mockedUseNotificationsCount.mockReturnValue({
      unreadCount: 2,
      setUnreadCount: setUnreadCountMock,
    });

    mockedNotificationsService.getNotifications.mockResolvedValue(
      buildResponse([
        buildNotification({ id: "n-1", isRead: false }),
        buildNotification({ id: "n-2", isRead: true }),
      ]),
    );
    mockedNotificationsService.getUnreadCount.mockResolvedValue(5);
    mockedNotificationsService.markAsRead.mockResolvedValue("ok");
    mockedNotificationsService.markAllAsRead.mockResolvedValue("ok");
    mockedNotificationsService.deleteNotification.mockResolvedValue("ok");
  });

  it("fetches notifications on mount and supports unread filtering", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(2);
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.filteredNotifications).toHaveLength(2);
    expect(setUnreadCountMock).toHaveBeenCalledWith(1);

    act(() => {
      result.current.setFilterTab("unread");
    });

    expect(result.current.filterTab).toBe("unread");
    expect(result.current.filteredNotifications).toHaveLength(1);
  });

  it("uses unread-count endpoint when paginated feed has next page", async () => {
    mockedNotificationsService.getNotifications.mockResolvedValueOnce(
      buildResponse([buildNotification({ id: "n-1", isRead: false })], true),
    );
    mockedNotificationsService.getUnreadCount.mockResolvedValueOnce(7);

    renderHook(() => useNotifications());

    await waitFor(() => {
      expect(mockedNotificationsService.getUnreadCount).toHaveBeenCalledWith({
        forceRefresh: false,
      });
    });

    expect(setUnreadCountMock).toHaveBeenCalledWith(7);
  });

  it("marks a single notification as read with optimistic state update", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(2);
    });

    setUnreadCountMock.mockClear();

    await act(async () => {
      await result.current.markAsRead(" n-1 ");
    });

    expect(mockedNotificationsService.markAsRead).toHaveBeenCalledWith("n-1");
    expect(
      result.current.notifications.find(
        (notification: Notification) => notification.id === "n-1",
      )?.isRead,
    ).toBe(true);

    const decrementCall = setUnreadCountMock.mock.calls.find(
      ([arg]) => typeof arg === "function",
    );
    expect(decrementCall).toBeDefined();

    if (decrementCall) {
      const updater = decrementCall[0] as (previous: number) => number;
      expect(updater(4)).toBe(3);
    }
  });

  it("removes a notification optimistically and calls delete endpoint", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(2);
    });

    setUnreadCountMock.mockClear();

    await act(async () => {
      await result.current.removeNotification(" n-1 ");
    });

    expect(mockedNotificationsService.deleteNotification).toHaveBeenCalledWith(
      "n-1",
    );
    expect(result.current.notifications).toHaveLength(1);

    const decrementCall = setUnreadCountMock.mock.calls.find(
      ([arg]) => typeof arg === "function",
    );
    expect(decrementCall).toBeDefined();
  });

  it("does not call mark-all endpoint when unread count is already zero", async () => {
    mockedUseNotificationsCount.mockReturnValue({
      unreadCount: 0,
      setUnreadCount: setUnreadCountMock,
    });

    const { result } = renderHook(() => useNotifications({ autoFetch: false }));

    await act(async () => {
      await result.current.markAllRead();
    });

    expect(mockedNotificationsService.markAllAsRead).not.toHaveBeenCalled();
  });

  it("marks all notifications as read when unread count is greater than zero", async () => {
    mockedUseNotificationsCount.mockReturnValue({
      unreadCount: 3,
      setUnreadCount: setUnreadCountMock,
    });

    const { result } = renderHook(() => useNotifications({ autoFetch: false }));

    await act(async () => {
      await result.current.markAllRead();
    });

    expect(mockedNotificationsService.markAllAsRead).toHaveBeenCalledTimes(1);
    expect(setUnreadCountMock).toHaveBeenCalledWith(0);
  });

  it("maps forbidden ApiError to a user-friendly message", async () => {
    mockedNotificationsService.getNotifications.mockRejectedValueOnce({
      isApiError: true,
      statusCode: 403,
      message: "Forbidden",
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.error).toBe(
        "This account does not have permission to access notifications.",
      );
    });
  });

  it("skips initial fetch when autoFetch is disabled and allows manual refresh", async () => {
    const { result } = renderHook(() => useNotifications({ autoFetch: false }));

    expect(result.current.loading).toBe(false);
    expect(mockedNotificationsService.getNotifications).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedNotificationsService.getNotifications).toHaveBeenCalledTimes(
      1,
    );
  });
});
