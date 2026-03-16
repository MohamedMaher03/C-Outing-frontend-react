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
  HomeRecommendationsQuery,
  SimilarRecommendationsParams,
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

const sortByPersonalized = (list: HomePlace[]) =>
  [...list].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

const withCount = (
  list: HomePlace[],
  count: number | undefined,
  fallback: number,
) => list.slice(0, count ?? fallback);

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
  async fetchHomePageData(params?: HomeRecommendationsQuery): Promise<HomePageData> {
    await delay(800);
    console.log(`[Mock] Fetching home page data`);

    const all: HomePlace[] = normalizedPlaces();

    // Curated = personalized — sorted by matchScore (proxy for recommendation rank)
    const curatedPlaces = withCount(sortByPersonalized(all), params?.count, 10);

    // Trending = global — same for every user
    const trendingPlaces = withCount(
      [...all].sort((a, b) => b.reviewCount - a.reviewCount),
      params?.count,
      10,
    );

    return { curatedPlaces, trendingPlaces };
  },

  async fetchPersonalizedRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    await delay(450);
    console.log(
      `[Mock] Fetching personalized recommendations (count: ${params?.count ?? 10})`,
    );
    return withCount(sortByPersonalized(normalizedPlaces()), params?.count, 10);
  },

  async fetchTrendingRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    await delay(450);
    console.log(
      `[Mock] Fetching trending recommendations (count: ${params?.count ?? 10})`,
    );
    return withCount(
      [...normalizedPlaces()].sort((a, b) => b.reviewCount - a.reviewCount),
      params?.count,
      10,
    );
  },

  async fetchSimilarRecommendations(
    params: SimilarRecommendationsParams,
  ): Promise<HomePlace[]> {
    await delay(550);
    console.log(
      `[Mock] Fetching similar recommendations for venue: ${params.venueId} (count: ${params.count ?? 5})`,
    );

    const all = normalizedPlaces();
    const seed = all.find((place) => place.id === params.venueId);
    if (!seed) return [];

    const scored = all
      .filter((place) => place.id !== seed.id)
      .map((place) => {
        const sharedTags = (place.atmosphereTags ?? []).filter((tag) =>
          (seed.atmosphereTags ?? []).includes(tag),
        ).length;

        const categoryScore = place.category === seed.category ? 30 : 0;
        const priceScore = place.priceLevel === seed.priceLevel ? 20 : 0;
        const tagScore = sharedTags * 10;
        const qualityScore = place.rating * 5;

        return {
          place,
          score: categoryScore + priceScore + tagScore + qualityScore,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.place);

    return withCount(scored, params.count, 5);
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
