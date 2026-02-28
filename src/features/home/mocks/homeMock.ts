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
import type { HomePageData } from "../types";

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
  async fetchHomePageData(userId: number): Promise<HomePageData> {
    await delay(800);
    console.log(`[Mock] Fetching home page data for user ${userId}`);

    const all = PLACES.map((p) => ({ ...p, isSaved: false }));

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
};
