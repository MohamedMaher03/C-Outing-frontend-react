import {
  Search,
  ShieldCheck,
  User,
  Ban,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import {
  AdminEmptyState,
  AdminErrorBanner,
  AdminFilterChips,
  AdminPageLayout,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin/components";
import { MANAGEABLE_USER_ROLES } from "@/features/admin/constants/filterOptions";
import {
  userRoleBadge,
  userStatusBadge,
} from "@/features/admin/constants/statusConfigs";
import { useManageUsersPage } from "@/features/admin/hooks/useManageUsersPage";

const ManageUsersPage = () => {
  const {
    t,
    formatNumber,
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
    setSearch,
    setRoleFilter,
    goToPreviousPage,
    goToNextPage,
    handleStatusChange,
    handleRoleChange,
    handleDeleteUser,
    roleFilterOptions,
    activeUsersCount,
    formatJoinedMonthYear,
    resolveStatusLabel,
    resolveRoleLabel,
    toggleUserActionMenu,
    retryUserDirectory,
    showInitialLoading,
    pageJumpDraft,
    setPageJumpDraft,
    commitPageJump,
    handlePageJumpKeyDown,
  } = useManageUsersPage();

  if (showInitialLoading) {
    return (
      <LoadingSpinner size="md" text={t("admin.users.loading")} fullScreen />
    );
  }

  return (
    <AdminPageLayout>
      <AdminPageHeader
        title={t("admin.users.header.title")}
        description={t("admin.users.header.description", {
          total: formatNumber(totalCount),
          active: formatNumber(activeUsersCount),
        })}
        icon={ShieldCheck}
      />

      <AdminErrorBanner
        title={t("admin.users.error.updateTitle")}
        message={error}
        onRetry={retryUserDirectory}
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
          count: formatNumber(totalCount),
        })}
        contentClassName="gap-3"
      >
        {users.length === 0 ? (
          <AdminEmptyState
            icon={User}
            title={t("admin.users.empty.title")}
            description={t("admin.users.empty.description")}
          />
        ) : (
          users.map((user) => {
            const role = userRoleBadge[user.role];
            const status = userStatusBadge[user.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={user.userId}
                className="relative flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all motion-reduce:transition-none hover:border-secondary/35 hover:shadow-sm sm:flex-row sm:items-center"
              >
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
                    <User className="h-5 w-5 text-secondary dark:text-primary" />
                  )}
                </div>
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
                      {resolveRoleLabel(user.role)}
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
                      {resolveStatusLabel(user.status)}
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
                      {formatJoinedMonthYear(user.joinedDate)}
                    </span>
                  </div>
                </div>
                <div
                  className="relative mt-3 w-full flex-shrink-0 sm:mt-0 sm:w-auto"
                  data-user-menu-root={user.userId}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => toggleUserActionMenu(user.userId)}
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
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => void handleDeleteUser(user.userId)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-role-secondary text-destructive transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        disabled={updatingUserId === user.userId}
                        aria-disabled={updatingUserId === user.userId}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("admin.users.actions.delete")}
                      </button>
                      <p className="px-3 py-1 text-role-caption uppercase text-muted-foreground">
                        {t("admin.users.actions.roleTitle", undefined, "Role")}
                      </p>
                      {MANAGEABLE_USER_ROLES.filter(
                        (roleOption) => roleOption !== user.role,
                      ).map((roleOption) => (
                        <button
                          key={roleOption}
                          type="button"
                          role="menuitem"
                          onClick={() =>
                            void handleRoleChange(user.userId, roleOption)
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-role-secondary text-foreground transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          disabled={updatingUserId === user.userId}
                          aria-disabled={updatingUserId === user.userId}
                        >
                          <User className="h-3.5 w-3.5" />
                          {t("admin.users.actions.setRole", {
                            role: resolveRoleLabel(roleOption),
                          })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {totalPages > 1 ? (
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-role-caption text-muted-foreground">
              {t("admin.users.pagination.summary", {
                page: formatNumber(pageIndex),
                totalPages: formatNumber(totalPages),
                totalCount: formatNumber(totalCount),
                pageSize: formatNumber(pageSize),
              })}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage || loading}
                className="min-h-11"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("admin.users.pagination.previous")}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-role-caption text-muted-foreground">
                  {t("admin.pagination.goTo", undefined, "Go to page")}
                </span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageJumpDraft}
                  onChange={(event) => setPageJumpDraft(event.target.value)}
                  onBlur={commitPageJump}
                  onKeyDown={handlePageJumpKeyDown}
                  className="min-h-11 w-20 text-center"
                  aria-label={t(
                    "admin.pagination.goToAria",
                    undefined,
                    "Go to page",
                  )}
                  disabled={loading}
                />
              </div>

              <span className="inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-3 text-role-caption font-medium text-foreground">
                {t("admin.users.pagination.page", {
                  page: formatNumber(pageIndex),
                  totalPages: formatNumber(totalPages),
                })}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!hasNextPage || loading}
                className="min-h-11"
              >
                {t("admin.users.pagination.next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </AdminSection>
    </AdminPageLayout>
  );
};

export default ManageUsersPage;
