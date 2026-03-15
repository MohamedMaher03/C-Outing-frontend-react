/**
 * Home Mock Implementations
 *
 * Drop-in replacement for homeApi — mirrors the same interface so it can be
 * swapped in homeService.ts without changing any other code:
 *
 *   // homeService.ts — swap this one line:
 *   import { homeMock as homeApi } from "../mocks/homeMock";
 *
 * Simulates realistic network latency so the UI can be fully developed
 * and tested without a running backend.
 */

import { PLACES } from "@/mocks/mockData";
import type { HomePageData, HomePlace } from "../types";

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Maps each mood ID to a predicate that decides whether a Place fits.
 *
 * Logic mirrors what the backend GNN/recommendation engine would apply:
 *   chill     → serene / quiet atmospheres
 *   adventure → outdoor / activity-heavy places
 *   romantic  → places tagged Romantic or Upscale
 *   social    → lively, group-friendly spots
 *   explore   → cultural, historic, artistic, or trendy spots
 *   foodie    → food & drink category venues
 */
const MOOD_FILTER_MAP: Record<string, (p: HomePlace) => boolean> = {
  chill: (p) =>
    (p.atmosphereTags ?? []).some((t) =>
      ["Quiet", "Serene", "Relaxed", "Peaceful", "Scenic"].includes(t),
    ),
  adventure: (p) =>
    (p.atmosphereTags ?? []).some((t) =>
      ["Outdoor", "Exciting", "Adventure", "Vibrant"].includes(t),
    ) || p.category.toLowerCase().includes("activities"),
  romantic: (p) =>
    (p.atmosphereTags ?? []).some((t) =>
      ["Romantic", "Upscale", "Nile View"].includes(t),
    ),
  social: (p) =>
    (p.atmosphereTags ?? []).some((t) =>
      ["Lively", "Bustling", "Community", "Vibrant", "Musical"].includes(t),
    ),
  explore: (p) =>
    (p.atmosphereTags ?? []).some((t) =>
      ["Historic", "Artistic", "Cultural", "Local", "Trendy"].includes(t),
    ),
  foodie: (p) =>
    p.category.toLowerCase().includes("food") ||
    p.category.toLowerCase().includes("restaurant") ||
    p.category.toLowerCase().includes("cafe"),
};

// ── Mock Home API ────────────────────────────────────────────
// Interface intentionally mirrors homeApi so they are interchangeable.

export const homeMock = {
  /**
   * Mock GET /recommendations/:userId  (curated)
   * Mock GET /venues/trending
   * Mock GET /venues/top-rated
   *
   * userId is accepted so the mock interface matches the real API.
   * In production the backend sorts by the user's preference vector;
   * here we approximate with matchScore as a stand-in.
   */
  async fetchHomePageData(userId: string): Promise<HomePageData> {
    await delay(800);
    console.log(`[Mock] Fetching home page data for user ${userId}`);

    const all: HomePlace[] = PLACES.map((p) => ({ ...p, isSaved: false }));

    // Curated = personalized — sorted by matchScore (proxy for recommendation rank)
    const curatedPlaces = [...all]
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
      .slice(0, 5);

    // Trending = global — same for every user
    const trendingPlaces = [...all]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 6);

    // Top-rated = global — same for every user
    const topRatedPlaces = [...all].sort((a, b) => b.rating - a.rating);

    return { curatedPlaces, trendingPlaces, topRatedPlaces };
  },

  /**
   * Mock POST /venues/:placeId/save
   * Always succeeds after a short delay.
   */
  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    await delay(200);
    console.log(`[Mock] Toggle save for place ${placeId}:`, isSaved);
  },

  /**
   * Mock GET /venues/mood/:moodId
   * Filters PLACES using MOOD_FILTER_MAP and returns matches.
   * Sorted by rating (desc) so the best picks always surface first.
   */
  async fetchPlacesByMood(moodId: string): Promise<HomePlace[]> {
    await delay(2500);
    console.log(`[Mock] Fetching places for mood: ${moodId}`);
    const filter = MOOD_FILTER_MAP[moodId];
    if (!filter) return [];
    return [...PLACES]
      .filter(filter)
      .sort((a, b) => b.rating - a.rating)
      .map((p) => ({ ...p, isSaved: false }));
  },
};
