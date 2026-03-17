/**
 * usePlaceDetail Hook
 * Manages place detail page state and actions including reviews
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlaceById,
  getPlaceReviews,
  getSocialMediaReviews,
  getReviewSummary,
  submitReview,
  updateReview,
  deleteReview,
  reportReview,
  getMyReview,
  getAverageRating,
  recordInteraction,
} from "@/features/place-detail/services/placeDetailService";
import { favoriteAdapter } from "@/features/place-detail/services/favoriteAdapter";
import type {
  InteractionActionType,
  PlaceDetail,
  ReportPayload,
  Review,
  ReviewListResponse,
  SocialMediaReview,
  ReviewSummary,
} from "@/features/place-detail/types";
import { getReviewIdentity } from "@/features/place-detail/utils/reviewIdentity";
import { getOrCreateSessionId } from "@/features/place-detail/utils/sessionManager";
import { getErrorMessage, isApiError } from "@/utils/apiError";

interface ReviewsPaginationState {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

const DEFAULT_PAGINATION: ReviewsPaginationState = {
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
};

const mergeUniqueById = (current: Review[], incoming: Review[]): Review[] => {
  const map = new Map<string, Review>();
  current.forEach((review) => map.set(getReviewIdentity(review), review));
  incoming.forEach((review) => map.set(getReviewIdentity(review), review));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

const isNotFoundApiError = (error: unknown): boolean =>
  isApiError(error) && error.statusCode === 404;

export interface UsePlaceDetailReturn {
  // State
  place: PlaceDetail | null;
  loading: boolean;
  error: string | null;
  isFavorite: boolean;
  savingFavorite: boolean;
  isLiked: boolean;
  savingLike: boolean;
  notification: {
    show: boolean;
    type: "like" | "favorite" | "report" | null;
    action: "added" | "removed" | "submitted";
  };

  // Reviews
  reviews: Review[];
  reviewsPagination: ReviewsPaginationState;
  loadingMoreReviews: boolean;
  socialReviews: SocialMediaReview[];
  reviewSummary: ReviewSummary | null;
  myReview: Review | null;
  myReviewLoading: boolean;
  reviewsLoading: boolean;
  socialReviewsLoading: boolean;
  summaryLoading: boolean;

  // Review form
  submittingReview: boolean;
  deletingReview: boolean;
  reportingReview: boolean;
  reviewSubmitted: boolean;
  reviewActionError: string | null;

  // Actions
  toggleFavorite: () => Promise<void>;
  toggleLike: () => Promise<void>;
  isReviewReported: (reviewId: string) => boolean;
  openInMaps: () => void;
  goBack: () => void;
  handleSubmitReview: (rating: number, comment: string) => Promise<void>;
  handleDeleteMyReview: () => Promise<void>;
  handleReportReview: (payload: ReportPayload) => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  trackInteraction: (actionType: InteractionActionType) => Promise<void>;
}

export const usePlaceDetail = (
  placeId: string | undefined,
): UsePlaceDetailReturn => {
  const navigate = useNavigate();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [savingLike, setSavingLike] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "like" | "favorite" | "report" | null;
    action: "added" | "removed" | "submitted";
  }>({ show: false, type: null, action: "added" });
  const notificationTimeoutRef = useRef<number | null>(null);
  const [reportedReviewIds, setReportedReviewIds] = useState<Set<string>>(
    new Set(),
  );

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPagination, setReviewsPagination] =
    useState<ReviewsPaginationState>(DEFAULT_PAGINATION);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [socialReviews, setSocialReviews] = useState<SocialMediaReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(
    null,
  );
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [myReviewLoading, setMyReviewLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [socialReviewsLoading, setSocialReviewsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [reportingReview, setReportingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewActionError, setReviewActionError] = useState<string | null>(
    null,
  );
  const isSubmittingReviewRef = useRef(false);

  const showNotification = useCallback(
    (
      type: "like" | "favorite" | "report",
      action: "added" | "removed" | "submitted",
    ) => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }

      setNotification({ show: true, type, action });
      notificationTimeoutRef.current = window.setTimeout(() => {
        setNotification({ show: false, type: null, action: "added" });
      }, 2500);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Fetch place details on mount or when placeId changes
  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails(placeId);
      fetchReviews(placeId, 1);
      fetchSocialReviews(placeId);
      fetchReviewSummary(placeId);
      fetchMyReview(placeId);
      trackViewInteraction(placeId);
    }
  }, [placeId]);

  const refreshAverageRating = async (id: string) => {
    try {
      const avg = await getAverageRating(id);
      setPlace((prev) =>
        prev
          ? {
              ...prev,
              rating: avg.averageRating,
            }
          : prev,
      );
    } catch (err) {
      console.error("Error refreshing average rating:", err);
    }
  };

  const fetchPlaceDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const [data, favoriteStatus] = await Promise.all([
        getPlaceById(id),
        favoriteAdapter.isFavorite(id),
      ]);

      setPlace(data);
      setIsFavorite(favoriteStatus);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load place details"));
      console.error("Error fetching place details:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyReviewPagination = (data: ReviewListResponse) => {
    setReviewsPagination({
      pageIndex: data.pageIndex,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      totalPages: data.totalPages,
      hasNextPage: data.hasNextPage,
    });
  };

  const fetchReviews = async (id: string, page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMoreReviews(true);
      } else {
        setReviewsLoading(true);
      }

      const data = await getPlaceReviews(id, { page, pageSize: 10 });
      if (append) {
        setReviews((prev) => mergeUniqueById(prev, data.items));
      } else {
        setReviews(data.items);
      }
      applyReviewPagination(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      if (append) {
        setLoadingMoreReviews(false);
      } else {
        setReviewsLoading(false);
      }
    }
  };

  const loadMoreReviews = useCallback(async () => {
    if (!placeId || !reviewsPagination.hasNextPage || loadingMoreReviews)
      return;

    await fetchReviews(placeId, reviewsPagination.pageIndex + 1, true);
  }, [placeId, reviewsPagination, loadingMoreReviews]);

  const fetchSocialReviews = async (id: string) => {
    try {
      setSocialReviewsLoading(true);
      const data = await getSocialMediaReviews(id);
      setSocialReviews(data);
    } catch (err) {
      console.error("Error fetching social reviews:", err);
    } finally {
      setSocialReviewsLoading(false);
    }
  };

  const fetchReviewSummary = async (id: string) => {
    try {
      setSummaryLoading(true);
      const data = await getReviewSummary(id);
      setReviewSummary(data);
    } catch (err) {
      console.error("Error fetching review summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchMyReview = async (id: string) => {
    try {
      setMyReviewLoading(true);
      const review = await getMyReview(id);
      setMyReview(review);
    } catch (err) {
      if (isNotFoundApiError(err)) {
        setMyReview(null);
        return;
      }
      console.error("Error fetching current user review:", err);
    } finally {
      setMyReviewLoading(false);
    }
  };

  const syncReviewsAfterMutation = useCallback(async (id: string) => {
    const [myReviewResult, reviewsPageResult] = await Promise.all([
      getMyReview(id).catch((error) => {
        if (isNotFoundApiError(error)) return null;
        throw error;
      }),
      getPlaceReviews(id, { page: 1, pageSize: 10 }).catch(() => null),
    ]);

    setMyReview(myReviewResult);

    if (reviewsPageResult) {
      setReviews(reviewsPageResult.items);
      applyReviewPagination(reviewsPageResult);
    }
  }, []);

  const trackViewInteraction = async (id: string) => {
    try {
      const sessionId = getOrCreateSessionId();
      await recordInteraction({
        placeId: id,
        actionType: "ViewDetails",
        sessionId,
      });
    } catch (err) {
      console.error("Error tracking view interaction:", err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!place) return;

    try {
      setSavingFavorite(true);

      // Optimistic update
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);

      // Call API
      await favoriteAdapter.toggle(place.id, isFavorite);
      showNotification("favorite", newFavoriteState ? "added" : "removed");

      // Track interaction
      await trackInteraction("Favorite");
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Revert optimistic update
      setIsFavorite(!isFavorite);
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleToggleLike = useCallback(async () => {
    try {
      setSavingLike(true);
      const next = !isLiked;
      setIsLiked(next);
      showNotification("like", next ? "added" : "removed");
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.error("Error toggling like:", err);
      setIsLiked((prev) => !prev);
    } finally {
      setSavingLike(false);
    }
  }, [isLiked, showNotification]);

  const handleSubmitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!place || !placeId) return;
      // Synchronous ref guard: prevents double-submission before React
      // re-renders the button as disabled (state updates are async)
      if (isSubmittingReviewRef.current) return;
      isSubmittingReviewRef.current = true;

      try {
        setSubmittingReview(true);
        setReviewActionError(null);

        const canonicalMyReview = myReview
          ? await getMyReview(placeId).catch((error) => {
              if (isNotFoundApiError(error)) return myReview;
              throw error;
            })
          : null;

        if (canonicalMyReview && !canonicalMyReview.reviewId) {
          throw new Error("Cannot edit review because reviewId is missing");
        }

        const editableReviewId = canonicalMyReview?.reviewId;
        const newReview = canonicalMyReview
          ? await updateReview(editableReviewId as string, {
              rating,
              comment,
            })
          : await submitReview(placeId, rating, comment);

        setMyReview(newReview);
        setReviews((prev) => {
          const newIdentity = getReviewIdentity(newReview);
          const existingIndex = prev.findIndex((r) => {
            const identity = getReviewIdentity(r);
            return identity === newIdentity;
          });
          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = newReview;
            return next;
          }

          return [newReview, ...prev];
        });
        setReviewSubmitted(true);

        // Track interaction
        await trackInteraction("Rate");
        await Promise.all([
          fetchReviewSummary(placeId),
          refreshAverageRating(placeId),
          syncReviewsAfterMutation(placeId),
        ]);

        // Reset submitted flag after a delay
        setTimeout(() => setReviewSubmitted(false), 3000);
      } catch (err) {
        setReviewActionError(getErrorMessage(err, "Failed to submit review"));
        console.error("Error submitting review:", err);
        throw err;
      } finally {
        setSubmittingReview(false);
        isSubmittingReviewRef.current = false;
      }
    },
    [myReview, place, placeId, syncReviewsAfterMutation],
  );

  const handleDeleteMyReview = useCallback(async () => {
    if (!myReview || !placeId) return;

    try {
      setDeletingReview(true);
      setReviewActionError(null);
      if (!myReview.reviewId) {
        throw new Error("Cannot delete review because reviewId is missing");
      }
      await deleteReview(myReview.reviewId);

      setReviews((prev) =>
        prev.filter((review) => {
          if (myReview.reviewId && review.reviewId) {
            return review.reviewId !== myReview.reviewId;
          }

          return !(
            review.venueId === myReview.venueId &&
            review.userId === myReview.userId &&
            review.createdAt === myReview.createdAt
          );
        }),
      );
      setMyReview(null);
      await Promise.all([
        fetchReviewSummary(placeId),
        refreshAverageRating(placeId),
        syncReviewsAfterMutation(placeId),
      ]);
    } catch (err) {
      setReviewActionError(getErrorMessage(err, "Failed to delete review"));
      console.error("Error deleting review:", err);
      throw err;
    } finally {
      setDeletingReview(false);
    }
  }, [myReview, placeId, syncReviewsAfterMutation]);

  const handleReportReview = useCallback(
    async (payload: ReportPayload) => {
      if (!payload.reviewId) {
        throw new Error("Cannot report review because reviewId is missing");
      }

      if (reportedReviewIds.has(payload.reviewId)) {
        return;
      }

      try {
        setReportingReview(true);
        await reportReview(payload.reviewId, {
          reason: payload.reason,
          description: payload.description,
        });
        setReportedReviewIds((prev) => new Set([...prev, payload.reviewId]));
        showNotification("report", "submitted");
      } catch (err) {
        console.error("Error reporting review:", err);
        throw err;
      } finally {
        setReportingReview(false);
      }
    },
    [reportedReviewIds, showNotification],
  );

  const openInMaps = () => {
    if (!place) return;

    window.open(
      `https://www.google.com/maps?q=${place.latitude},${place.longitude}`,
      "_blank",
    );

    // Track interaction
    trackInteraction("Click");
  };

  const goBack = () => {
    navigate(-1);
  };

  const trackInteraction = async (actionType: InteractionActionType) => {
    if (!place) return;

    try {
      const sessionId = getOrCreateSessionId();
      await recordInteraction({
        placeId: place.id,
        actionType,
        sessionId,
      });
    } catch (err) {
      console.error("Error tracking interaction:", err);
    }
  };

  return {
    place,
    loading,
    error,
    isFavorite,
    savingFavorite,
    isLiked,
    savingLike,
    notification,
    reviews,
    reviewsPagination,
    loadingMoreReviews,
    socialReviews,
    reviewSummary,
    myReview,
    myReviewLoading,
    reviewsLoading,
    socialReviewsLoading,
    summaryLoading,
    submittingReview,
    deletingReview,
    reportingReview,
    reviewSubmitted,
    reviewActionError,
    toggleFavorite: handleToggleFavorite,
    toggleLike: handleToggleLike,
    isReviewReported: (reviewId: string) => reportedReviewIds.has(reviewId),
    openInMaps,
    goBack,
    handleSubmitReview,
    handleDeleteMyReview,
    handleReportReview,
    loadMoreReviews,
    trackInteraction,
  };
};
