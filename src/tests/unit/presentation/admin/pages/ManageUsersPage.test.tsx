import { fireEvent, render, screen } from "@testing-library/react";
import ManageUsersPage from "@/features/admin/pages/ManageUsersPage";
import { useManageUsers } from "@/features/admin/hooks/useManageUsers";

jest.mock("@/features/admin/hooks/useManageUsers", () => ({
  useManageUsers: jest.fn(),
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ text }: { text?: string }) => <div>{text ?? "loading"}</div>,
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "en-US",
    formatNumber: (value: number) => String(value),
  }),
}));

const mockedUseManageUsers = useManageUsers as jest.MockedFunction<
  typeof useManageUsers
>;

const baseHookState = {
  users: [
    {
      userId: "u1",
      name: "Alice",
      email: "alice@example.com",
      role: "user",
      status: "active",
      joinedDate: new Date("2026-01-01"),
      lastActive: new Date("2026-01-02"),
      reviewCount: 3,
    },
  ],
  loading: false,
  error: null,
  updatingUserId: null,
  search: "",
  roleFilter: "all",
  actionMenu: "u1",
  pageIndex: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
  filteredUsers: [
    {
      userId: "u1",
      name: "Alice",
      email: "alice@example.com",
      role: "user",
      status: "active",
      joinedDate: new Date("2026-01-01"),
      lastActive: new Date("2026-01-02"),
      reviewCount: 3,
    },
  ],
  setSearch: jest.fn(),
  setRoleFilter: jest.fn(),
  setActionMenu: jest.fn(),
  retry: jest.fn().mockResolvedValue(undefined),
  goToPreviousPage: jest.fn(),
  goToNextPage: jest.fn(),
  handleStatusChange: jest.fn().mockResolvedValue(undefined),
};

describe("ManageUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseManageUsers.mockReturnValue(baseHookState as never);
  });

  it("renders loading spinner when users are loading", () => {
    mockedUseManageUsers.mockReturnValue({
      ...baseHookState,
      loading: true,
      users: [],
    } as never);

    render(<ManageUsersPage />);

    expect(screen.getByText("admin.users.loading")).toBeInTheDocument();
  });

  it("updates search term and allows banning from action menu", () => {
    render(<ManageUsersPage />);

    fireEvent.change(
      screen.getByPlaceholderText("admin.users.filters.searchPlaceholder"),
      {
        target: { value: "ali" },
      },
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "admin.users.actions.ban" }));

    expect(baseHookState.setSearch).toHaveBeenCalledWith("ali");
    expect(baseHookState.handleStatusChange).toHaveBeenCalledWith("u1", "banned");
  });
});
