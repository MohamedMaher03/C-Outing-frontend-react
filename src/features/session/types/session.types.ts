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
  memberVotes?: Record<string, string>;
  winningVenueId?: string | null;
}

export type SessionStatus =
  | "idle"
  | "creating"
  | "joining"
  | "waiting"
  | "loading-recs"
  | "ready"
  | "ended";

export interface SessionVoteOption {
  venueId: string;
  votes: number;
}

export interface SessionVotes {
  code: string;
  totalMembers: number;
  submittedVotes: number;
  options: SessionVoteOption[];
  winningVenueId: string | null;
}

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
