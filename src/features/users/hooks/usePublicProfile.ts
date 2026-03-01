/**
 * usePublicProfile Hook
 *
 * Fetches a public user profile + their recent reviews by userId.
 * Also exposes a `follow` action that optimistically updates the UI.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getPublicProfile,
  getUserReviews,
  toggleFollow,
} from "../services/userService";
import type { PublicUserProfile, UserReviewActivity } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";

interface UsePublicProfileReturn {
  profile: PublicUserProfile | null;
  reviews: UserReviewActivity[];
  loading: boolean;
  followLoading: boolean;
  error: string | null;
  /** True when the viewer is looking at their own profile */
  isOwnProfile: boolean;
  follow: () => Promise<void>;
}

export const usePublicProfile = (userId: string): UsePublicProfileReturn => {
  const { user } = useAuth();
  const currentUserId = user ? String(user.userId) : undefined;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReviewActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = !!currentUserId && currentUserId === userId;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileData, reviewsData] = await Promise.all([
          getPublicProfile(userId, currentUserId),
          getUserReviews(userId),
        ]);

        if (!cancelled) {
          setProfile(profileData);
          setReviews(reviewsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile",
          );
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

  const follow = useCallback(async () => {
    if (!profile || isOwnProfile) return;
    setFollowLoading(true);
    try {
      // Optimistic update
      setProfile((prev) =>
        prev ? { ...prev, isFollowing: !prev.isFollowing } : prev,
      );
      await toggleFollow(userId, profile.isFollowing ?? false);
    } catch {
      // Revert on failure
      setProfile((prev) =>
        prev ? { ...prev, isFollowing: profile.isFollowing } : prev,
      );
    } finally {
      setFollowLoading(false);
    }
  }, [profile, isOwnProfile, userId]);

  return {
    profile,
    reviews,
    loading,
    followLoading,
    error,
    isOwnProfile,
    follow,
  };
};
