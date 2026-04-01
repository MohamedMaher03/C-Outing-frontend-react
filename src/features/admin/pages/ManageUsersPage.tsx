/**
 * Manage Users Page (Admin)
 *
 * List all users, search, change roles, and ban/unban.
 * Follows the project's card-based design with secondary accent.
 */

import { useEffect, useMemo } from "react";

import {
  Search,
  ShieldCheck,
  User,
  Ban,
  CheckCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useManageUsers } from "@/features/admin/hooks/useManageUsers";
import {
  AdminEmptyState,
  AdminErrorBanner,
  AdminFilterChips,
  AdminPageLayout,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin/components";
import { USER_ROLE_FILTER_OPTIONS } from "@/features/admin/constants/filterOptions";
import {
  userRoleBadge,
  userStatusBadge,
} from "@/features/admin/constants/statusConfigs";
import { useI18n } from "@/components/i18n";

const ManageUsersPage = () => {
  const { t, locale, formatNumber } = useI18n();
  const {
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
    retry,
    handleStatusChange,
  } = useManageUsers();

  const monthYearFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  const roleFilterOptions = useMemo(
    () =>
      USER_ROLE_FILTER_OPTIONS.map((option) => ({
        ...option,
        label:
          option.value === "all"
            ? t("admin.filter.all")
            : t(`admin.role.${option.value}`),
      })),
    [t],
  );

  const getStatusLabel = (status: keyof typeof userStatusBadge): string =>
    t(`admin.status.${status}`);

  const getRoleLabel = (role: keyof typeof userRoleBadge): string =>
    t(`admin.role.${role}`);

  useEffect(() => {
    if (!actionMenu) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const withinOpenMenu = target?.closest(
        `[data-user-menu-root="${actionMenu}"]`,
      );

      if (!withinOpenMenu) {
        setActionMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [actionMenu, setActionMenu]);

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.status === "active").length,
    [users],
  );

  if (loading) {
    return (
      <LoadingSpinner size="md" text={t("admin.users.loading")} fullScreen />
    );
  }

  return (
    <AdminPageLayout>
      {/* Header */}
      <AdminPageHeader
        title={t("admin.users.header.title")}
        description={t("admin.users.header.description", {
          total: formatNumber(users.length),
          active: formatNumber(activeUsersCount),
        })}
        icon={ShieldCheck}
      />

      <AdminErrorBanner
        title={t("admin.users.error.updateTitle")}
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <AdminSection
        tone="muted"
        title={t("admin.users.filters.title")}
        description={t("admin.users.filters.description")}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("admin.users.filters.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:w-auto">
            <AdminFilterChips
              label={t("admin.filter.role")}
              options={roleFilterOptions}
              value={roleFilter}
              onChange={setRoleFilter}
            />
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title={t("admin.users.records.title")}
        description={t("admin.users.records.description", {
          count: formatNumber(filteredUsers.length),
        })}
        contentClassName="gap-3"
      >
        {filteredUsers.length === 0 ? (
          <AdminEmptyState
            icon={User}
            title={t("admin.users.empty.title")}
            description={t("admin.users.empty.description")}
          />
        ) : (
          filteredUsers.map((user) => {
            const role = userRoleBadge[user.role];
            const status = userStatusBadge[user.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={user.userId}
                className="relative flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all motion-reduce:transition-none hover:border-secondary/35 hover:shadow-sm sm:flex-row sm:items-center"
              >
                {/* Avatar */}
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/10">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <User className="h-5 w-5 text-secondary" />
                  )}
                </div>

                {/* Info */}
                <div className="mt-2 min-w-0 flex-1 sm:mt-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="truncate text-role-secondary font-semibold text-foreground">
                      {user.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5 py-0 text-role-caption",
                        role.class,
                      )}
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <p className="truncate text-role-caption text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-role-caption text-muted-foreground">
                    <span
                      className={cn("flex items-center gap-1", status.class)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {getStatusLabel(user.status)}
                    </span>
                    <span>·</span>
                    <span>
                      {t("admin.users.meta.reviews", {
                        count: formatNumber(user.reviewCount),
                      })}
                    </span>
                    <span>·</span>
                    <span>
                      {t("admin.users.meta.joined")}{" "}
                      {monthYearFormatter.format(new Date(user.joinedDate))}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="relative mt-3 w-full flex-shrink-0 sm:mt-0 sm:w-auto"
                  data-user-menu-root={user.userId}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() =>
                      setActionMenu(
                        actionMenu === user.userId ? null : user.userId,
                      )
                    }
                    className="min-h-11 w-full gap-1 text-role-secondary sm:w-auto"
                    aria-haspopup="menu"
                    aria-expanded={actionMenu === user.userId}
                    aria-controls={`user-actions-menu-${user.userId}`}
                    disabled={updatingUserId === user.userId}
                  >
                    {updatingUserId === user.userId ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t("admin.users.actions.updating")}
                      </>
                    ) : (
                      <>
                        {t("admin.users.actions.menu")}{" "}
                        <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </Button>

                  {actionMenu === user.userId && (
                    <div
                      id={`user-actions-menu-${user.userId}`}
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-card py-2 shadow-lg"
                    >
                      <p className="px-3 py-1 text-role-caption uppercase text-muted-foreground">
                        {t("admin.filter.status")}
                      </p>
                      {user.status !== "active" && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() =>
                            void handleStatusChange(user.userId, "active")
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-role-secondary text-primary transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          disabled={updatingUserId === user.userId}
                          aria-disabled={updatingUserId === user.userId}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {t("admin.users.actions.activate")}
                        </button>
                      )}
                      {user.status !== "banned" && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() =>
                            void handleStatusChange(user.userId, "banned")
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-role-secondary text-destructive transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          disabled={updatingUserId === user.userId}
                          aria-disabled={updatingUserId === user.userId}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          {t("admin.users.actions.ban")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </AdminSection>
    </AdminPageLayout>
  );
};

export default ManageUsersPage;
