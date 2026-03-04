/**
 * Manage Reviews Page (Admin)
 *
 * Full control over reviews: list, filter by status, approve/reject/remove.
 */

import { useState, useEffect } from "react";
import {
  Search,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  XCircle,
  User,
} from "lucide-react";
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
import { adminMock } from "@/features/admin/mocks/adminMock";
import type { AdminReview } from "@/features/admin/types";

const statusConfig: Record<
  string,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  published: {
    label: "Published",
    class: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    class: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  flagged: {
    label: "Flagged",
    class: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  removed: {
    label: "Removed",
    class: "bg-gray-100 text-gray-500 border-gray-200",
    icon: XCircle,
  },
};

const ManageReviewsPage = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminMock.getReviews();
        setReviews(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = async (
    reviewId: string,
    status: AdminReview["status"],
  ) => {
    await adminMock.updateReviewStatus(reviewId, status);
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r)),
    );
  };

  const handleDelete = async (reviewId: string) => {
    await adminMock.deleteReview(reviewId);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.placeName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner size="md" text="Loading reviews..." fullScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-secondary" />
          Manage Reviews
        </h1>
        <p className="text-sm text-muted-foreground">
          {reviews.length} total reviews ·{" "}
          {reviews.filter((r) => r.status === "flagged").length} flagged ·{" "}
          {reviews.filter((r) => r.status === "pending").length} pending
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews, users, or places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "published", "pending", "flagged", "removed"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40",
                )}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No reviews found</p>
          </div>
        ) : (
          filtered.map((review) => {
            const config = statusConfig[review.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={review.id}
                className={cn(
                  "p-4 rounded-xl bg-card border hover:shadow-sm transition-all space-y-3",
                  review.status === "flagged"
                    ? "border-red-200 bg-red-50/30"
                    : review.status === "pending"
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-border",
                )}
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
                        />
                      ) : (
                        <User className="h-4 w-4 text-secondary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {review.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        on{" "}
                        <span className="font-medium text-foreground">
                          {review.placeName}
                        </span>
                        {" · "}
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
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
                      className={cn("text-[10px] px-1.5 py-0", config.class)}
                    >
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                      {config.label}
                    </Badge>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 pl-12">
                  {review.comment}
                </p>

                {/* Reports badge */}
                {review.reportCount > 0 && (
                  <div className="pl-12">
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {review.reportCount}{" "}
                      report{review.reportCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pl-12">
                  {(review.status === "pending" ||
                    review.status === "flagged") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(review.id, "published")}
                      className="text-xs gap-1 h-7 text-emerald-600 hover:text-emerald-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {review.status !== "removed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(review.id, "removed")}
                      className="text-xs gap-1 h-7 text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Remove
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 h-7 text-destructive hover:text-destructive"
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
                          onClick={() => handleDelete(review.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      </div>
    </div>
  );
};

export default ManageReviewsPage;
