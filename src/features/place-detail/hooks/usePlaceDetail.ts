/**
 * usePlaceDetail Hook
 * Manages place detail page state and actions including reviews
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlaceById,
  getPlaceReviews,
  getSocialMediaReviews,
  getReviewSummary,
  submitReview,
  recordInteraction,
} from "@/features/place-detail/services/placeDetailService";
import type {
  PlaceDetail,
  Review,
  SocialMediaReview,
  ReviewSummary,
} from "@/features/place-detail/types";
import {
  toggleFavorite,
  checkIsFavorite,
} from "@/features/favorites/services/favoritesService";

interface UsePlaceDetailReturn {
  // State
  place: PlaceDetail | null;
  loading: boolean;
  error: string | null;
  isFavorite: boolean;
  savingFavorite: boolean;

  // Reviews
  reviews: Review[];
  socialReviews: SocialMediaReview[];
  reviewSummary: ReviewSummary | null;
  reviewsLoading: boolean;
  socialReviewsLoading: boolean;
  summaryLoading: boolean;

  // Review form
  submittingReview: boolean;
  reviewSubmitted: boolean;

  // Actions
  toggleFavorite: () => Promise<void>;
  openInMaps: () => void;
  goBack: () => void;
  handleSubmitReview: (rating: number, comment: string) => Promise<void>;
  trackInteraction: (
    actionType: "Click" | "ViewDetails" | "Rate" | "Favorite" | "Share",
  ) => Promise<void>;
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

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [socialReviews, setSocialReviews] = useState<SocialMediaReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(
    null,
  );
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [socialReviewsLoading, setSocialReviewsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Fetch place details on mount or when placeId changes
  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails(placeId);
      fetchReviews(placeId);
      fetchSocialReviews(placeId);
      fetchReviewSummary(placeId);
      trackViewInteraction(placeId);
    }
  }, [placeId]);

  const fetchPlaceDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const [data, favoriteStatus] = await Promise.all([
        getPlaceById(id),
        checkIsFavorite(id),
      ]);

      setPlace(data);
      setIsFavorite(favoriteStatus);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load place details",
      );
      console.error("Error fetching place details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (id: string) => {
    try {
      setReviewsLoading(true);
      const data = await getPlaceReviews(id);
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

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

  const trackViewInteraction = async (id: string) => {
    try {
      const sessionId =
        sessionStorage.getItem("sessionId") || generateSessionId();
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
      await toggleFavorite(place.id, isFavorite);

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

  const handleSubmitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!place || !placeId) return;

      try {
        setSubmittingReview(true);
        const newReview = await submitReview(placeId, rating, comment);
        setReviews((prev) => [newReview, ...prev]);
        setReviewSubmitted(true);

        // Track interaction
        await trackInteraction("Rate");

        // Reset submitted flag after a delay
        setTimeout(() => setReviewSubmitted(false), 3000);
      } catch (err) {
        console.error("Error submitting review:", err);
        throw err;
      } finally {
        setSubmittingReview(false);
      }
    },
    [place, placeId],
  );

  const openInMaps = () => {
    if (!place) return;

    window.open(
      `https://www.google.com/maps?q=${place.lat},${place.lng}`,
      "_blank",
    );

    // Track interaction
    trackInteraction("Click");
  };

  const goBack = () => {
    navigate(-1);
  };

  const trackInteraction = async (
    actionType: "Click" | "ViewDetails" | "Rate" | "Favorite" | "Share",
  ) => {
    if (!place) return;

    try {
      const sessionId =
        sessionStorage.getItem("sessionId") || generateSessionId();
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
    reviews,
    socialReviews,
    reviewSummary,
    reviewsLoading,
    socialReviewsLoading,
    summaryLoading,
    submittingReview,
    reviewSubmitted,
    toggleFavorite: handleToggleFavorite,
    openInMaps,
    goBack,
    handleSubmitReview,
    trackInteraction,
  };
};

// Helper function to generate session ID
const generateSessionId = (): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem("sessionId", sessionId);
  return sessionId;
};
