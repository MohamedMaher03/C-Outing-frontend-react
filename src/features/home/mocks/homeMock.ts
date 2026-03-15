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
import type {
  HomePageData,
  HomePlace,
  VenueByDistrictParams,
  VenueByPriceRangeParams,
  VenueByTypeParams,
  VenueTopRatedInAreaParams,
} from "../types";

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const normalizedPlaces = (): HomePlace[] =>
  PLACES.map((p) => ({ ...p, isSaved: p.isSaved ?? false }));

const byDistrict = (district: string) => {
  const q = district.trim().toLowerCase();
  return normalizedPlaces().filter((p) => p.address.toLowerCase().includes(q));
};

const byType = (type: string) => {
  const q = type.trim().toLowerCase();
  return normalizedPlaces().filter((p) => p.category.toLowerCase().includes(q));
};

const byPriceRange = (priceRange: VenueByPriceRangeParams["priceRange"]) =>
  normalizedPlaces().filter((p) => p.priceLevel === priceRange);

const sortByTopRated = (list: HomePlace[]) =>
  [...list].sort(
    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  );

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
   *
   * userId is accepted so the mock interface matches the real API.
   * In production the backend sorts by the user's preference vector;
   * here we approximate with matchScore as a stand-in.
   */
  async fetchHomePageData(userId: string): Promise<HomePageData> {
    await delay(800);
    console.log(`[Mock] Fetching home page data for user ${userId}`);

    const all: HomePlace[] = normalizedPlaces();

    // Curated = personalized — sorted by matchScore (proxy for recommendation rank)
    const curatedPlaces = [...all]
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
      .slice(0, 5);

    // Trending = global — same for every user
    const trendingPlaces = [...all]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 6);

    return { curatedPlaces, trendingPlaces };
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
      .map((p) => ({ ...p, isSaved: p.isSaved ?? false }));
  },

  async fetchVenuesByDistrict(
    params: VenueByDistrictParams,
  ): Promise<HomePlace[]> {
    await delay(700);
    console.log(`[Mock] Fetching venues in district: ${params.district}`);
    return sortByTopRated(byDistrict(params.district));
  },

  async fetchVenuesByType(params: VenueByTypeParams): Promise<HomePlace[]> {
    await delay(700);
    console.log(`[Mock] Fetching venues by type: ${params.type}`);
    return sortByTopRated(byType(params.type));
  },

  async fetchVenuesByPriceRange(
    params: VenueByPriceRangeParams,
  ): Promise<HomePlace[]> {
    await delay(700);
    console.log(`[Mock] Fetching venues by price range: ${params.priceRange}`);
    return sortByTopRated(byPriceRange(params.priceRange));
  },

  async fetchVenueTopRated(): Promise<HomePlace[]> {
    await delay(600);
    console.log("[Mock] Fetching top-rated venues");
    return sortByTopRated(normalizedPlaces()).slice(0, 8);
  },

  async fetchVenueTopRatedInArea(
    params: VenueTopRatedInAreaParams,
  ): Promise<HomePlace[]> {
    await delay(650);
    console.log(`[Mock] Fetching top-rated venues in area: ${params.area}`);
    return sortByTopRated(byDistrict(params.area)).slice(0, 8);
  },
};
