import {
  Search,
  ShieldAlert,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ArrowUpRight,
  MessageSquareWarning,
  MapPin,
  User,
  FileText,
  Trash2,
  Bell,
  Ban,
  ChevronDown,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { type CSSProperties, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import type { ReportedContent } from "../types";
import { useReportedContent } from "@/features/moderator/hooks/useReportedContent";
import {
  MODERATOR_REPORT_STATUS_FILTER_OPTIONS,
  MODERATOR_REPORT_TYPE_FILTER_OPTIONS,
} from "@/features/moderator/constants/filterOptions";
import {
  getReportedRowStateClass,
  moderatorToastClasses,
  reportedPriorityConfig,
  reportedStatusConfig,
} from "@/features/moderator/constants/statusConfigs";
import {
  ModeratorEmptyState,
  ModeratorErrorBanner,
  ModeratorFilterChips,
  ModeratorPageHeader,
  ModeratorPageLayout,
  ModeratorSection,
} from "@/features/moderator/components";
import {
  formatCount,
  formatLongDate,
  formatRelativeTime,
} from "@/features/moderator/utils/formatters";
import { useI18n } from "@/components/i18n";

const typeIcon: Record<ReportedContent["type"], typeof MessageSquareWarning> = {
  review: MessageSquareWarning,
  place: MapPin,
  user: User,
};

const MODERATOR_REPORT_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "250px",
  contain: "layout paint style",
};

const ReportedContentPage = () => {
  const { t, locale } = useI18n();
  const {
    reports,
    loading,
    error,
    pendingReportIdSet,
    search,
    statusFilter,
    typeFilter,
    expandedId,
    actionLoading,
    toasts,
    filteredReports: filtered,
    setSearch,
    setStatusFilter,
    setTypeFilter,
    setExpandedId,
    retry,
    handleStatusChange,
    handleDeleteReview,
    handleWarnUser,
    handleBanUser,
  } = useReportedContent();

  const statusFilterOptions = useMemo(
    () =>
      MODERATOR_REPORT_STATUS_FILTER_OPTIONS.map((option) => ({
        ...option,
        label:
          option.value === "all"
            ? t("admin.filter.all")
            : t(`moderator.report.status.${option.value}`),
      })),
    [t],
  );

  const typeFilterOptions = useMemo(
    () =>
      MODERATOR_REPORT_TYPE_FILTER_OPTIONS.map((option) => ({
        ...option,
        label:
          option.value === "all"
            ? t("moderator.report.type.all")
            : t(`moderator.report.type.${option.value}`),
      })),
    [t],
  );

  const reportSummary = useMemo(
    () =>
      reports.reduce(
        (summary, report) => {
          if (report.status === "open") {
            summary.open += 1;
          }
          if (report.status === "investigating") {
            summary.investigating += 1;
          }
          return summary;
        },
        { open: 0, investigating: 0 },
      ),
    [reports],
  );

  if (loading) {
    return (
      <LoadingSpinner
        size="md"
        text={t("moderator.reports.loading")}
        fullScreen
      />
    );
  }

  return (
    <ModeratorPageLayout>
      <div
        className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "max-w-xs rounded-xl px-4 py-3 text-role-secondary font-medium pointer-events-auto transition-all motion-reduce:transition-none flex items-center gap-2",
              moderatorToastClasses[
                toast.variant === "destructive" ? "error" : toast.variant
              ],
            )}
          >
            {toast.variant === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : toast.variant === "warning" ? (
              <Bell className="h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="break-words">{toast.message}</span>
          </div>
        ))}
      </div>

      <ModeratorPageHeader
        title={t("moderator.reports.header.title")}
        description={t("moderator.reports.header.description", {
          open: formatCount(reportSummary.open, locale),
          investigating: formatCount(reportSummary.investigating, locale),
        })}
        icon={ShieldAlert}
      />

      <ModeratorErrorBanner
        title={t("moderator.reports.error.loadTitle")}
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <ModeratorSection
        tone="muted"
        title={t("moderator.reports.filters.title")}
        description={t("moderator.reports.filters.description")}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("moderator.reports.filters.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:min-w-[16rem]">
            <ModeratorFilterChips
              label={t("admin.filter.status")}
              options={statusFilterOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        <div className="lg:max-w-[18rem]">
          <ModeratorFilterChips
            label={t("moderator.reports.filters.typeLabel")}
            options={typeFilterOptions}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </div>
      </ModeratorSection>

      <ModeratorSection
        title={t("moderator.reports.queue.title")}
        description={t("moderator.reports.queue.description", {
          count: formatCount(filtered.length, locale),
        })}
        contentClassName="gap-4"
      >
        {filtered.length === 0 ? (
          <ModeratorEmptyState
            icon={ShieldAlert}
            title={t("moderator.reports.empty.title")}
            description={
              search.trim().length > 0
                ? t("moderator.reports.empty.withSearch")
                : t("moderator.reports.empty.default")
            }
          />
        ) : (
          filtered.map((report) => {
            const config = reportedStatusConfig[report.status];
            const StatusIcon = config.icon;
            const TypeIcon = typeIcon[report.type];
            const priority = reportedPriorityConfig[report.priority];
            const isExpanded = expandedId === report.id;
            const isPending = pendingReportIdSet.has(report.id);
            const detailsPanelId = `report-details-${report.id}`;
            const isStatusPending = actionLoading?.startsWith(
              `${report.id}_status_`,
            );
            const isDeletePending = actionLoading === `${report.id}_delete`;
            const isWarnPending = actionLoading === `${report.id}_warn`;
            const isBanPending = actionLoading === `${report.id}_ban`;

            return (
              <div
                key={report.id}
                className={cn(
                  "space-y-3 rounded-xl border bg-card p-4 transition-all motion-reduce:transition-none",
                  getReportedRowStateClass(report.status, report.priority),
                )}
                aria-busy={isPending}
                style={MODERATOR_REPORT_ROW_STYLE}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted/50 flex-shrink-0 mt-0.5">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-role-secondary font-semibold text-foreground break-words">
                        {report.reportedItemName}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-role-caption px-1.5 py-0",
                          config.class,
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                        {t(`moderator.report.status.${report.status}`)}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-role-caption px-1.5 py-0 border-0",
                          priority.class,
                        )}
                      >
                        {t(`moderator.priority.${report.priority}`)}
                      </Badge>
                    </div>
                    <p className="text-role-caption text-muted-foreground break-words">
                      {t("moderator.reports.meta.reportedBy")}{" "}
                      <span className="font-medium">{report.reporterName}</span>{" "}
                      · {formatRelativeTime(report.createdAt, locale)}
                    </p>
                    <p className="text-role-caption text-muted-foreground break-words">
                      <span className="font-medium">
                        {t("moderator.reports.meta.reason")}:
                      </span>{" "}
                      {report.reason}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : report.id)
                      }
                      aria-expanded={isExpanded}
                      aria-controls={detailsPanelId}
                      className="text-role-secondary gap-1 min-h-11 sm:h-8"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isExpanded
                        ? t("moderator.reports.actions.less")
                        : t("moderator.reports.actions.details")}
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </Button>
                  </div>
                </div>

                {isExpanded ? (
                  <div
                    id={detailsPanelId}
                    className="mt-4 space-y-5 border-t border-border/70 pt-4"
                  >
                    {report.type === "review" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/30 space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 text-role-caption font-semibold text-foreground">
                            <MessageSquare className="h-3.5 w-3.5 text-secondary" />
                            {t("moderator.reports.details.originalReview")}
                            {report.reviewAuthorName ? (
                              <span className="text-muted-foreground font-normal break-words">
                                {" "}
                                - {t("moderator.reports.details.by")}{" "}
                                {report.reviewAuthorName}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-role-secondary text-foreground leading-relaxed italic break-words">
                            "
                            {report.reviewContent ??
                              t("moderator.reports.details.contentUnavailable")}
                            "
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 text-role-caption font-semibold text-destructive">
                            <FileText className="h-3.5 w-3.5" />
                            {t("moderator.reports.details.reporterDescription")}
                          </div>
                          <p className="text-role-secondary text-foreground leading-relaxed break-words">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-start gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-role-secondary text-foreground leading-relaxed break-words">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {report.resolvedAt ? (
                      <p className="text-role-caption text-muted-foreground">
                        {t("moderator.reports.details.resolvedOn", {
                          date: formatLongDate(report.resolvedAt, locale),
                        })}
                      </p>
                    ) : null}

                    {(report.status === "open" ||
                      report.status === "investigating") && (
                      <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                          {report.status === "open" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(report.id, "investigating")
                              }
                              disabled={Boolean(isStatusPending)}
                              className="text-role-secondary gap-1 min-h-11 sm:h-8 text-foreground border-secondary/40 hover:bg-secondary/20 dark:hover:bg-primary"
                            >
                              {isStatusPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              {t("moderator.reports.actions.investigate")}
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(report.id, "dismissed")
                            }
                            disabled={Boolean(isStatusPending)}
                            className="text-role-secondary gap-1 min-h-11 sm:h-8"
                          >
                            {isStatusPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {t("moderator.reports.actions.dismiss")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(report.id, "resolved")
                            }
                            disabled={Boolean(isStatusPending)}
                            className="text-role-secondary gap-1 min-h-11 sm:h-8 ml-0 sm:ml-auto text-primary border-primary/30 hover:bg-primary/10 dark:hover:bg-primary"
                          >
                            {isStatusPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                            {t("moderator.reports.actions.markResolved")}
                          </Button>
                        </div>

                        {report.type === "review" ? (
                          <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                            <p className="text-role-caption font-semibold text-foreground uppercase tracking-wide">
                              {t("moderator.reports.actions.resolutionTitle")}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-role-secondary gap-1.5 min-h-11 sm:h-8 text-destructive border-destructive/30 hover:bg-destructive/5 dark:hover:bg-destructive"
                                    disabled={isDeletePending}
                                  >
                                    {isDeletePending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    {t(
                                      "moderator.reports.actions.deleteReview",
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {t(
                                        "moderator.reports.dialog.delete.title",
                                      )}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t(
                                        "moderator.reports.dialog.delete.description",
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {t("common.cancel", undefined, "Cancel")}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteReview(report.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t("moderator.reports.actions.delete")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-role-secondary gap-1.5 min-h-11 sm:h-8 border-secondary/40 hover:bg-secondary/20 dark:hover:bg-primary"
                                    disabled={isWarnPending}
                                  >
                                    {isWarnPending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Bell className="h-3.5 w-3.5" />
                                    )}
                                    {t("moderator.reports.actions.warnUser")}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {t("moderator.reports.dialog.warn.title")}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t(
                                        "moderator.reports.dialog.warn.descriptionPrefix",
                                      )}{" "}
                                      <span className="font-semibold">
                                        {report.reviewAuthorName ??
                                          t(
                                            "moderator.reports.dialog.warn.authorFallback",
                                          )}
                                      </span>{" "}
                                      {t(
                                        "moderator.reports.dialog.warn.descriptionSuffix",
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {t("common.cancel", undefined, "Cancel")}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleWarnUser(
                                          report.id,
                                          report.reviewAuthorName,
                                        )
                                      }
                                      className="bg-secondary text-secondary-foreground hover:bg-secondary/85"
                                    >
                                      {t(
                                        "moderator.reports.dialog.warn.confirm",
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-role-secondary gap-1.5 min-h-11 sm:h-8 text-destructive border-destructive/30 hover:bg-destructive/5 dark:hover:bg-destructive"
                                    disabled={isBanPending}
                                  >
                                    {isBanPending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Ban className="h-3.5 w-3.5" />
                                    )}
                                    {t("moderator.reports.actions.escalateBan")}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {t("moderator.reports.dialog.ban.title")}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t(
                                        "moderator.reports.dialog.ban.descriptionPrefix",
                                      )}{" "}
                                      <span className="font-semibold">
                                        {report.reviewAuthorName ??
                                          t(
                                            "moderator.reports.dialog.ban.authorFallback",
                                          )}
                                      </span>{" "}
                                      {t(
                                        "moderator.reports.dialog.ban.descriptionSuffix",
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {t("common.cancel", undefined, "Cancel")}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleBanUser(
                                          report.id,
                                          report.reviewAuthorName,
                                        )
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t(
                                        "moderator.reports.dialog.ban.confirm",
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </ModeratorSection>
    </ModeratorPageLayout>
  );
};

export default ReportedContentPage;
