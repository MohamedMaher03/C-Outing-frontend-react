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
import { filterUsers } from "@/features/admin/utils/adminFilters";
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
  filteredUsers: AdminUser[];

  // Setters
  setSearch: (value: string) => void;
  setRoleFilter: (value: AdminUserRoleFilter) => void;
  setActionMenu: (userId: AdminUserId | null) => void;

  // Actions
  retry: () => Promise<void>;
  handleStatusChange: (
    userId: AdminUserId,
    status: Extract<AdminUserStatus, "active" | "banned">,
  ) => Promise<void>;
}

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
  const deferredSearch = useDeferredValue(search);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<AdminUserId>());

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminService.getUsers();
      if (!mountedRef.current) return;
      setUsers(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.loadUsers")));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    mountedRef.current = true;
    void loadUsers();

    return () => {
      mountedRef.current = false;
    };
  }, [loadUsers]);

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

  const filteredUsers = useMemo(
    () => filterUsers(users, deferredSearch, roleFilter),
    [users, deferredSearch, roleFilter],
  );

  return {
    users,
    loading,
    error,
    updatingUserId,
    search,
    roleFilter,
    actionMenu,
    filteredUsers,
    setSearch,
    setRoleFilter,
    setActionMenu,
    retry: loadUsers,
    handleStatusChange,
  };
};
