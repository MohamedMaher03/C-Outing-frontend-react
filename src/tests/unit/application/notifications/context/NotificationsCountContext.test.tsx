import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NotificationsCountProvider } from "@/features/notifications/context/NotificationsCountContext";
import { useNotificationsCount } from "@/features/notifications/hooks/useNotificationsCount";
import { notificationsService } from "@/features/notifications/services/notificationsService";

jest.mock("@/features/notifications/services/notificationsService", () => ({
  notificationsService: {
    getUnreadCount: jest.fn(),
  },
}));

const mockedNotificationsService = notificationsService as jest.Mocked<
  typeof notificationsService
>;

const CountConsumer = () => {
  const { unreadCount, setUnreadCount } = useNotificationsCount();

  return (
    <div>
      <span data-testid="unread-count">{unreadCount}</span>
      <button
        type="button"
        onClick={() => setUnreadCount((previous) => previous + 1)}
      >
        increment
      </button>
    </div>
  );
};

describe("NotificationsCountProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads unread count on mount and allows updates", async () => {
    mockedNotificationsService.getUnreadCount.mockResolvedValue(3);

    render(
      <NotificationsCountProvider>
        <CountConsumer />
      </NotificationsCountProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("3");
    });

    fireEvent.click(screen.getByRole("button", { name: "increment" }));
    expect(screen.getByTestId("unread-count")).toHaveTextContent("4");
  });

  it("keeps default unread count when service fetch fails", async () => {
    mockedNotificationsService.getUnreadCount.mockRejectedValue(
      new Error("network"),
    );

    render(
      <NotificationsCountProvider>
        <CountConsumer />
      </NotificationsCountProvider>,
    );

    await waitFor(() => {
      expect(mockedNotificationsService.getUnreadCount).toHaveBeenCalledTimes(
        1,
      );
    });

    expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
  });
});
