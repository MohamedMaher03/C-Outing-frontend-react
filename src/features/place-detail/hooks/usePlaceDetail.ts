/**
 * usePlaceDetail Hook
 * Manages place detail page state and resilient actions for reviews/interactions.
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
  toggleLike as toggleVenueLike,
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
import { getCurrentAuthUserId } from "@/features/place-detail/utils/authUser";
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

const sortReviewsByNewest = (items: Review[]): Review[] =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const paginationFromInlineReviews = (
  items: Review[],
): ReviewsPaginationState => ({
  pageIndex: 1,
  pageSize: Math.max(items.length, 1),
  totalCount: items.length,
  totalPages: items.length > 0 ? 1 : 0,
  hasNextPage: false,
});

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
  currentUserId: string | null;
  canOpenInMaps: boolean;
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
  socialReviewsLoaded: boolean;
  summaryLoading: boolean;
  reviewsError: string | null;
  socialReviewsError: string | null;
  summaryError: string | null;

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
  refreshPlaceData: () => Promise<void>;
  retryReviewsLoad: () => Promise<void>;
  retrySocialReviewsLoad: () => Promise<void>;
  retrySummaryLoad: () => Promise<void>;
  ensureSocialReviewsLoaded: () => Promise<void>;
}

export const usePlaceDetail = (
  placeId: string | undefined,
): UsePlaceDetailReturn => {
  const navigate = useNavigate();
  const activePlaceIdRef = useRef<string | undefined>(placeId);
  const notificationTimeoutRef = useRef<number | null>(null);
  const reviewSubmittedTimeoutRef = useRef<number | null>(null);

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
  const [reportedReviewIds, setReportedReviewIds] = useState<Set<string>>(
    new Set(),
  );

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPagination, setReviewsPagination] =
    useState<ReviewsPaginationState>(DEFAULT_PAGINATION);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [socialReviews, setSocialReviews] = useState<SocialMediaReview[]>([]);
  const [hasLoadedSocialReviews, setHasLoadedSocialReviews] =
    useState<boolean>(false);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(
    null,
  );
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [myReviewLoading, setMyReviewLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [socialReviewsLoading, setSocialReviewsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [socialReviewsError, setSocialReviewsError] = useState<string | null>(
    null,
  );
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Review action state
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [reportingReview, setReportingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewActionError, setReviewActionError] = useState<string | null>(
    null,
  );
  const isSubmittingReviewRef = useRef(false);

  const isActivePlace = useCallback(
    (id: string): boolean => activePlaceIdRef.current === id,
    [],
  );

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
    activePlaceIdRef.current = placeId;

    setSocialReviews([]);
    setHasLoadedSocialReviews(false);
    setSocialReviewsError(null);
    setSocialReviewsLoading(false);
  }, [placeId]);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
      if (reviewSubmittedTimeoutRef.current) {
        window.clearTimeout(reviewSubmittedTimeoutRef.current);
      }
    };
  }, []);

  const applyReviewPagination = useCallback((data: ReviewListResponse) => {
    setReviewsPagination({
      pageIndex: data.pageIndex,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      totalPages: data.totalPages,
      hasNextPage: data.hasNextPage,
    });
  }, []);

  const fetchReviews = useCallback(
    async (id: string, page = 1, append = false) => {
      try {
        if (append) {
          setLoadingMoreReviews(true);
        } else {
          setReviewsLoading(true);
          setReviewsError(null);
        }

        const data = await getPlaceReviews(id, { page, pageSize: 10 });
        if (!isActivePlace(id)) return;

        if (append) {
          setReviews((prev) => mergeUniqueById(prev, data.items));
        } else {
          setReviews(data.items);
        }
        applyReviewPagination(data);
      } catch (err) {
        if (!append && isActivePlace(id)) {
          setReviewsError(getErrorMessage(err, "Failed to load reviews"));
        }
      } finally {
        if (isActivePlace(id)) {
          if (append) {
            setLoadingMoreReviews(false);
          } else {
            setReviewsLoading(false);
          }
        }
      }
    },
    [applyReviewPagination, isActivePlace],
  );

  const fetchPlaceDetails = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getPlaceById(id);
        if (!isActivePlace(id)) return;

        setPlace(data);
        const fallbackFavoriteStatus =
          data.isFavorited ??
          data.isSaved ??
          (await favoriteAdapter.isFavorite(id).catch(() => false));

        if (!isActivePlace(id)) return;

        setIsFavorite(fallbackFavoriteStatus);
        setIsLiked(data.isLiked ?? false);

        const inlineReviews = Array.isArray(data.reviews) ? data.reviews : [];
        if (inlineReviews.length > 0) {
          const sortedInlineReviews = sortReviewsByNewest(inlineReviews);
          setReviews(sortedInlineReviews);
          setReviewsPagination(
            paginationFromInlineReviews(sortedInlineReviews),
          );
          setReviewsLoading(false);
          setReviewsError(null);
        } else {
          await fetchReviews(id, 1);
        }
      } catch (err) {
        if (!isActivePlace(id)) return;

        setPlace(null);
        setError(getErrorMessage(err, "Failed to load place details"));
      } finally {
        if (isActivePlace(id)) {
          setLoading(false);
        }
      }
    },
    [fetchReviews, isActivePlace],
  );

  const fetchSocialReviews = useCallback(
    async (id: string) => {
      try {
        setSocialReviewsLoading(true);
        setSocialReviewsError(null);
        const data = await getSocialMediaReviews(id);
        if (!isActivePlace(id)) return;
        setSocialReviews(data);
        setHasLoadedSocialReviews(true);
      } catch (err) {
        if (isActivePlace(id)) {
          setSocialReviewsError(
            getErrorMessage(err, "Failed to load social reviews"),
          );
        }
      } finally {
        if (isActivePlace(id)) {
          setSocialReviewsLoading(false);
        }
      }
    },
    [isActivePlace],
  );

  const fetchReviewSummary = useCallback(
    async (id: string) => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const data = await getReviewSummary(id);
        if (!isActivePlace(id)) return;
        setReviewSummary(data);
      } catch (err) {
        if (isActivePlace(id)) {
          setSummaryError(
            getErrorMessage(err, "Failed to load review summary"),
          );
        }
      } finally {
        if (isActivePlace(id)) {
          setSummaryLoading(false);
        }
      }
    },
    [isActivePlace],
  );

  const fetchMyReview = useCallback(
    async (id: string) => {
      try {
        setMyReviewLoading(true);
        const review = await getMyReview(id);
        if (!isActivePlace(id)) return;
        setMyReview(review);
      } catch (err) {
        if (!isActivePlace(id)) return;
        if (isNotFoundApiError(err)) {
          setMyReview(null);
          return;
        }
        setReviewActionError(
          getErrorMessage(err, "Failed to load your existing review"),
        );
      } finally {
        if (isActivePlace(id)) {
          setMyReviewLoading(false);
        }
      }
    },
    [isActivePlace],
  );

  const refreshAverageRating = useCallback(
    async (id: string) => {
      try {
        const avg = await getAverageRating(id);
        if (!isActivePlace(id)) return;

        setPlace((prev) =>
          prev
            ? {
                ...prev,
                rating: avg.averageRating,
              }
            : prev,
        );
      } catch {
        // Non-blocking refresh.
      }
    },
    [isActivePlace],
  );

  const syncReviewsAfterMutation = useCallback(
    async (id: string) => {
      const [myReviewResult, reviewsPageResult] = await Promise.all([
        getMyReview(id).catch((error) => {
          if (isNotFoundApiError(error)) return null;
          throw error;
        }),
        getPlaceReviews(id, { page: 1, pageSize: 10 }).catch(() => null),
      ]);

      if (!isActivePlace(id)) return;

      setMyReview(myReviewResult);

      if (reviewsPageResult) {
        setReviews(reviewsPageResult.items);
        applyReviewPagination(reviewsPageResult);
        setReviewsError(null);
      }
    },
    [applyReviewPagination, isActivePlace],
  );

  const trackViewInteraction = useCallback(async (id: string) => {
    try {
      const sessionId = getOrCreateSessionId();
      await recordInteraction({
        placeId: id,
        actionType: "ViewDetails",
        sessionId,
      });
    } catch {
      // Interaction tracking is non-blocking by design.
    }
  }, []);

  const refreshPlaceData = useCallback(async () => {
    if (!placeId) return;

    await Promise.all([
      fetchPlaceDetails(placeId),
      fetchReviewSummary(placeId),
      fetchMyReview(placeId),
    ]);
  }, [fetchMyReview, fetchPlaceDetails, fetchReviewSummary, placeId]);

  useEffect(() => {
    if (!placeId) return;

    void refreshPlaceData();
    void trackViewInteraction(placeId);
  }, [placeId, refreshPlaceData, trackViewInteraction]);

  const retryReviewsLoad = useCallback(async () => {
    if (!placeId) return;
    await fetchReviews(placeId, 1);
  }, [fetchReviews, placeId]);

  const retrySocialReviewsLoad = useCallback(async () => {
    if (!placeId) return;
    await fetchSocialReviews(placeId);
  }, [fetchSocialReviews, placeId]);

  const ensureSocialReviewsLoaded = useCallback(async () => {
    if (!placeId || hasLoadedSocialReviews || socialReviewsLoading) {
      return;
    }

    await fetchSocialReviews(placeId);
  }, [
    fetchSocialReviews,
    hasLoadedSocialReviews,
    placeId,
    socialReviewsLoading,
  ]);

  const retrySummaryLoad = useCallback(async () => {
    if (!placeId) return;
    await fetchReviewSummary(placeId);
  }, [fetchReviewSummary, placeId]);

  const loadMoreReviews = useCallback(async () => {
    if (!placeId || !reviewsPagination.hasNextPage || loadingMoreReviews) {
      return;
    }

    await fetchReviews(placeId, reviewsPagination.pageIndex + 1, true);
  }, [fetchReviews, loadingMoreReviews, placeId, reviewsPagination]);

  const trackInteraction = useCallback(
    async (actionType: InteractionActionType) => {
      if (!place) return;

      try {
        const sessionId = getOrCreateSessionId();
        await recordInteraction({
          placeId: place.id,
          actionType,
          sessionId,
        });
      } catch {
        // Non-blocking action tracking.
      }
    },
    [place],
  );

  const handleToggleFavorite = useCallback(async () => {
    if (!place) return;

    try {
      setSavingFavorite(true);

      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);

      await favoriteAdapter.toggle(place.id, isFavorite);
      showNotification("favorite", newFavoriteState ? "added" : "removed");
      await trackInteraction("Favorite");
    } catch {
      setIsFavorite(!isFavorite);
    } finally {
      setSavingFavorite(false);
    }
  }, [isFavorite, place, showNotification, trackInteraction]);

  const handleToggleLike = useCallback(async () => {
    if (!place) return;

    const previousState = isLiked;
    const optimisticState = !previousState;

    try {
      setSavingLike(true);

      setIsLiked(optimisticState);
      setPlace((prev) =>
        prev
          ? {
              ...prev,
              isLiked: optimisticState,
            }
          : prev,
      );

      const serverState = await toggleVenueLike(place.id);
      const resolvedLikeState = serverState ?? optimisticState;

      setIsLiked(resolvedLikeState);
      setPlace((prev) =>
        prev
          ? {
              ...prev,
              isLiked: resolvedLikeState,
            }
          : prev,
      );
      showNotification("like", resolvedLikeState ? "added" : "removed");
    } catch {
      setIsLiked(previousState);
      setPlace((prev) =>
        prev
          ? {
              ...prev,
              isLiked: previousState,
            }
          : prev,
      );
    } finally {
      setSavingLike(false);
    }
  }, [isLiked, place, showNotification]);

  const handleSubmitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!place || !placeId) return;
      if (isSubmittingReviewRef.current) return;
      isSubmittingReviewRef.current = true;

      try {
        setSubmittingReview(true);
        setReviewActionError(null);

        const canonicalMyReview = myReview
          ? await getMyReview(placeId).catch((fetchError) => {
              if (isNotFoundApiError(fetchError)) return myReview;
              throw fetchError;
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
          const existingIndex = prev.findIndex(
            (review) => getReviewIdentity(review) === newIdentity,
          );

          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = newReview;
            return next;
          }

          return [newReview, ...prev];
        });

        setReviewSubmitted(true);
        if (reviewSubmittedTimeoutRef.current) {
          window.clearTimeout(reviewSubmittedTimeoutRef.current);
        }

        reviewSubmittedTimeoutRef.current = window.setTimeout(() => {
          setReviewSubmitted(false);
        }, 3000);

        await trackInteraction("Rate");
        await Promise.all([
          fetchReviewSummary(placeId),
          refreshAverageRating(placeId),
          syncReviewsAfterMutation(placeId),
        ]);
      } catch (err) {
        setReviewActionError(getErrorMessage(err, "Failed to submit review"));
        throw err;
      } finally {
        setSubmittingReview(false);
        isSubmittingReviewRef.current = false;
      }
    },
    [
      fetchReviewSummary,
      myReview,
      place,
      placeId,
      refreshAverageRating,
      syncReviewsAfterMutation,
      trackInteraction,
    ],
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
      throw err;
    } finally {
      setDeletingReview(false);
    }
  }, [
    fetchReviewSummary,
    myReview,
    placeId,
    refreshAverageRating,
    syncReviewsAfterMutation,
  ]);

  const handleReportReview = useCallback(
    async (payload: ReportPayload) => {
      if (!payload.reviewId) {
        throw new Error("Cannot report review because reviewId is missing");
      }

      const currentUserId = getCurrentAuthUserId();
      const targetReview =
        reviews.find(
          (review) =>
            review.reviewId === payload.reviewId ||
            review.id === payload.reviewId,
        ) ??
        (myReview &&
        (myReview.reviewId === payload.reviewId ||
          myReview.id === payload.reviewId)
          ? myReview
          : null);

      if (currentUserId && targetReview?.userId === currentUserId) {
        throw new Error("You cannot report your own review");
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
      } finally {
        setReportingReview(false);
      }
    },
    [myReview, reportedReviewIds, reviews, showNotification],
  );

  const canOpenInMaps =
    !!place &&
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    !(place.latitude === 0 && place.longitude === 0);

  const openInMaps = () => {
    if (!place || !canOpenInMaps) return;

    window.open(
      `https://www.google.com/maps?q=${place.latitude},${place.longitude}`,
      "_blank",
    );

    void trackInteraction("Click");
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    place,
    loading,
    error,
    isFavorite,
    savingFavorite,
    isLiked,
    savingLike,
    currentUserId: getCurrentAuthUserId(),
    canOpenInMaps,
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
    socialReviewsLoaded: hasLoadedSocialReviews,
    summaryLoading,
    reviewsError,
    socialReviewsError,
    summaryError,
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
    refreshPlaceData,
    retryReviewsLoad,
    retrySocialReviewsLoad,
    retrySummaryLoad,
    ensureSocialReviewsLoaded,
  };
};
