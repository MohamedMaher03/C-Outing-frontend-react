import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlaceById,
  getPlaceReviews,
  getSocialMediaReviews,
  submitReview,
  updateReview,
  deleteReview,
  reportReview,
  getMyReview,
  getAverageRating,
  toggleLike as toggleVenueLike,
  recordInteraction,
} from "@/features/place-detail/services/placeDetailService";
import { INTERACTION_ACTION_TYPES } from "@/features/interactions";
import { favoriteAdapter } from "@/features/place-detail/services/favoriteAdapter";
import type {
  InteractionActionType,
  PlaceDetail,
  ReportPayload,
  Review,
  ReviewListResponse,
  SocialMediaReview,
  SocialReviewListResponse,
} from "@/features/place-detail/types";
import { getReviewIdentity } from "@/features/place-detail/utils/reviewIdentity";
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
  pageIndex: 0,
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

const mergeUniqueSocialById = (
  current: SocialMediaReview[],
  incoming: SocialMediaReview[],
): SocialMediaReview[] => {
  const map = new Map<string, SocialMediaReview>();
  current.forEach((review) => map.set(review.id, review));
  incoming.forEach((review) => map.set(review.id, review));

  return Array.from(map.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
};

const isNotFoundApiError = (error: unknown): boolean =>
  isApiError(error) && error.statusCode === 404;

export interface UsePlaceDetailReturn {
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

  reviews: Review[];
  reviewsPagination: ReviewsPaginationState;
  loadingMoreReviews: boolean;
  socialReviews: SocialMediaReview[];
  socialReviewsPagination: ReviewsPaginationState;
  loadingMoreSocialReviews: boolean;
  myReview: Review | null;
  myReviewLoading: boolean;
  reviewsLoading: boolean;
  socialReviewsLoading: boolean;
  socialReviewsLoaded: boolean;
  reviewsError: string | null;
  socialReviewsError: string | null;

  submittingReview: boolean;
  deletingReview: boolean;
  reportingReview: boolean;
  reviewSubmitted: boolean;
  reviewActionError: string | null;

  toggleFavorite: () => Promise<void>;
  toggleLike: () => Promise<void>;
  isReviewReported: (reviewId: string) => boolean;
  openInMaps: () => void;
  goBack: () => void;
  handleSubmitReview: (rating: number, comment: string) => Promise<void>;
  handleDeleteMyReview: () => Promise<void>;
  handleReportReview: (payload: ReportPayload) => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  loadMoreSocialReviews: () => Promise<void>;
  trackInteraction: (actionType: InteractionActionType) => Promise<void>;
  refreshPlaceData: () => Promise<void>;
  retryReviewsLoad: () => Promise<void>;
  retrySocialReviewsLoad: () => Promise<void>;
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

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPagination, setReviewsPagination] =
    useState<ReviewsPaginationState>(DEFAULT_PAGINATION);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [socialReviews, setSocialReviews] = useState<SocialMediaReview[]>([]);
  const [socialReviewsPagination, setSocialReviewsPagination] =
    useState<ReviewsPaginationState>(DEFAULT_PAGINATION);
  const [loadingMoreSocialReviews, setLoadingMoreSocialReviews] =
    useState(false);
  const [hasLoadedSocialReviews, setHasLoadedSocialReviews] =
    useState<boolean>(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [myReviewLoading, setMyReviewLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [socialReviewsLoading, setSocialReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [socialReviewsError, setSocialReviewsError] = useState<string | null>(
    null,
  );

  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [reportingReview, setReportingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewActionError, setReviewActionError] = useState<string | null>(
    null,
  );
  const isSubmittingReviewRef = useRef(false);
  const longViewTimeoutRef = useRef<number | null>(null);
  const trackedLongViewPlaceRef = useRef<string | null>(null);

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
    setSocialReviewsPagination(DEFAULT_PAGINATION);
    setLoadingMoreSocialReviews(false);
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
      if (longViewTimeoutRef.current) {
        window.clearTimeout(longViewTimeoutRef.current);
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

  const applySocialReviewPagination = useCallback(
    (data: SocialReviewListResponse) => {
      setSocialReviewsPagination({
        pageIndex: data.pageIndex,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
      });
    },
    [],
  );

  const fetchReviews = useCallback(
    async (id: string, pageIndex = 0, append = false) => {
      try {
        if (append) {
          setLoadingMoreReviews(true);
        } else {
          setReviewsLoading(true);
          setReviewsError(null);
        }

        const data = await getPlaceReviews(id, { pageIndex, pageSize: 10 });
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
        await fetchReviews(id, 0);
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
    async (id: string, pageIndex = 0, append = false) => {
      try {
        if (append) {
          setLoadingMoreSocialReviews(true);
        } else {
          setSocialReviewsLoading(true);
          setSocialReviewsError(null);
        }

        const data = await getSocialMediaReviews(id, {
          pageIndex,
          pageSize: 10,
        });
        if (!isActivePlace(id)) return;

        if (append) {
          setSocialReviews((prev) => mergeUniqueSocialById(prev, data.items));
        } else {
          setSocialReviews(data.items);
        }

        applySocialReviewPagination(data);
        setHasLoadedSocialReviews(true);
      } catch (err) {
        if (!append && isActivePlace(id)) {
          setSocialReviewsError(
            getErrorMessage(err, "Failed to load social reviews"),
          );
        }
      } finally {
        if (isActivePlace(id)) {
          if (append) {
            setLoadingMoreSocialReviews(false);
          } else {
            setSocialReviewsLoading(false);
          }
        }
      }
    },
    [applySocialReviewPagination, isActivePlace],
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
                averageRating: avg.averageRating,
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
        getPlaceReviews(id, { pageIndex: 0, pageSize: 10 }).catch(() => null),
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
      await recordInteraction({
        venueId: id,
        actionType: INTERACTION_ACTION_TYPES.view,
      });
    } catch {
      // Interaction tracking is non-blocking by design.
    }
  }, []);

  const refreshPlaceData = useCallback(async () => {
    if (!placeId) return;

    await Promise.all([fetchPlaceDetails(placeId), fetchMyReview(placeId)]);
  }, [fetchMyReview, fetchPlaceDetails, placeId]);

  useEffect(() => {
    if (!placeId) return;

    void refreshPlaceData();
    void trackViewInteraction(placeId);
  }, [placeId, refreshPlaceData, trackViewInteraction]);

  useEffect(() => {
    if (!placeId) return;

    trackedLongViewPlaceRef.current = null;
    if (longViewTimeoutRef.current) {
      window.clearTimeout(longViewTimeoutRef.current);
    }

    longViewTimeoutRef.current = window.setTimeout(() => {
      if (trackedLongViewPlaceRef.current === placeId) {
        return;
      }

      trackedLongViewPlaceRef.current = placeId;
      void recordInteraction({
        venueId: placeId,
        actionType: INTERACTION_ACTION_TYPES.longView,
      });
    }, 25000);

    return () => {
      if (longViewTimeoutRef.current) {
        window.clearTimeout(longViewTimeoutRef.current);
      }
    };
  }, [placeId]);

  const retryReviewsLoad = useCallback(async () => {
    if (!placeId) return;
    await fetchReviews(placeId, 0);
  }, [fetchReviews, placeId]);

  const retrySocialReviewsLoad = useCallback(async () => {
    if (!placeId) return;
    await fetchSocialReviews(placeId, 0, false);
  }, [fetchSocialReviews, placeId]);

  const ensureSocialReviewsLoaded = useCallback(async () => {
    if (!placeId || hasLoadedSocialReviews || socialReviewsLoading) {
      return;
    }

    await fetchSocialReviews(placeId, 0, false);
  }, [
    fetchSocialReviews,
    hasLoadedSocialReviews,
    placeId,
    socialReviewsLoading,
  ]);

  const loadMoreReviews = useCallback(async () => {
    if (!placeId || !reviewsPagination.hasNextPage || loadingMoreReviews) {
      return;
    }

    await fetchReviews(placeId, reviewsPagination.pageIndex + 1, true);
  }, [fetchReviews, loadingMoreReviews, placeId, reviewsPagination]);

  const loadMoreSocialReviews = useCallback(async () => {
    if (
      !placeId ||
      !socialReviewsPagination.hasNextPage ||
      loadingMoreSocialReviews
    ) {
      return;
    }

    await fetchSocialReviews(
      placeId,
      socialReviewsPagination.pageIndex + 1,
      true,
    );
  }, [
    fetchSocialReviews,
    loadingMoreSocialReviews,
    placeId,
    socialReviewsPagination,
  ]);

  const trackInteraction = useCallback(
    async (actionType: InteractionActionType) => {
      if (!place) return;

      try {
        await recordInteraction({
          venueId: place.id,
          actionType,
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
      await trackInteraction(INTERACTION_ACTION_TYPES.favorite);
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
      await trackInteraction(INTERACTION_ACTION_TYPES.like);
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
      const trimmedComment = comment.trim();

      try {
        setSubmittingReview(true);
        setReviewActionError(null);

        const canonicalMyReview = myReview
          ? await getMyReview(placeId).catch((fetchError) => {
              if (isNotFoundApiError(fetchError)) return myReview;
              throw fetchError;
            })
          : null;

        if (canonicalMyReview && !canonicalMyReview.id) {
          throw new Error("Cannot edit review because id is missing");
        }

        const editableReviewId = canonicalMyReview?.id;
        const newReview = canonicalMyReview
          ? await updateReview(editableReviewId as string, {
              rating,
              comment: trimmedComment,
            })
          : await submitReview(placeId, rating, trimmedComment);

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

        await trackInteraction(INTERACTION_ACTION_TYPES.rate);
        if (trimmedComment.length > 0) {
          await trackInteraction(INTERACTION_ACTION_TYPES.review);
        }
        await Promise.all([
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
      if (!myReview.id) {
        throw new Error("Cannot delete review because id is missing");
      }
      await deleteReview(myReview.id);

      setReviews((prev) =>
        prev.filter((review) => {
          if (myReview.id && review.id) {
            return review.id !== myReview.id;
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
        refreshAverageRating(placeId),
        syncReviewsAfterMutation(placeId),
      ]);
    } catch (err) {
      setReviewActionError(getErrorMessage(err, "Failed to delete review"));
      throw err;
    } finally {
      setDeletingReview(false);
    }
  }, [myReview, placeId, refreshAverageRating, syncReviewsAfterMutation]);

  const handleReportReview = useCallback(
    async (payload: ReportPayload) => {
      if (!payload.reviewId) {
        throw new Error("Cannot report review because reviewId is missing");
      }

      const currentUserId = getCurrentAuthUserId();
      const targetReview =
        reviews.find((review) => review.id === payload.reviewId) ??
        (myReview && myReview.id === payload.reviewId ? myReview : null);

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

    void trackInteraction(INTERACTION_ACTION_TYPES.directions);
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
    socialReviewsPagination,
    loadingMoreSocialReviews,
    myReview,
    myReviewLoading,
    reviewsLoading,
    socialReviewsLoading,
    socialReviewsLoaded: hasLoadedSocialReviews,
    reviewsError,
    socialReviewsError,
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
    loadMoreSocialReviews,
    trackInteraction,
    refreshPlaceData,
    retryReviewsLoad,
    retrySocialReviewsLoad,
    ensureSocialReviewsLoaded,
  };
};
