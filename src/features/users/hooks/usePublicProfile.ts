/**
 * usePublicProfile Hook
 *
 * Fetches public profile data + recent reviews by userId.
 */

import { useState, useEffect, useCallback } from "react";
import { getPublicProfileBundle } from "../services/userService";
import type { PublicUserProfile, UserReviewActivity } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage } from "@/utils/apiError";

interface UsePublicProfileReturn {
  profile: PublicUserProfile | null;
  reviews: UserReviewActivity[];
  loading: boolean;
  error: string | null;
  /** True when the viewer is looking at their own profile */
  isOwnProfile: boolean;
  reload: () => Promise<void>;
}

export const usePublicProfile = (userId: string): UsePublicProfileReturn => {
  const { user } = useAuth();
  const currentUserId = user ? String(user.userId) : undefined;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReviewActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = !!currentUserId && currentUserId === userId;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { profile: profileData, reviews: reviewsData } =
        await getPublicProfileBundle(userId, currentUserId);
      setProfile(profileData);
      setReviews(reviewsData);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  }, [userId, currentUserId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const { profile: profileData, reviews: reviewsData } =
          await getPublicProfileBundle(userId, currentUserId);

        if (!cancelled) {
          setProfile(profileData);
          setReviews(reviewsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load profile"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, currentUserId]);

  return {
    profile,
    reviews,
    loading,
    error,
    isOwnProfile,
    reload: loadProfile,
  };
};
