/**
 * Manage Reviews Page (Admin)
 *
 * Full control over reviews: list, filter by status, approve/reject/remove.
 */

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

const monthDayFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const ADMIN_REVIEW_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "220px",
  contain: "layout paint style",
};

const ManageReviewsPage = () => {
  const {
    reviews,
    loading,
    error,
    processingReviewIds,
    search,
    statusFilter,
    filteredReviews: filtered,
    setSearch,
    setStatusFilter,
    retry,
    handleStatusChange,
    handleDelete,
  } = useManageReviews();

  const reviewSummary = useMemo(
    () => ({
      flagged: reviews.filter((review) => review.status === "flagged").length,
      pending: reviews.filter((review) => review.status === "pending").length,
    }),
    [reviews],
  );

  if (loading) {
    return <LoadingSpinner size="md" text="Loading reviews..." fullScreen />;
  }

  return (
    <AdminPageLayout>
      <AdminPageHeader
        title="Manage Reviews"
        description={`${reviews.length} total reviews · ${reviewSummary.flagged} flagged · ${reviewSummary.pending} pending`}
        icon={MessageSquare}
      />

      <AdminErrorBanner
        title="Couldn't update reviews"
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <AdminSection
        tone="muted"
        title="Moderation Filters"
        description="Slice the moderation queue by status and keywords"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reviews, users, or places..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:w-auto">
            <AdminFilterChips
              label="Status"
              options={REVIEW_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title="Review Records"
        description={`${filtered.length} reviews in current view`}
        contentClassName="gap-3"
      >
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={MessageSquare}
            title="No reviews in this segment"
            description="Adjust the search query or status chips to inspect another moderation queue."
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

                {/* Comment */}
                <p className="line-clamp-3 break-words pl-0 text-role-secondary leading-relaxed text-muted-foreground sm:line-clamp-2 sm:pl-12">
                  {review.comment}
                </p>

                {/* Reports badge */}
                {review.reportCount > 0 && (
                  <div className="pl-0 sm:pl-12">
                    <span className="flex items-center gap-1 text-role-caption font-semibold text-destructive">
                      <AlertTriangle className="h-3 w-3" /> {review.reportCount}{" "}
                      report{review.reportCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Actions */}
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
                          Working
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
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
                      <XCircle className="h-3.5 w-3.5" /> Remove
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
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                          Permanently delete this review by {review.userName}?
                          This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleDelete(review.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isProcessing}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })
        )}
      </AdminSection>
    </AdminPageLayout>
  );
};

export default ManageReviewsPage;
