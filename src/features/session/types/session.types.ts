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
}

export type SessionStatus =
  | "idle"          // No active session
  | "creating"      // POST /Session in-flight
  | "joining"       // POST /Session/{code}/join in-flight
  | "waiting"       // Session joined, waiting for host to trigger recommendations
  | "loading-recs"  // GET /Session/{code}/recommend in-flight
  | "ready";        // Recommendations received

export interface SessionRecommendation {
  id: string;
  name: string;
  address: string;
  category: string;
  imageUrl?: string;
  rating?: number;
  priceRange?: string;
  atmosphereTags?: string[];
}
