/**
 * Onboarding Service
 * Handles API calls for user onboarding and preference submission
 */

// import axiosInstance from "../../config/axios.config";

/**
 * User onboarding preferences data structure
 */
export interface OnboardingPreferences {
  interests: string[];
  vibe: number;
  districts: string[];
  budget: "Low" | "Medium" | "High" | null;
}

/**
 * Submit user onboarding preferences
 * @param userId - The user ID
 * @param preferences - User preferences from onboarding flow
 * TODO: Implement actual API call when backend is ready
 */
export const submitOnboardingPreferences = async (
  userId: number,
  preferences: OnboardingPreferences,
): Promise<void> => {
  try {
    // TODO: Uncomment when backend API is ready
    // await axiosInstance.post(`/users/${userId}/preferences`, {
    //   interests: preferences.interests,
    //   vibe: preferences.vibe,
    //   preferredDistricts: preferences.districts,
    //   budgetRange: preferences.budget?.toLowerCase(),
    // });

    // Mock implementation - simulate API delay
    console.log("Submitting preferences for user:", userId, preferences);
    return new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Error submitting onboarding preferences:", error);
    throw new Error("Failed to submit preferences");
  }
};

/**
 * Update user preferences (can be called after initial onboarding)
 * @param userId - The user ID
 * @param preferences - Updated preferences
 * TODO: Implement actual API call when backend is ready
 */
export const updateUserPreferences = async (
  userId: number,
  preferences: Partial<OnboardingPreferences>,
): Promise<void> => {
  try {
    // TODO: Uncomment when backend API is ready
    // await axiosInstance.patch(`/users/${userId}/preferences`, preferences);

    // Mock implementation
    console.log("Updating preferences for user:", userId, preferences);
    return Promise.resolve();
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw new Error("Failed to update preferences");
  }
};
