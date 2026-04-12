/**
 * useManageUsers Hook
 * Manages state and actions for the Manage Users admin page.
 */

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { adminService } from "@/features/admin/services/adminService";
import type {
  AdminUser,
  AdminUserId,
  AdminUserRoleFilter,
  AdminUserStatus,
} from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseManageUsersReturn {
  // State
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  updatingUserId: AdminUserId | null;
  search: string;
  roleFilter: AdminUserRoleFilter;
  actionMenu: AdminUserId | null;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  filteredUsers: AdminUser[];

  // Setters
  setSearch: (value: string) => void;
  setRoleFilter: (value: AdminUserRoleFilter) => void;
  setActionMenu: (userId: AdminUserId | null) => void;

  // Actions
  retry: () => Promise<void>;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  handleStatusChange: (
    userId: AdminUserId,
    status: Extract<AdminUserStatus, "active" | "banned">,
  ) => Promise<void>;
}

const USERS_PAGE_SIZE = 10;
const INITIAL_PAGE_BY_ROLE_FILTER: Record<AdminUserRoleFilter, number> = {
  all: 1,
  user: 1,
  moderator: 1,
  admin: 1,
};

export const useManageUsers = (): UseManageUsersReturn => {
  const { t } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<AdminUserId | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>("all");
  const [actionMenu, setActionMenu] = useState<AdminUserId | null>(null);
  const [pageIndexByRoleFilter, setPageIndexByRoleFilter] = useState<
    Record<AdminUserRoleFilter, number>
  >(INITIAL_PAGE_BY_ROLE_FILTER);
  const [pageSize, setPageSize] = useState(USERS_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const pageIndex = pageIndexByRoleFilter[roleFilter];
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<AdminUserId>());
  const latestUsersRequestRef = useRef(0);

  const loadUsers = useCallback(
    async (params: {
      targetPage: number;
      targetRoleFilter: AdminUserRoleFilter;
      targetSearch: string;
    }) => {
      const { targetPage, targetRoleFilter, targetSearch } = params;
      const requestId = ++latestUsersRequestRef.current;

      setLoading(true);
      setError(null);

      try {
        const data = await adminService.getUsers({
          page: targetPage,
          count: USERS_PAGE_SIZE,
          role: targetRoleFilter,
          searchTerm: targetSearch,
        });

        if (
          !mountedRef.current ||
          requestId !== latestUsersRequestRef.current
        ) {
          return;
        }

        const normalizedTotalPages = Math.max(1, data.totalPages);
        const normalizedPage = Math.min(
          Math.max(1, targetPage),
          normalizedTotalPages,
        );

        setUsers(data.items);
        setPageIndexByRoleFilter((prev) => {
          if (prev[targetRoleFilter] === normalizedPage) {
            return prev;
          }

          return {
            ...prev,
            [targetRoleFilter]: normalizedPage,
          };
        });
        setPageSize(Math.max(1, data.pageSize));
        setTotalCount(Math.max(0, data.totalCount));
        setTotalPages(normalizedTotalPages);
        setHasPreviousPage(normalizedPage > 1);
        setHasNextPage(normalizedPage < normalizedTotalPages);
        setActionMenu(null);
      } catch (err) {
        if (
          !mountedRef.current ||
          requestId !== latestUsersRequestRef.current
        ) {
          return;
        }

        setError(getErrorMessage(err, t("admin.error.loadUsers")));
      } finally {
        if (mountedRef.current && requestId === latestUsersRequestRef.current) {
          setLoading(false);
        }
      }
    },
    [t],
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadUsers({
      targetPage: pageIndex,
      targetRoleFilter: roleFilter,
      targetSearch: deferredSearch,
    });

    return () => {
      mountedRef.current = false;
    };
  }, [deferredSearch, loadUsers, pageIndex, roleFilter]);

  const handleStatusChange = async (
    userId: AdminUserId,
    status: Extract<AdminUserStatus, "active" | "banned">,
  ) => {
    if (inFlightRef.current.has(userId)) {
      return;
    }

    inFlightRef.current.add(userId);
    setUpdatingUserId(userId);
    setError(null);

    try {
      await adminService.updateUserStatus(userId, status);
      if (!mountedRef.current) return;

      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, status } : u)),
      );
      setActionMenu(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.updateUserStatus")));
    } finally {
      inFlightRef.current.delete(userId);
      if (mountedRef.current) {
        setUpdatingUserId((prev) => (prev === userId ? null : prev));
      }
    }
  };

  const filteredUsers = useMemo(() => users, [users]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);

      setPageIndexByRoleFilter((prev) => {
        if (prev[roleFilter] === 1) {
          return prev;
        }

        return {
          ...prev,
          [roleFilter]: 1,
        };
      });
    },
    [roleFilter],
  );

  const handleRoleFilterChange = useCallback((value: AdminUserRoleFilter) => {
    setRoleFilter(value);
    setActionMenu(null);
  }, []);

  const retry = useCallback(async () => {
    await loadUsers({
      targetPage: pageIndex,
      targetRoleFilter: roleFilter,
      targetSearch: deferredSearch,
    });
  }, [deferredSearch, loadUsers, pageIndex, roleFilter]);

  const goToPreviousPage = useCallback(() => {
    if (!hasPreviousPage || loading) {
      return;
    }

    setPageIndexByRoleFilter((prev) => {
      const nextPage = Math.max(1, prev[roleFilter] - 1);

      if (nextPage === prev[roleFilter]) {
        return prev;
      }

      return {
        ...prev,
        [roleFilter]: nextPage,
      };
    });
  }, [hasPreviousPage, loading, roleFilter]);

  const goToNextPage = useCallback(() => {
    if (!hasNextPage || loading) {
      return;
    }

    setPageIndexByRoleFilter((prev) => {
      const nextPage = Math.min(totalPages, prev[roleFilter] + 1);

      if (nextPage === prev[roleFilter]) {
        return prev;
      }

      return {
        ...prev,
        [roleFilter]: nextPage,
      };
    });
  }, [hasNextPage, loading, roleFilter, totalPages]);

  return {
    users,
    loading,
    error,
    updatingUserId,
    search,
    roleFilter,
    actionMenu,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    filteredUsers,
    setSearch: handleSearchChange,
    setRoleFilter: handleRoleFilterChange,
    setActionMenu,
    retry,
    goToPreviousPage,
    goToNextPage,
    handleStatusChange,
  };
};
