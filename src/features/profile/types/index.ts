/**
 * Profile Feature — Type Definitions
 */

export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface UserPreferences {
  interests: string[];
  vibe: number;
  districts: string[];
  budget: "Low" | "Medium" | "High";
}

export interface UpdatePreferencesRequest {
  interests?: string[];
  vibe?: number;
  districts?: string[];
  budget?: "Low" | "Medium" | "High";
}
