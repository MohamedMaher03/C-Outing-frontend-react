/**
 * Core TypeScript types and interfaces for HCARS Frontend
 * Aligns with backend entities and API contracts
 */

// ============ User Types ============
export interface User {
  userId: number;
  name: string;
  email: string;
  age: number;
  preferences: number[]; // Preference vector (e.g., [0.8, 0.5])
  lastUpdated: Date;
  totalInteractions: number;
}

export interface UserPreferences {
  userId: number;
  budgetRange: "low" | "medium" | "high";
  preferredCategories: string[];
  avoidCategories: string[];
  language: "ar" | "en";
}

export interface AuthResponse {
  userId: number;
  token: string;
  user: User;
}

// ============ Venue Types ============
export interface Venue {
  venueId: number;
  name: string;
  description: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
  };
  attributes: Record<string, unknown>; // e.g., {budget: 'medium', capacity: 100}
  avgSentimentScore: number; // 0-1
  featuresVector: number[];
  phoneNumber?: string;
  website?: string;
  hours?: {
    open: string;
    close: string;
  };
  images?: string[];
}

export interface VenueDetails extends Venue {
  reviews?: Review[];
  rating?: number;
  reviewCount?: number;
}

// ============ Interaction Types ============
export interface Interaction {
  interactionId?: number;
  userId: number;
  venueId: number;
  actionType: "Click" | "ViewDetails" | "Rate" | "Favorite" | "Share";
  ratingValue?: number;
  comment?: string;
  timestamp: Date;
  sessionId: string;
  positionInList: number;
  context: Record<string, unknown>; // e.g., {companion: 'friends', mood: 'relaxed'}
}

// ============ Session Types ============
export interface Session {
  sessionId: string; // GUID
  userId: number;
  startTime: Date;
  endTime?: Date;
}

// ============ Review Types ============
export interface Review {
  reviewId: number;
  venueId: number;
  userId: number;
  rating: number;
  comment: string;
  sentiment: number; // 0-1 (Arabic sentiment score)
  timestamp: Date;
}

// ============ Context/Intent Types ============
export interface UserContext {
  mood?: "relaxed" | "energetic" | "social" | "romantic";
  companion?: "solo" | "friends" | "family" | "partner";
  budget?: "low" | "medium" | "high";
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  weather?: "sunny" | "cloudy" | "rainy" | "hot";
  location?: {
    lat: number;
    lng: number;
  };
}

// ============ Recommendation Types ============
export interface RecommendationRequest {
  userId: number;
  context: UserContext;
  limit?: number;
  offset?: number;
}

export interface RecommendationResponse {
  recommendations: Venue[];
  context: UserContext;
  timestamp: Date;
  totalCount: number;
}

// ============ API Response Wrapper ============

/**
 * Standard backend envelope for ALL API responses.
 *
 * Success shape:  { success: true,  data: T,    message: "OK" }
 * Error shape:    { success: false, data: null, message: "...", errorCode: "..." }
 *
 * The axiosInstance response interceptor (src/config/axios.config.ts) unwraps
 * this automatically on success, so components always receive `T` directly.
 * On error the interceptor rejects with `ApiError` (src/utils/apiError.ts).
 */
export interface ApiResponse<T> {
  /** `true` on 2xx, `false` on any error. */
  success: boolean;
  /** The actual payload.  Typed as `T` on success, `null` on error. */
  data: T;
  /** Human-readable message from the server (success or error). */
  message: string;
  /** Pagination info or any extra metadata. */
  meta?: unknown;
  /** Machine-readable error code (e.g. "EMAIL_ALREADY_EXISTS"). */
  errorCode?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

// ============ Filter Types ============
export interface VenueFilter {
  category?: string;
  location?: string;
  budgetRange?: "low" | "medium" | "high";
  ratingMin?: number;
  sentimentMin?: number;
  searchQuery?: string;
  pageSize?: number;
  pageNumber?: number;
}

// ============ UI State Types ============
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
