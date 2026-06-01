import { type CSSProperties } from "react";
import {
  Search,
  MessageSquare,
  Star,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Flag,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useModerateReviewsPage } from "@/features/moderator/hooks/useModerateReviewsPage";
import {
  moderatorReviewRowStateClass,
  moderatorReviewStatusConfig,
} from "@/features/moderator/constants/statusConfigs";
import {
  ModeratorEmptyState,
  ModeratorErrorBanner,
  ModeratorFilterChips,
  ModeratorPageHeader,
  ModeratorPageLayout,
  ModeratorSection,
} from "@/features/moderator/components";
import { formatCount, formatShortDate } from "@/features/moderator/utils/formatters";
import {
  REVIEW_AVATAR_PLACEHOLDER_IMAGE,
  assignImageFallbackOnError,
} from "@/features/moderator/utils/moderatorQueueMetrics";

const MODERATOR_REVIEW_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "220px",
  contain: "layout paint style",
};

const ModerateReviewsPage = () => {
  const {
    t,
    locale,
    reviews,
    loading,
    error,
    pendingReviewIdSet,
    search,
    statusFilter,
    filteredReviews: filtered,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setSearch,
    setStatusFilter,
    goToPreviousPage,
    goToNextPage,
    handleApprove,
    handleReject,
    handleFlag,
    statusFilterOptions,
    reviewQueueSummary,
    resolveEmptyDescription,
    retryReviewQueue,
    pageJumpDraft,
    setPageJumpDraft,
    commitPageJump,
    handlePageJumpKeyDown,
  } = useModerateReviewsPage();

  if (loading) {
    return (
      <LoadingSpinner
        size="md"
        text={t("moderator.reviews.loading")}
        fullScreen
      />
    );
  }

  return (
    <ModeratorPageLayout>
      <ModeratorPageHeader
        title={t("moderator.reviews.header.title")}
        description={t("moderator.reviews.header.description", {
          total: formatCount(reviews.length, locale),
          pending: formatCount(reviewQueueSummary.pending, locale),
          flagged: formatCount(reviewQueueSummary.flagged, locale),
        })}
        icon={MessageSquare}
      />

      <ModeratorErrorBanner
        title={t("moderator.reviews.error.loadTitle")}
        message={error}
        onRetry={retryReviewQueue}
      />

      <ModeratorSection
        tone="muted"
        title={t("moderator.reviews.filters.title")}
        description={t("moderator.reviews.filters.description")}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("moderator.reviews.filters.searchPlaceholder")}
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
      </ModeratorSection>

      <ModeratorSection
        title={t("moderator.reviews.queue.title")}
        description={t("moderator.reviews.queue.description", {
          count: formatCount(filtered.length, locale),
        })}
        contentClassName="gap-4"
      >
        {filtered.length === 0 ? (
          <ModeratorEmptyState
            icon={MessageSquare}
            title={t("moderator.reviews.empty.title")}
            description={resolveEmptyDescription()}
          />
        ) : (
          filtered.map((review) => {
            const config = moderatorReviewStatusConfig[review.status];
            const StatusIcon = config.icon;
            const isPending = pendingReviewIdSet.has(review.id);

            return (
              <div
                key={review.id}
                className={cn(
                  "space-y-4 rounded-xl border bg-card p-4 transition-all motion-reduce:transition-none hover:shadow-sm",
                  moderatorReviewRowStateClass[review.status],
                )}
                aria-busy={isPending}
                style={MODERATOR_REVIEW_ROW_STYLE}
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
                          onError={(event) =>
                            assignImageFallbackOnError(
                              event,
                              REVIEW_AVATAR_PLACEHOLDER_IMAGE,
                            )
                          }
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
                        {t("moderator.reviews.meta.on")}{" "}
                        <span className="font-medium text-foreground">
                          {review.venueName}
                        </span>
                        {" · "}
                        {formatShortDate(review.createdAt, locale)}
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
                      {t(`admin.status.${review.status}`)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border/60 pt-3 sm:pl-12">
                  <p className="line-clamp-3 break-words text-role-secondary leading-relaxed text-muted-foreground sm:line-clamp-2">
                    {review.comment}
                  </p>

                  {review.reportCount > 0 && (
                    <span className="flex items-center gap-1 text-role-caption font-semibold text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      {t("moderator.reviews.meta.reports", {
                        count: formatCount(review.reportCount, locale),
                      })}
                    </span>
                  )}

                  {review.status !== "removed" && (
                    <div className="flex flex-wrap items-center gap-2">
                      {review.status !== "published" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          disabled={isPending}
                          className="min-h-11 gap-1 text-role-secondary text-primary hover:bg-primary/10 hover:text-primary sm:h-8"
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          {t("moderator.reviews.actions.approve")}
                        </Button>
                      )}
                      {review.status !== "flagged" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFlag(review.id)}
                          disabled={isPending}
                          className="min-h-11 gap-1 text-role-secondary text-foreground hover:bg-secondary/20 hover:text-foreground sm:h-8"
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Flag className="h-3.5 w-3.5" />
                          )}
                          {t("moderator.reviews.actions.flag")}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(review.id)}
                        disabled={isPending}
                        className="min-h-11 gap-1 text-role-secondary text-destructive hover:bg-destructive/10 hover:text-destructive sm:h-8"
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {t("moderator.reviews.actions.reject")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {totalPages > 1 && (
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-role-caption text-muted-foreground">
              {t("moderator.reviews.pagination.summary", {
                page: formatCount(pageIndex, locale),
                totalPages: formatCount(totalPages, locale),
                totalCount: formatCount(totalCount, locale),
                pageSize: formatCount(pageSize, locale),
              })}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage || loading}
              >
                {t("moderator.reviews.pagination.previous")}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-role-caption text-muted-foreground">
                  {t("moderator.pagination.goTo", undefined, "Go to page")}
                </span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageJumpDraft}
                  onChange={(event) => setPageJumpDraft(event.target.value)}
                  onBlur={commitPageJump}
                  onKeyDown={handlePageJumpKeyDown}
                  className="h-8 w-20 text-center"
                  aria-label={t(
                    "moderator.pagination.goToAria",
                    undefined,
                    "Go to page",
                  )}
                  disabled={loading}
                />
              </div>

              <span className="inline-flex items-center rounded-lg border px-3">
                {t("moderator.reviews.pagination.page", {
                  page: formatCount(pageIndex, locale),
                  totalPages: formatCount(totalPages, locale),
                })}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!hasNextPage || loading}
              >
                {t("moderator.reviews.pagination.next")}
              </Button>
            </div>
          </div>
        )}
      </ModeratorSection>
    </ModeratorPageLayout>
  );
};

export default ModerateReviewsPage;
