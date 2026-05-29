export interface SessionMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Session {
  code: string;
  host: SessionMember;
  members: SessionMember[];
  createdAt: string;
  status: "waiting" | "ready";
}

export type SessionStatus =
  | "idle" // here i use this stats when no active session
  | "creating" //use whem POST /Session in-flight
  | "joining" //use when POST /Session/{code}/join in-flight
  | "waiting" //use when Session joined, waiting for host to trigger recommendations
  | "loading-recs" //use when GET /Session/{code}/recommend in-flight
  | "ready"; //this used when recommendations received

export const RECOMMENDATION_COUNT_OPTIONS = [10, 20, 30] as const;
export type RecommendationCount = (typeof RECOMMENDATION_COUNT_OPTIONS)[number];
export const DEFAULT_RECOMMENDATION_COUNT: RecommendationCount = 10;

export interface SessionRecommendation {
  id: string;
  name: string;
  address: string;
  category?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  priceRange?: string | null;
  atmosphereTags?: string[];
}
