/**
 * useProfile Hook
 * Manages profile page state and actions
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getUserProfile,
  getUserPreferences,
  updateUserPreferences,
  signOut,
} from "@/features/profile/services/profileService";
import type { UserProfile, UserPreferences } from "@/features/profile/types";
import type { PriceLevel } from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseProfileReturn {
  // State
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Preferences state
  selectedInterests: string[];
  vibe: number[];
  selectedDistricts: string[];
  selectedBudget: PriceLevel;

  // Actions
  toggleInterest: (id: string) => void;
  setVibe: (value: number[]) => void;
  toggleDistrict: (district: string) => void;
  setSelectedBudget: (budget: PriceLevel) => void;
  savePreferences: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const { t } = useI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestLoadRunRef = useRef(0);
  const saveInFlightRef = useRef(false);
  const signOutInFlightRef = useRef(false);

  // Local state for preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [vibe, setVibe] = useState<number[]>([50]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<PriceLevel>("mid_range");

  const clearError = () => {
    setError((prev) => (prev ? null : prev));
  };

  const fetchProfileData = useCallback(async () => {
    const runId = ++latestLoadRunRef.current;

    try {
      setLoading(true);
      setError(null);

      const [profileData, preferencesData] = await Promise.all([
        getUserProfile(),
        getUserPreferences(),
      ]);

      if (runId !== latestLoadRunRef.current) {
        return;
      }

      setProfile(profileData);
      setPreferences(preferencesData);

      setSelectedInterests(preferencesData.interests || []);
      setVibe([preferencesData.vibe || 50]);
      setSelectedDistricts(preferencesData.districts || []);
      setSelectedBudget(preferencesData.budget || "mid_range");
    } catch (err) {
      if (runId !== latestLoadRunRef.current) {
        return;
      }

      setError(getErrorMessage(err, t("profile.error.loadFallback")));
    } finally {
      if (runId === latestLoadRunRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  // Fetch profile and preferences on mount
  useEffect(() => {
    void fetchProfileData();
  }, [fetchProfileData]);

  const toggleInterest = (id: string) => {
    clearError();
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleDistrict = (district: string) => {
    clearError();
    setSelectedDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district],
    );
  };

  const savePreferences = async () => {
    if (saveInFlightRef.current || saving) {
      return;
    }

    saveInFlightRef.current = true;

    try {
      setSaving(true);
      setError(null);

      const updatedPreferences = await updateUserPreferences({
        interests: selectedInterests,
        vibe: vibe[0],
        districts: selectedDistricts,
        budget: selectedBudget,
      });

      setPreferences(updatedPreferences);
    } catch (err) {
      setError(
        getErrorMessage(err, t("profile.error.savePreferencesFallback")),
      );
      throw err;
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (signOutInFlightRef.current) {
      return;
    }

    signOutInFlightRef.current = true;

    try {
      await signOut();
      // Clear local state
      setProfile(null);
      setPreferences(null);
    } finally {
      signOutInFlightRef.current = false;
    }
  };

  const refreshProfile = async () => {
    await fetchProfileData();
  };

  return {
    profile,
    preferences,
    loading,
    saving,
    error,
    selectedInterests,
    vibe,
    selectedDistricts,
    selectedBudget,
    toggleInterest,
    setVibe,
    toggleDistrict,
    setSelectedBudget: (budget: PriceLevel) => {
      clearError();
      setSelectedBudget(budget);
    },
    savePreferences,
    handleSignOut,
    refreshProfile,
  };
};
