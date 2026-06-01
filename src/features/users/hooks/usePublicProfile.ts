import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { PublicUserProfile, UserReviewActivity } from "../types";
import { getPublicProfileBundle } from "../services/userService";
import {
  INVALID_PROFILE_LINK_MESSAGE,
  resolvePublicProfileErrorMessage,
} from "../utils/publicProfileErrors";

interface UsePublicProfileReturn {
  profile: PublicUserProfile | null;
  reviews: UserReviewActivity[];
  loading: boolean;
  isReloading: boolean;
  error: string | null;
  reviewsWarning: string | null;
  isOwnProfile: boolean;
  reload: () => Promise<void>;
  clearReviewsWarning: () => void;
}

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
        setError(INVALID_PROFILE_LINK_MESSAGE);
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
        setError(resolvePublicProfileErrorMessage(err));
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

  const clearReviewsWarning = () => setReviewsWarning(null);

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
