/**
 * Moderate Reviews Page (Moderator)
 *
 * Review moderation queue: approve, reject, or flag reviews.
 * Moderators cannot delete reviews (only admins can).
 */

import { useMemo, type CSSProperties } from "react";
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
import { useModerateReviews } from "@/features/moderator/hooks/useModerateReviews";
import {
  moderatorReviewRowStateClass,
  moderatorReviewStatusConfig,
} from "@/features/moderator/constants/statusConfigs";
import { MODERATOR_REVIEW_STATUS_FILTER_OPTIONS } from "@/features/moderator/constants/filterOptions";
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
  formatShortDate,
  pluralize,
} from "@/features/moderator/utils/formatters";

const REVIEW_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f4efe5'/%3E%3Ccircle cx='48' cy='36' r='16' fill='%23c8b088'/%3E%3Crect x='22' y='58' width='52' height='24' rx='12' fill='%23967f59'/%3E%3C/svg%3E";

const MODERATOR_REVIEW_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "220px",
  contain: "layout paint style",
};

const ModerateReviewsPage = () => {
  const {
    reviews,
    loading,
    error,
    pendingReviewIdSet,
    search,
    statusFilter,
    filteredReviews: filtered,
    setSearch,
    setStatusFilter,
    retry,
    handleApprove,
    handleReject,
    handleFlag,
  } = useModerateReviews();

  const reviewSummary = useMemo(
    () =>
      reviews.reduce(
        (summary, review) => {
          if (review.status === "flagged") {
            summary.flagged += 1;
          }
          if (review.status === "pending") {
            summary.pending += 1;
          }
          return summary;
        },
        { flagged: 0, pending: 0 },
      ),
    [reviews],
  );

  if (loading) {
    return (
      <LoadingSpinner size="md" text="Loading review queue..." fullScreen />
    );
  }

  return (
    <ModeratorPageLayout>
      <ModeratorPageHeader
        title="Review Moderation"
        description={`${formatCount(reviews.length)} total reviews · ${formatCount(reviewSummary.pending)} pending · ${formatCount(reviewSummary.flagged)} flagged`}
        icon={MessageSquare}
      />

      <ModeratorErrorBanner
        title="Couldn't load review moderation queue"
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <ModeratorSection
        tone="muted"
        title="Moderation Filters"
        description="Use keywords and status chips to adapt the queue for quick mobile moderation or deeper desktop review."
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reviews, users, or places..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:min-w-[16rem]">
            <ModeratorFilterChips
              label="Status"
              options={MODERATOR_REVIEW_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </ModeratorSection>

      <ModeratorSection
        title="Review Queue"
        description={`${formatCount(filtered.length)} reviews in current view`}
        contentClassName="gap-4"
      >
        {filtered.length === 0 ? (
          <ModeratorEmptyState
            icon={MessageSquare}
            title="Queue is clear"
            description={
              search.trim().length > 0
                ? "No reviews match your current search and status filters."
                : "No reviews match the current moderation segment."
            }
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
                {/* Header */}
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
                          onError={(event) => {
                            (event.currentTarget as HTMLImageElement).src =
                              REVIEW_PLACEHOLDER_IMAGE;
                          }}
                        />
                      ) : (
                        <User className="h-4 w-4 text-secondary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-role-secondary font-semibold text-foreground">
                        {review.userName}
                      </p>
                      <p className="text-role-caption text-muted-foreground">
                        on{" "}
                        <span className="font-medium text-foreground">
                          {review.placeName}
                        </span>
                        {" · "}
                        {formatShortDate(review.createdAt)}
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
                              ? "text-secondary fill-secondary"
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
                      {config.label}
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
                      {formatCount(review.reportCount)}{" "}
                      {pluralize(review.reportCount, "report")}
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
                          Approve
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
                          Flag
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
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </ModeratorSection>
    </ModeratorPageLayout>
  );
};

export default ModerateReviewsPage;
