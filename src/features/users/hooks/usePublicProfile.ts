/**
 * usePublicProfile Hook
 *
 * Fetches public profile data + recent reviews by userId.
 * Hardened for stale requests, partial failures, and retriable reloads.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage, isApiError } from "@/utils/apiError";
import type { PublicUserProfile, UserReviewActivity } from "../types";
import { getPublicProfileBundle } from "../services/userService";

interface UsePublicProfileReturn {
  profile: PublicUserProfile | null;
  reviews: UserReviewActivity[];
  loading: boolean;
  isReloading: boolean;
  error: string | null;
  reviewsWarning: string | null;
  /** True when the viewer is looking at their own profile */
  isOwnProfile: boolean;
  reload: () => Promise<void>;
  clearReviewsWarning: () => void;
}

const toFriendlyErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You are offline. Reconnect and try again.";
  }

  if (isApiError(error)) {
    if (error.statusCode === 401) {
      return "Your session expired. Please sign in again.";
    }
    if (error.statusCode === 403) {
      return "You do not have permission to view this profile.";
    }
    if (error.statusCode === 404) {
      return "This profile does not exist or is no longer available.";
    }
    if (error.statusCode === 429) {
      return "Too many requests right now. Please wait a few seconds and retry.";
    }
    if (typeof error.statusCode === "number" && error.statusCode >= 500) {
      return "We are having trouble loading this profile. Please try again shortly.";
    }
  }

  return getErrorMessage(error, fallback);
};

export const usePublicProfile = (userId: string): UsePublicProfileReturn => {
  const { user } = useAuth();
  const currentUserId = user ? String(user.userId) : undefined;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReviewActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsWarning, setReviewsWarning] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const reloadPromiseRef = useRef<Promise<void> | null>(null);

  const normalizedUserId = userId.trim();
  const isOwnProfile =
    Boolean(currentUserId) &&
    Boolean(normalizedUserId) &&
    currentUserId === normalizedUserId;

  const loadProfile = useCallback(
    async ({
      showLoader = true,
      forceRefresh = false,
    }: {
      showLoader?: boolean;
      forceRefresh?: boolean;
    } = {}): Promise<void> => {
      const requestId = ++requestIdRef.current;

      if (!normalizedUserId) {
        setProfile(null);
        setReviews([]);
        setReviewsWarning(null);
        setError("This profile link is invalid.");
        setLoading(false);
        setIsReloading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      } else {
        setIsReloading(true);
      }

      setError(null);

      try {
        const {
          profile: profileData,
          reviews: reviewsData,
          reviewsWarning: warning,
        } = await getPublicProfileBundle(normalizedUserId, currentUserId, {
          forceRefresh,
        });

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setProfile(profileData);
        setReviews(reviewsData);
        setReviewsWarning(warning);
      } catch (err) {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setProfile(null);
        setReviews([]);
        setReviewsWarning(null);
        setError(
          toFriendlyErrorMessage(
            err,
            "We could not load this profile right now.",
          ),
        );
      } finally {
        if (mountedRef.current && requestId === requestIdRef.current) {
          if (showLoader) {
            setLoading(false);
          } else {
            setIsReloading(false);
          }
        }
      }
    },
    [normalizedUserId, currentUserId],
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadProfile({ showLoader: true });

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadProfile]);

  const reload = useCallback(async () => {
    if (reloadPromiseRef.current) {
      return reloadPromiseRef.current;
    }

    const reloadPromise = loadProfile({
      showLoader: false,
      forceRefresh: true,
    }).finally(() => {
      reloadPromiseRef.current = null;
    });

    reloadPromiseRef.current = reloadPromise;
    await reloadPromise;
  }, [loadProfile]);

  const clearReviewsWarning = useCallback(() => {
    setReviewsWarning(null);
  }, []);

  return {
    profile,
    reviews,
    loading,
    isReloading,
    error,
    reviewsWarning,
    isOwnProfile,
    reload,
    clearReviewsWarning,
  };
};
