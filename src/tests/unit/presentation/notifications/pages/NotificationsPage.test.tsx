import { fireEvent, render, screen } from "@testing-library/react";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { groupNotificationsByDate } from "@/features/notifications/utils/notificationPresentation";

jest.mock("@/features/notifications/hooks/useNotifications", () => ({
  useNotifications: jest.fn(),
}));

jest.mock("@/features/notifications/utils/notificationPresentation", () => ({
  groupNotificationsByDate: jest.fn(),
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
  PageLoading: ({ text, subText }: { text?: string; subText?: string }) => (
    <div>
      <span>{text ?? "loading"}</span>
      <span>{subText ?? ""}</span>
    </div>
  ),
}));

jest.mock("framer-motion", () => ({
  useReducedMotion: jest.fn(() => false),
}));

const mockedUseNotifications = useNotifications as jest.MockedFunction<
  typeof useNotifications
>;
const mockedGroupNotificationsByDate =
  groupNotificationsByDate as jest.MockedFunction<
    typeof groupNotificationsByDate
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
    },
  ],
  unreadCount: 1,
  loading: false,
  error: null,
  actionError: null,
  filterTab: "all" as const,
  markAllPending: false,
  itemPendingMap: {},
  setFilterTab: jest.fn(),
  markAsRead: jest.fn().mockResolvedValue(undefined),
  markAllRead: jest.fn().mockResolvedValue(undefined),
  removeNotification: jest.fn().mockResolvedValue(undefined),
  refresh: jest.fn().mockResolvedValue(undefined),
});

describe("NotificationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state while notifications are being fetched", () => {
    const hookState = createHookState();
    hookState.loading = true;

    mockedUseNotifications.mockReturnValue(
      hookState as unknown as ReturnType<typeof useNotifications>,
    );
    mockedGroupNotificationsByDate.mockReturnValue([]);

    render(<NotificationsPage />);

    expect(screen.getByText("Loading notifications")).toBeInTheDocument();
    expect(
      screen.getByText("Getting your latest updates..."),
    ).toBeInTheDocument();
  });

  it("shows error banner and supports retry, mark-all, and filter actions", () => {
    const hookState = createHookState();
    hookState.error = "load failed";

    mockedUseNotifications.mockReturnValue(
      hookState as unknown as ReturnType<typeof useNotifications>,
    );
    mockedGroupNotificationsByDate.mockReturnValue([]);

    render(<NotificationsPage />);

    expect(
      screen.getByText("Could not load notifications"),
    ).toBeInTheDocument();
    expect(screen.getByText("load failed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(hookState.refresh).toHaveBeenCalledWith({
      showLoader: false,
      showPageError: true,
      forceRefresh: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Mark all read" }));
    expect(hookState.markAllRead).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Unread" }));
    expect(hookState.setFilterTab).toHaveBeenCalledWith("unread");
  });

  it("renders unread empty state when no unread notifications remain", () => {
    const hookState = createHookState();
    hookState.filterTab = "unread";
    hookState.filteredNotifications = [];
    hookState.unreadCount = 0;

    mockedUseNotifications.mockReturnValue(
      hookState as unknown as ReturnType<typeof useNotifications>,
    );
    mockedGroupNotificationsByDate.mockReturnValue([]);

    render(<NotificationsPage />);

    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    expect(
      screen.getByText("All notifications have been read."),
    ).toBeInTheDocument();
  });

  it("renders grouped notification sections", () => {
    const hookState = createHookState();
    hookState.filteredNotifications = [
      {
        id: "n-1",
        type: "system",
        title: "Today item",
        message: "A",
        isRead: false,
        createdAt: "2026-04-16T10:00:00.000Z",
      },
      {
        id: "n-2",
        type: "system",
        title: "Earlier item",
        message: "B",
        isRead: true,
        createdAt: "2026-04-10T10:00:00.000Z",
      },
    ];

    mockedUseNotifications.mockReturnValue(
      hookState as unknown as ReturnType<typeof useNotifications>,
    );
    mockedGroupNotificationsByDate.mockReturnValue([
      ["Today", [hookState.filteredNotifications[0]!]],
      ["Earlier", [hookState.filteredNotifications[1]!]],
    ]);

    render(<NotificationsPage />);

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Earlier")).toBeInTheDocument();
    expect(screen.getByTestId("notification-item-n-1")).toHaveTextContent(
      "Today item",
    );
    expect(screen.getByTestId("notification-item-n-2")).toHaveTextContent(
      "Earlier item",
    );
  });
});
