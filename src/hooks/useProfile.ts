/**
 * useProfile Hook
 * Manages profile page state and actions
 */

import { useState, useEffect } from "react";
import {
  getUserProfile,
  getUserPreferences,
  updateUserPreferences,
  signOut,
  type UserProfile,
  type UserPreferences,
} from "../services/api/profileService";

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
  selectedBudget: "Low" | "Medium" | "High";

  // Actions
  toggleInterest: (id: string) => void;
  setVibe: (value: number[]) => void;
  toggleDistrict: (district: string) => void;
  setSelectedBudget: (budget: "Low" | "Medium" | "High") => void;
  savePreferences: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [vibe, setVibe] = useState<number[]>([50]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<
    "Low" | "Medium" | "High"
  >("Medium");

  // Fetch profile and preferences on mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both profile and preferences
      const [profileData, preferencesData] = await Promise.all([
        getUserProfile(),
        getUserPreferences(),
      ]);

      setProfile(profileData);
      setPreferences(preferencesData);

      // Set local state from fetched preferences
      setSelectedInterests(preferencesData.interests || []);
      setVibe([preferencesData.vibe || 50]);
      setSelectedDistricts(preferencesData.districts || []);
      setSelectedBudget(preferencesData.budget || "Medium");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district],
    );
  };

  const savePreferences = async () => {
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
        err instanceof Error ? err.message : "Failed to save preferences",
      );
      console.error("Error saving preferences:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Clear local state
      setProfile(null);
      setPreferences(null);
    } catch (err) {
      console.error("Error signing out:", err);
      throw err;
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
    setSelectedBudget,
    savePreferences,
    handleSignOut,
    refreshProfile,
  };
};
