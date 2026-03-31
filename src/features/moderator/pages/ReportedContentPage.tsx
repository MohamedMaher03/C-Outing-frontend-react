/**
 * Reported Content Page (Moderator)
 *
 * Handle user reports — view, investigate, resolve, or dismiss reports.
 */

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
    return <LoadingSpinner size="md" text="Loading reports..." fullScreen />;
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
        title="Reported Content"
        description={`${formatCount(reportSummary.open)} open · ${formatCount(reportSummary.investigating)} investigating`}
        icon={ShieldAlert}
      />

      <ModeratorErrorBanner
        title="Couldn't load reported content"
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <ModeratorSection
        tone="muted"
        title="Moderation Filters"
        description="Adjust report status and content type across mobile and desktop contexts."
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports, reporters, or reasons..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:min-w-[16rem]">
            <ModeratorFilterChips
              label="Status"
              options={MODERATOR_REPORT_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        <div className="lg:max-w-[18rem]">
          <ModeratorFilterChips
            label="Type"
            options={MODERATOR_REPORT_TYPE_FILTER_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </div>
      </ModeratorSection>

      <ModeratorSection
        title="Reports Queue"
        description={`${formatCount(filtered.length)} reports in current view`}
        contentClassName="gap-4"
      >
        {filtered.length === 0 ? (
          <ModeratorEmptyState
            icon={ShieldAlert}
            title="Queue is clear"
            description={
              search.trim().length > 0
                ? "No reports match your current search and filter chips."
                : "No reports match the current moderation segment."
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
                {/* Main Row */}
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
                        {config.label}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-role-caption px-1.5 py-0 border-0",
                          priority.class,
                        )}
                      >
                        {priority.label}
                      </Badge>
                    </div>
                    <p className="text-role-caption text-muted-foreground break-words">
                      Reported by{" "}
                      <span className="font-medium">{report.reporterName}</span>{" "}
                      · {formatRelativeTime(report.createdAt)}
                    </p>
                    <p className="text-role-caption text-muted-foreground break-words">
                      <span className="font-medium">Reason:</span>{" "}
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
                      {isExpanded ? "Less" : "Details"}
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
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
                            Original Review
                            {report.reviewAuthorName ? (
                              <span className="text-muted-foreground font-normal break-words">
                                - by {report.reviewAuthorName}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-role-secondary text-foreground leading-relaxed italic break-words">
                            "{report.reviewContent ?? "Content unavailable"}"
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 text-role-caption font-semibold text-destructive">
                            <FileText className="h-3.5 w-3.5" />
                            Reporter's Description
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
                        Resolved on {formatLongDate(report.resolvedAt)}
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
                              className="text-role-secondary gap-1 min-h-11 sm:h-8 text-foreground border-secondary/40 hover:bg-secondary/20"
                            >
                              {isStatusPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              Investigate
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
                            Dismiss
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(report.id, "resolved")
                            }
                            disabled={Boolean(isStatusPending)}
                            className="text-role-secondary gap-1 min-h-11 sm:h-8 ml-0 sm:ml-auto text-primary border-primary/30 hover:bg-primary/10"
                          >
                            {isStatusPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                            Mark Resolved
                          </Button>
                        </div>

                        {report.type === "review" ? (
                          <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                            <p className="text-role-caption font-semibold text-foreground uppercase tracking-wide">
                              Resolution Actions
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-role-secondary gap-1.5 min-h-11 sm:h-8 text-destructive border-destructive/30 hover:bg-destructive/5"
                                    disabled={isDeletePending}
                                  >
                                    {isDeletePending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    Delete Review
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete review
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Permanently delete this review? This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteReview(report.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-role-secondary gap-1.5 min-h-11 sm:h-8 border-secondary/40 hover:bg-secondary/20"
                                    disabled={isWarnPending}
                                  >
                                    {isWarnPending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Bell className="h-3.5 w-3.5" />
                                    )}
                                    Warn User
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Send warning
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Send a policy-violation warning to{" "}
                                      <span className="font-semibold">
                                        {report.reviewAuthorName ??
                                          "the review author"}
                                      </span>
                                      ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
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
                                      Send Warning
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-role-secondary gap-1.5 min-h-11 sm:h-8 text-destructive border-destructive/30 hover:bg-destructive/5"
                                    disabled={isBanPending}
                                  >
                                    {isBanPending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Ban className="h-3.5 w-3.5" />
                                    )}
                                    Escalate &amp; Ban
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Escalate for ban
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Flag{" "}
                                      <span className="font-semibold">
                                        {report.reviewAuthorName ?? "this user"}
                                      </span>{" "}
                                      for admin ban review? Their account will
                                      be queued for suspension.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
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
                                      Escalate to Admin
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
