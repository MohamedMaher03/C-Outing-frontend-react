import { fireEvent, render, screen } from "@testing-library/react";
import NotificationItem from "@/features/notifications/components/NotificationItem";
import type { Notification } from "@/features/notifications/types";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/features/notifications/utils/notificationPresentation", () => ({
  formatRelativeNotificationTime: () => "just now",
}));

const buildNotification = (
  overrides: Partial<Notification> = {},
): Notification => ({
  id: "n-1",
  type: "system",
  title: "Welcome",
  message: "You have updates",
  isRead: false,
  createdAt: "2026-04-16T09:00:00.000Z",
  actionUrl: "/places/123",
  ...overrides,
});

describe("NotificationItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks unread notifications as read and navigates on click", () => {
    const onMarkRead = jest.fn().mockResolvedValue(undefined);
    const onDelete = jest.fn().mockResolvedValue(undefined);

    render(
      <NotificationItem
        notification={buildNotification()}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Welcome" }));

    expect(onMarkRead).toHaveBeenCalledWith("n-1");
    expect(mockNavigate).toHaveBeenCalledWith("/places/123");
  });

  it("supports keyboard activation and delete action", () => {
    const onMarkRead = jest.fn().mockResolvedValue(undefined);
    const onDelete = jest.fn().mockResolvedValue(undefined);

    render(
      <NotificationItem
        notification={buildNotification()}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Welcome" }), {
      key: "Enter",
    });

    expect(onMarkRead).toHaveBeenCalledWith("n-1");

    onMarkRead.mockClear();

    fireEvent.click(
      screen.getByRole("button", { name: "notifications.delete" }),
    );

    expect(onDelete).toHaveBeenCalledWith("n-1");
    expect(onMarkRead).not.toHaveBeenCalled();
  });

  it("blocks interactions when pending", () => {
    const onMarkRead = jest.fn().mockResolvedValue(undefined);
    const onDelete = jest.fn().mockResolvedValue(undefined);

    render(
      <NotificationItem
        notification={buildNotification({ title: "Pending item" })}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
        pending
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pending item" }));
    fireEvent.click(
      screen.getByRole("button", { name: "notifications.delete" }),
    );

    expect(onMarkRead).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Pending item" }),
    ).toHaveAttribute("aria-busy", "true");
  });
});
