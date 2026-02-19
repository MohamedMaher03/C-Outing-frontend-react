/**
 * usePlaceDetail Hook
 * Manages place detail page state and actions
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlaceById,
  recordInteraction,
  type PlaceDetail,
} from "../services/api/placeDetailService";
import {
  toggleFavorite,
  checkIsFavorite,
} from "../services/api/favoritesService";

interface UsePlaceDetailReturn {
  // State
  place: PlaceDetail | null;
  loading: boolean;
  error: string | null;
  isFavorite: boolean;
  savingFavorite: boolean;

  // Actions
  toggleFavorite: () => Promise<void>;
  openInMaps: () => void;
  goBack: () => void;
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
  const [savingFavorite, setSavingFavorite] = useState(false); //used for button becomes disabled while saving.

  // Fetch place details on mount or when placeId changes
  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails(placeId);
      // Track view interaction
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
      // Don't show error to user for tracking failures
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
      // Don't show error to user for tracking failures
    }
  };

  return {
    place,
    loading,
    error,
    isFavorite,
    savingFavorite,
    toggleFavorite: handleToggleFavorite,
    openInMaps,
    goBack,
    trackInteraction,
  };
};

// Helper function to generate session ID
const generateSessionId = (): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem("sessionId", sessionId);
  return sessionId;
};
