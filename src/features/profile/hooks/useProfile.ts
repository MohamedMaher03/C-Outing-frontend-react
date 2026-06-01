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
import type { OnboardingPreferences } from "@/features/onboarding/types";
import {
  normalizeVibe,
  validateOnboardingPreferences,
  type PreferenceValidationIssue,
} from "@/features/onboarding/utils/onboardingPreferences";
import { flipListMembership } from "@/features/onboarding/utils/listMembership";

interface UseProfileReturn {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveSuccess: boolean;
  saveValidationIssues: PreferenceValidationIssue[];

  selectedInterests: string[];
  vibe: number[];
  selectedDistricts: string[];
  selectedBudget: PriceLevel;
  selectedActivities: string[];
  selectedCompanionTypes: string[];

  toggleInterest: (id: string) => void;
  setVibe: (value: number[]) => void;
  toggleDistrict: (district: string) => void;
  setSelectedBudget: (budget: PriceLevel) => void;
  toggleActivity: (id: string) => void;
  toggleCompanionType: (id: string) => void;
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveValidationIssues, setSaveValidationIssues] = useState<
    PreferenceValidationIssue[]
  >([]);
  const latestLoadRunRef = useRef(0);
  const saveInFlightRef = useRef(false);
  const signOutInFlightRef = useRef(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [vibe, setVibe] = useState<number[]>([50]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<PriceLevel>("midrange");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedCompanionTypes, setSelectedCompanionTypes] = useState<string[]>([]);

  const clearSaveFeedback = () => {
    setError(null);
    setSaveSuccess(false);
    setSaveValidationIssues([]);
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
      setSelectedBudget(preferencesData.budget || "midrange");
      setSelectedActivities(preferencesData.favoriteActivities || []);
      setSelectedCompanionTypes(preferencesData.companionTypes || []);
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

  useEffect(() => {
    void fetchProfileData();
  }, [fetchProfileData]);

  const toggleInterest = (id: string) => {
    clearSaveFeedback();
    setSelectedInterests((prev) => flipListMembership(prev, id));
  };

  const toggleDistrict = (district: string) => {
    clearSaveFeedback();
    setSelectedDistricts((prev) => flipListMembership(prev, district));
  };

  const toggleActivity = (id: string) => {
    clearSaveFeedback();
    setSelectedActivities((prev) => flipListMembership(prev, id));
  };

  const toggleCompanionType = (id: string) => {
    clearSaveFeedback();
    setSelectedCompanionTypes((prev) => flipListMembership(prev, id));
  };

  const buildPreferencesPayload = (): OnboardingPreferences => ({
    interests: selectedInterests,
    vibe: vibe[0],
    districts: selectedDistricts,
    budget: selectedBudget,
    favoriteActivities: selectedActivities,
    companionTypes: selectedCompanionTypes,
  });

  const savePreferences = async () => {
    if (saveInFlightRef.current || saving) {
      return;
    }

    const validationIssues = validateOnboardingPreferences(
      buildPreferencesPayload(),
    );

    if (validationIssues.length > 0) {
      setSaveSuccess(false);
      setSaveValidationIssues(validationIssues);
      setError(null);
      return;
    }

    saveInFlightRef.current = true;

    try {
      setSaving(true);
      setError(null);
      setSaveValidationIssues([]);
      setSaveSuccess(false);

      const updatedPreferences = await updateUserPreferences({
        interests: selectedInterests,
        vibe: vibe[0],
        districts: selectedDistricts,
        budget: selectedBudget,
        favoriteActivities: selectedActivities,
        companionTypes: selectedCompanionTypes,
      });

      setPreferences(updatedPreferences);
      setSaveSuccess(true);
    } catch (err) {
      setSaveSuccess(false);
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
      setProfile(null);
      setPreferences(null);
    } finally {
      signOutInFlightRef.current = false;
    }
  };

  const refreshProfile = async () => {
    await fetchProfileData();
  };

  const handleSetVibe = (value: number[]) => {
    clearSaveFeedback();
    setVibe([normalizeVibe(value?.[0])]);
  };

  const handleSetSelectedBudget = (budget: PriceLevel) => {
    clearSaveFeedback();
    setSelectedBudget(budget);
  };

  return {
    profile,
    preferences,
    loading,
    saving,
    error,
    saveSuccess,
    saveValidationIssues,
    selectedInterests,
    vibe,
    selectedDistricts,
    selectedBudget,
    selectedActivities,
    selectedCompanionTypes,
    toggleInterest,
    setVibe: handleSetVibe,
    toggleDistrict,
    setSelectedBudget: handleSetSelectedBudget,
    toggleActivity,
    toggleCompanionType,
    savePreferences,
    handleSignOut,
    refreshProfile,
  };
};
