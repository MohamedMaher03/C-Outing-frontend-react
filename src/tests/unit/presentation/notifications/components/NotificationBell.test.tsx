import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

jest.mock("@/features/notifications/hooks/useNotifications", () => ({
  useNotifications: jest.fn(),
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      if (key === "notifications.unread") {
        return `${String(vars?.count ?? 0)} unread`;
      }
      if (key === "notifications.unreadStatus") {
        return `${String(vars?.count ?? 0)} unread notifications`;
      }
      return key;
    },
    formatNumber: (value: number) => String(value),
  }),
}));

jest.mock("@/features/notifications/components/NotificationItem", () => ({
  __esModule: true,
  default: ({
    notification,
  }: {
    notification: { id: string; title: string };
  }) => (
    <div data-testid={`notification-item-${notification.id}`}>
      {notification.title}
    </div>
  ),
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ text }: { text?: string }) => <div>{text ?? "loading"}</div>,
}));

jest.mock("framer-motion", () => {
  const React = require("react");
  const MotionDiv = React.forwardRef(
    (
      {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        ...rest
      }: Record<string, unknown>,
      ref: unknown,
    ) => <div ref={ref} {...rest} />,
  );

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: {
      div: MotionDiv,
    },
    useReducedMotion: jest.fn(() => false),
  };
});

const mockedUseNotifications = useNotifications as jest.MockedFunction<
  typeof useNotifications
>;

const createHookState = () => ({
  filteredNotifications: [
    {
      id: "n-1",
      type: "system",
      title: "Welcome",
      message: "Message",
      isRead: false,
      createdAt: "2026-04-16T10:00:00.000Z",
      actionUrl: "/places/1",
    },
  ],
  unreadCount: 2,
  loading: false,
  error: null,
  filterTab: "all" as const,
  setFilterTab: jest.fn(),
  markAsRead: jest.fn().mockResolvedValue(undefined),
  markAllRead: jest.fn().mockResolvedValue(undefined),
  removeNotification: jest.fn().mockResolvedValue(undefined),
  markAllPending: false,
  itemPendingMap: {},
  actionError: null,
  clearActionError: jest.fn(),
  refresh: jest.fn().mockResolvedValue(undefined),
});

describe("NotificationBell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens and closes panel, then refreshes with non-loader mode on reopen", async () => {
    const hookState = createHookState();
    mockedUseNotifications.mockReturnValue(
      hookState as unknown as ReturnType<typeof useNotifications>,
    );

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <NotificationBell />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole("button", { name: /nav.notifications/i });

    fireEvent.click(trigger);

    expect(
      screen.getByRole("dialog", { name: "notifications.panel" }),
    ).toBeInTheDocument();
    expect(hookState.refresh).toHaveBeenCalledWith({
      showLoader: true,
      showPageError: true,
    });

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "notifications.panel" }),
      ).not.toBeInTheDocument();
    });

    fireEvent.click(trigger);

    expect(hookState.refresh).toHaveBeenLastCalledWith({
      showLoader: false,
      showPageError: true,
    });
  });

  it("supports retry, filter switching, and mark-all actions", () => {
    const hookState = createHookState();
    hookState.error = "load failed";

    mockedUseNotifications.mockReturnValue(
      hookState as unknown as ReturnType<typeof useNotifications>,
    );

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <NotificationBell />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /nav.notifications/i }));

    expect(screen.getByText("load failed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "common.retry" }));
    expect(hookState.clearActionError).toHaveBeenCalledTimes(2);
    expect(hookState.refresh).toHaveBeenLastCalledWith({
      showLoader: true,
      showPageError: true,
      forceRefresh: true,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "notifications.filter.unread" }),
    );
    expect(hookState.setFilterTab).toHaveBeenCalledWith("unread");

    fireEvent.click(
      screen.getByRole("button", { name: "notifications.markAllRead" }),
    );
    expect(hookState.markAllRead).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll in mobile mode and restores it when closed", async () => {
    const hookState = createHookState();
    mockedUseNotifications.mockReturnValue(
      hookState as unknown as ReturnType<typeof useNotifications>,
    );

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <NotificationBell mobile />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /nav.notifications/i }));

    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(
      screen.getByRole("button", { name: "notifications.close" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "notifications.panel" }),
      ).not.toBeInTheDocument();
    });

    expect(document.body.style.overflow).toBe("");
  });
});
