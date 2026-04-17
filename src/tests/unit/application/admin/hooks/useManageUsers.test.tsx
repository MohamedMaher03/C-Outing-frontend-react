import { act, renderHook, waitFor } from "@testing-library/react";
import { useManageUsers } from "@/features/admin/hooks/useManageUsers";
import { adminService } from "@/features/admin/services/adminService";

const mockT = (key: string) => key;

jest.mock("@/features/admin/services/adminService", () => ({
  adminService: {
    getUsers: jest.fn(),
    updateUserStatus: jest.fn(),
  },
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: mockT,
  }),
}));

const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const usersPageFixture = {
  items: [
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
  pageIndex: 1,
  pageSize: 10,
  totalCount: 13,
  totalPages: 2,
  hasPreviousPage: false,
  hasNextPage: true,
};

describe("useManageUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedAdminService.getUsers.mockResolvedValue(usersPageFixture as never);
    mockedAdminService.updateUserStatus.mockResolvedValue(undefined);
  });

  it("loads users and pagination metadata", async () => {
    const { result } = renderHook(() => useManageUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.hasNextPage).toBe(true);
    expect(mockedAdminService.getUsers).toHaveBeenCalledWith({
      page: 1,
      count: 10,
      role: "all",
      searchTerm: "",
    });
  });

  it("updates user status through service and local state", async () => {
    const { result } = renderHook(() => useManageUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleStatusChange("u1", "banned");
    });

    expect(mockedAdminService.updateUserStatus).toHaveBeenCalledWith(
      "u1",
      "banned",
    );
    expect(result.current.users[0]?.status).toBe("banned");
  });

  it("moves to next page and triggers a new load", async () => {
    const { result } = renderHook(() => useManageUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.goToNextPage();
    });

    await waitFor(() => {
      expect(mockedAdminService.getUsers).toHaveBeenLastCalledWith({
        page: 2,
        count: 10,
        role: "all",
        searchTerm: "",
      });
    });
  });
});
