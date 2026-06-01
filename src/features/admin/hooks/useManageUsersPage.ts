import { useCallback, useMemo } from "react";
import { useManageUsers } from "@/features/admin/hooks/useManageUsers";
import { USER_ROLE_FILTER_OPTIONS } from "@/features/admin/constants/filterOptions";
import {
  userRoleBadge,
  userStatusBadge,
} from "@/features/admin/constants/statusConfigs";
import { localizeAdminStatusFilters } from "@/features/admin/utils/adminFilterLabels";
import { countRecordsWhere } from "@/features/admin/utils/adminRecordMetrics";
import { useDismissOnOutsideInteraction } from "@/hooks/useDismissOnOutsideInteraction";
import { usePaginationJump } from "@/hooks/usePaginationJump";
import { useI18n } from "@/components/i18n";

export const useManageUsersPage = () => {
  const { t, locale, formatNumber } = useI18n();
  const userDirectory = useManageUsers();

  const monthYearFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  const roleFilterOptions = useMemo(
    () => localizeAdminStatusFilters(USER_ROLE_FILTER_OPTIONS, t),
    [t],
  );

  const paginationJump = usePaginationJump(
    userDirectory.pageIndex,
    userDirectory.goToPage,
  );

  useDismissOnOutsideInteraction(
    userDirectory.actionMenu,
    () => userDirectory.setActionMenu(null),
    "data-user-menu-root",
  );

  const activeUsersCount = countRecordsWhere(
    userDirectory.users,
    (user) => user.status === "active",
  );

  const formatJoinedMonthYear = (joinedDate: string | Date) =>
    monthYearFormatter.format(
      joinedDate instanceof Date ? joinedDate : new Date(joinedDate),
    );

  const resolveStatusLabel = (status: keyof typeof userStatusBadge) =>
    t(`admin.status.${status}`);

  const resolveRoleLabel = (role: keyof typeof userRoleBadge) =>
    t(`admin.role.${role}`);

  const toggleUserActionMenu = useCallback(
    (userId: string) => {
      userDirectory.setActionMenu(
        userDirectory.actionMenu === userId ? null : userId,
      );
    },
    [userDirectory],
  );

  const retryUserDirectory = () => void userDirectory.retry();

  const showInitialLoading =
    userDirectory.loading && userDirectory.users.length === 0;

  return {
    t,
    formatNumber,
    ...userDirectory,
    ...paginationJump,
    roleFilterOptions,
    activeUsersCount,
    formatJoinedMonthYear,
    resolveStatusLabel,
    resolveRoleLabel,
    toggleUserActionMenu,
    retryUserDirectory,
    showInitialLoading,
  };
};
