/**
 * useManageUsers Hook
 * Manages state and actions for the Manage Users admin page.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type {
  AdminUser,
  AdminUserId,
  AdminUserStatus,
} from "@/features/admin/types";
import { filterUsers } from "@/features/admin/utils/adminFilters";
import { getErrorMessage } from "@/utils/apiError";

interface UseManageUsersReturn {
  // State
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  search: string;
  roleFilter: string;
  actionMenu: AdminUserId | null;
  filteredUsers: AdminUser[];

  // Setters
  setSearch: (value: string) => void;
  setRoleFilter: (value: string) => void;
  setActionMenu: (userId: AdminUserId | null) => void;

  // Actions
  handleStatusChange: (
    userId: AdminUserId,
    status: Extract<AdminUserStatus, "active" | "banned">,
  ) => Promise<void>;
}

export const useManageUsers = (): UseManageUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionMenu, setActionMenu] = useState<AdminUserId | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminService.getUsers();
        setUsers(data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load users"));
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleStatusChange = async (
    userId: AdminUserId,
    status: Extract<AdminUserStatus, "active" | "banned">,
  ) => {
    await adminService.updateUserStatus(userId, status);
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, status } : u)),
    );
    setActionMenu(null);
  };

  const filteredUsers = filterUsers(users, search, roleFilter);

  return {
    users,
    loading,
    error,
    search,
    roleFilter,
    actionMenu,
    filteredUsers,
    setSearch,
    setRoleFilter,
    setActionMenu,
    handleStatusChange,
  };
};
