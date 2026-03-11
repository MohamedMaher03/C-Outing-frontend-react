/**
 * useManageUsers Hook
 * Manages state and actions for the Manage Users admin page.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminUser } from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";

interface UseManageUsersReturn {
  // State
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  search: string;
  roleFilter: string;
  actionMenu: number | null;
  filteredUsers: AdminUser[];

  // Setters
  setSearch: (value: string) => void;
  setRoleFilter: (value: string) => void;
  setActionMenu: (userId: number | null) => void;

  // Actions
  handleRoleChange: (
    userId: number,
    role: "user" | "moderator" | "admin",
  ) => Promise<void>;
  handleStatusChange: (
    userId: number,
    status: "active" | "banned" | "suspended",
  ) => Promise<void>;
}

export const useManageUsers = (): UseManageUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionMenu, setActionMenu] = useState<number | null>(null);

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

  const handleRoleChange = async (
    userId: number,
    role: "user" | "moderator" | "admin",
  ) => {
    await adminService.updateUserRole(userId, role);
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, role } : u)),
    );
    setActionMenu(null);
  };

  const handleStatusChange = async (
    userId: number,
    status: "active" | "banned" | "suspended",
  ) => {
    await adminService.updateUserStatus(userId, status);
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, status } : u)),
    );
    setActionMenu(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
    handleRoleChange,
    handleStatusChange,
  };
};
