import {
  formatRelativeNotificationTime,
  groupNotificationsByDate,
} from "@/features/notifications/utils/notificationPresentation";

describe("notification presentation utilities", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-16T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("formats relative notification times and handles invalid dates", () => {
    const oneMinuteAgo = "2026-04-16T11:59:00.000Z";
    const formatted = formatRelativeNotificationTime(oneMinuteAgo);

    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);

    const fallback = formatRelativeNotificationTime("invalid-date");
    expect(fallback.toLowerCase()).toContain("recent");
  });

  it("groups notifications by Today, Yesterday, and Earlier", () => {
    const grouped = groupNotificationsByDate([
      {
        id: "n1",
        type: "system",
        title: "Today",
        message: "A",
        isRead: false,
        createdAt: "2026-04-16T10:00:00.000Z",
      },
      {
        id: "n2",
        type: "system",
        title: "Yesterday",
        message: "B",
        isRead: true,
        createdAt: "2026-04-15T10:00:00.000Z",
      },
      {
        id: "n3",
        type: "system",
        title: "Earlier",
        message: "C",
        isRead: true,
        createdAt: "2026-04-10T10:00:00.000Z",
      },
    ] as never);

    expect(grouped.map(([key]) => key)).toEqual([
      "Today",
      "Yesterday",
      "Earlier",
    ]);
    expect(grouped[0]?.[1]).toHaveLength(1);
    expect(grouped[1]?.[1]).toHaveLength(1);
    expect(grouped[2]?.[1]).toHaveLength(1);
  });
});
