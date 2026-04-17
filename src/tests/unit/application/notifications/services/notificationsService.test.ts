import { notificationsService } from "@/features/notifications/services/notificationsService";
import { notificationsDataSource } from "@/features/notifications/services/notificationsDataSource";

jest.mock("@/features/notifications/services/notificationsDataSource", () => ({
  notificationsDataSource: {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
}));

const mockedDataSource = notificationsDataSource as jest.Mocked<
  typeof notificationsDataSource
>;

describe("notifications service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationsService.invalidateCache();

    mockedDataSource.getNotifications.mockResolvedValue({
      items: [
        {
          id: "n1",
          type: "system",
          title: "Title",
          message: "Message",
          isRead: false,
          createdAt: "2026-04-16T10:00:00.000Z",
        },
      ],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    mockedDataSource.getUnreadCount.mockResolvedValue(4);
    mockedDataSource.markAsRead.mockResolvedValue("ok");
    mockedDataSource.markAllAsRead.mockResolvedValue("ok");
    mockedDataSource.deleteNotification.mockResolvedValue("ok");
  });

  it("normalizes params and caches getNotifications requests", async () => {
    const first = await notificationsService.getNotifications({
      pageIndex: 1,
      pageSize: 10,
    });
    const second = await notificationsService.getNotifications({
      pageIndex: 1,
      pageSize: 10,
    });

    expect(first).toEqual(second);
    expect(mockedDataSource.getNotifications).toHaveBeenCalledTimes(1);
    expect(mockedDataSource.getNotifications).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 10,
    });
  });

  it("caches unread count and supports force refresh", async () => {
    const first = await notificationsService.getUnreadCount();
    const second = await notificationsService.getUnreadCount();

    expect(first).toBe(4);
    expect(second).toBe(4);
    expect(mockedDataSource.getUnreadCount).toHaveBeenCalledTimes(1);

    await notificationsService.getUnreadCount({ forceRefresh: true });
    expect(mockedDataSource.getUnreadCount).toHaveBeenCalledTimes(2);
  });

  it("invalidates cache after mutation operations", async () => {
    await notificationsService.getNotifications({ pageIndex: 1, pageSize: 10 });
    expect(mockedDataSource.getNotifications).toHaveBeenCalledTimes(1);

    await notificationsService.markAsRead("n1");
    await notificationsService.getNotifications({ pageIndex: 1, pageSize: 10 });

    expect(mockedDataSource.markAsRead).toHaveBeenCalledWith("n1");
    expect(mockedDataSource.getNotifications).toHaveBeenCalledTimes(2);
  });
});
