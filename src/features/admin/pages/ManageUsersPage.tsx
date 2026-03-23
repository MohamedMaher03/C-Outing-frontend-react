/**
 * Manage Users Page (Admin)
 *
 * List all users, search, change roles, and ban/unban.
 * Follows the project's card-based design with secondary accent.
 */

import {
  Search,
  ShieldCheck,
  User,
  Ban,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useManageUsers } from "@/features/admin/hooks/useManageUsers";
import {
  userRoleBadge,
  userStatusBadge,
} from "@/features/admin/constants/statusConfigs";

const ManageUsersPage = () => {
  const {
    users,
    loading,
    search,
    roleFilter,
    actionMenu,
    filteredUsers,
    setSearch,
    setRoleFilter,
    setActionMenu,
    handleStatusChange,
  } = useManageUsers();

  if (loading) {
    return <LoadingSpinner size="md" text="Loading users..." fullScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-secondary" />
          Manage Users
        </h1>
        <p className="text-sm text-muted-foreground">
          {users.length} total users ·{" "}
          {users.filter((u) => u.status === "active").length} active
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "user", "moderator", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                roleFilter === role
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40",
              )}
            >
              {role === "all"
                ? "All"
                : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const role = userRoleBadge[user.role];
            const status = userStatusBadge[user.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={user.userId}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-secondary/30 hover:shadow-sm transition-all"
              >
                {/* Avatar */}
                <div className="h-11 w-11 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-secondary" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", role.class)}
                    >
                      {role.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span
                      className={cn("flex items-center gap-1", status.class)}
                    >
                      <StatusIcon className="h-3 w-3" /> {status.label}
                    </span>
                    <span>·</span>
                    <span>{user.reviewCount} reviews</span>
                    <span>·</span>
                    <span>
                      Joined{" "}
                      {new Date(user.joinedDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setActionMenu(
                        actionMenu === user.userId ? null : user.userId,
                      )
                    }
                    className="gap-1 text-xs"
                  >
                    Actions <ChevronDown className="h-3 w-3" />
                  </Button>

                  {actionMenu === user.userId && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-20 py-2">
                      <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </p>
                      {user.status !== "active" && (
                        <button
                          onClick={() =>
                            handleStatusChange(user.userId, "active")
                          }
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-emerald-600"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Activate
                        </button>
                      )}
                      {user.status !== "banned" && (
                        <button
                          onClick={() =>
                            handleStatusChange(user.userId, "banned")
                          }
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-red-600"
                        >
                          <Ban className="h-3.5 w-3.5" /> Ban User
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManageUsersPage;
