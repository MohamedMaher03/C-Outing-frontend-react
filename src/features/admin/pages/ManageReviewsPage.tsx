import {
  Search,
  MessageSquare,
  Star,
  CheckCircle,
  AlertTriangle,
  Trash2,
  XCircle,
  User,
  Loader2,
} from "lucide-react";
import { useMemo, type CSSProperties } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
import { cn } from "@/lib/utils";
import { useManageReviews } from "@/features/admin/hooks/useManageReviews";
import {
  AdminEmptyState,
  AdminErrorBanner,
  AdminFilterChips,
  AdminPageLayout,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin/components";
import { REVIEW_STATUS_FILTER_OPTIONS } from "@/features/admin/constants/filterOptions";
import {
  reviewRowStateClass,
  reviewStatusConfig,
} from "@/features/admin/constants/statusConfigs";
import { useI18n } from "@/components/i18n";

const ADMIN_REVIEW_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "220px",
  contain: "layout paint style",
};

const ManageReviewsPage = () => {
  const { t, locale, formatNumber } = useI18n();
  const {
    reviews,
    loading,
    error,
    processingReviewIds,
    search,
    statusFilter,
    filteredReviews: filtered,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    goToPreviousPage,
    goToNextPage,
    setSearch,
    setStatusFilter,
    retry,
    handleStatusChange,
    handleDelete,
  } = useManageReviews();

  const monthDayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  const statusFilterOptions = REVIEW_STATUS_FILTER_OPTIONS.map((option) => ({
    ...option,
    label:
      option.value === "all"
        ? t("admin.filter.all")
        : t(`admin.status.${option.value}`),
  }));

  const getStatusLabel = (status: keyof typeof reviewStatusConfig): string =>
    t(`admin.status.${status}`);

  const flaggedReviewsCount = reviews.filter(
    (review) => review.status === "flagged",
  ).length;
  const pendingReviewsCount = reviews.filter(
    (review) => review.status === "pending",
  ).length;

  if (loading) {
    return (
      <LoadingSpinner size="md" text={t("admin.reviews.loading")} fullScreen />
    );
  }

  return (
    <AdminPageLayout>
      <AdminPageHeader
        title={t("admin.reviews.header.title")}
        description={t("admin.reviews.header.description", {
          total: formatNumber(reviews.length),
          flagged: formatNumber(flaggedReviewsCount),
          pending: formatNumber(pendingReviewsCount),
        })}
        icon={MessageSquare}
      />

      <AdminErrorBanner
        title={t("admin.reviews.error.updateTitle")}
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <AdminSection
        tone="muted"
        title={t("admin.reviews.filters.title")}
        description={t("admin.reviews.filters.description")}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("admin.reviews.filters.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:w-auto">
            <AdminFilterChips
              label={t("admin.filter.status")}
              options={statusFilterOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title={t("admin.reviews.records.title")}
        description={t("admin.reviews.records.description", {
          count: formatNumber(filtered.length),
        })}
        contentClassName="gap-3"
      >
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={MessageSquare}
            title={t("admin.reviews.empty.title")}
            description={t("admin.reviews.empty.description")}
          />
        ) : (
          filtered.map((review) => {
            const config = reviewStatusConfig[review.status];
            const StatusIcon = config.icon;
            const isProcessing = processingReviewIds.includes(review.id);

            return (
              <div
                key={review.id}
                className={cn(
                  "space-y-3 rounded-xl border p-4 transition-all hover:shadow-sm",
                  reviewRowStateClass[review.status],
                )}
                style={ADMIN_REVIEW_ROW_STYLE}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.userAvatar ? (
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <User className="h-4 w-4 text-secondary dark:text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-role-secondary font-semibold text-foreground">
                        {review.userName}
                      </p>
                      <p className="text-role-caption text-muted-foreground">
                        {t("admin.reviews.meta.on")}{" "}
                        <span className="font-medium text-foreground">
                          {review.venueName}
                        </span>
                        {" · "}
                        {monthDayFormatter.format(new Date(review.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < review.rating
                              ? "text-secondary fill-secondary dark:text-primary dark:fill-primary"
                              : "text-muted-foreground/20",
                          )}
                        />
                      ))}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5 py-0 text-role-caption",
                        config.class,
                      )}
                    >
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                      {getStatusLabel(review.status)}
                    </Badge>
                  </div>
                </div>
                <p className="line-clamp-3 break-words pl-0 text-role-secondary leading-relaxed text-muted-foreground sm:line-clamp-2 sm:pl-12">
                  {review.comment}
                </p>
                {review.reportCount > 0 && (
                  <div className="pl-0 sm:pl-12">
                    <span className="flex items-center gap-1 text-role-caption font-semibold text-destructive">
                      <AlertTriangle className="h-3 w-3" />{" "}
                      {t("admin.reviews.meta.reports", {
                        count: formatNumber(review.reportCount),
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap pl-0 sm:pl-12">
                  {(review.status === "pending" ||
                    review.status === "flagged") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        void handleStatusChange(review.id, "published")
                      }
                      className="min-h-11 gap-1 text-role-secondary text-primary hover:text-primary"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                          {t("admin.reviews.actions.working")}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          {t("admin.reviews.actions.approve")}
                        </>
                      )}
                    </Button>
                  )}
                  {review.status !== "removed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        void handleStatusChange(review.id, "removed")
                      }
                      className="min-h-11 gap-1 text-role-secondary text-destructive hover:text-destructive"
                      disabled={isProcessing}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {t("admin.reviews.actions.remove")}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-11 gap-1 text-role-secondary text-destructive hover:text-destructive"
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("admin.reviews.actions.delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("admin.reviews.dialog.deleteTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("admin.reviews.dialog.deleteDescription", {
                            user: review.userName,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("admin.reviews.actions.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleDelete(review.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isProcessing}
                        >
                          {t("admin.reviews.actions.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })
        )}
        {totalPages > 1 && (
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-role-caption text-muted-foreground">
              {t("admin.places.pagination.summary", {
                page: formatNumber(pageIndex),
                totalPages: formatNumber(totalPages),
                totalCount: formatNumber(totalCount),
                pageSize: formatNumber(pageSize),
              })}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage || loading}
              >
                {t("admin.places.pagination.previous")}
              </Button>

              <span className="inline-flex items-center rounded-lg border px-3">
                {t("admin.places.pagination.page", {
                  page: formatNumber(pageIndex),
                  totalPages: formatNumber(totalPages),
                })}
                {/* {pageIndex} / {totalPages} */}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!hasNextPage || loading}
              >
                {t("admin.places.pagination.next")}
              </Button>
            </div>
          </div>
        )}
      </AdminSection>
    </AdminPageLayout>
  );
};

export default ManageReviewsPage;
