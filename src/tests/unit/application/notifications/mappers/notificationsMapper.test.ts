import {
  mapNotificationsPage,
  normalizeNotificationId,
  normalizePageIndex,
  normalizePageSize,
  normalizeUnreadCount,
} from "@/features/notifications/mappers/notificationsMapper";

describe("notifications mapper", () => {
  it("normalizes page controls and unread count", () => {
    expect(normalizePageIndex(undefined)).toBe(1);
    expect(normalizePageIndex(4.9)).toBe(4);

    expect(normalizePageSize(undefined)).toBe(50);
    expect(normalizePageSize(120)).toBe(100);
    expect(normalizePageSize(0)).toBe(1);

    expect(normalizeUnreadCount(undefined)).toBe(0);
    expect(normalizeUnreadCount(-12)).toBe(0);
    expect(normalizeUnreadCount(7.9)).toBe(7);
  });

  it("normalizes notification ids", () => {
    expect(normalizeNotificationId(" abc ")).toBe("abc");
    expect(() => normalizeNotificationId("  ")).toThrow(
      "Notification id is required",
    );
  });

  it("maps notifications page with dedupe, fallback fields, and sorted order", () => {
    const mapped = mapNotificationsPage({
      items: [
        {
          id: "n1",
          type: "system",
          title: "",
          message: "",
          isRead: 0 as never,
          createdAt: "2026-04-16T10:00:00.000Z",
          actionUrl: " /profile ",
        },
        {
          id: "n1",
          type: "system",
          title: "Duplicate",
          message: "Duplicate",
          isRead: true,
          createdAt: "2026-04-16T10:01:00.000Z",
        },
        {
          id: "n2",
          type: "recommendation",
          title: "New",
          message: "Check this",
          isRead: false,
          createdAt: "2026-04-16T11:00:00.000Z",
        },
      ],
      pageIndex: 100,
      pageSize: 0,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: true,
      hasNextPage: true,
    });

    expect(mapped.items).toHaveLength(2);
    expect(mapped.items[0]?.id).toBe("n2");
    expect(mapped.items[1]?.title).toBe("Notification");
    expect(mapped.items[1]?.message).toBe("Open to view details.");
    expect(mapped.items[1]?.actionUrl).toBe("/profile");
    expect(mapped.pageIndex).toBe(1);
    expect(mapped.pageSize).toBe(1);
    expect(mapped.hasPreviousPage).toBe(false);
    expect(mapped.hasNextPage).toBe(false);
  });
});
