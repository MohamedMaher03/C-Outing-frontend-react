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

export const homeMock = {
  async fetchHomePageData(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePageData> {
    await delay(800);

    const all: HomePlace[] = normalizedPlaces();

    const curatedPlaces = withCount(sortByPersonalized(all), params?.count, 10);

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
    return withCount(sortByPersonalized(normalizedPlaces()), params?.count, 10);
  },

  async fetchTrendingRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    await delay(450);
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

  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    await delay(1400);
    void placeId;
    void isSaved;
  },

  async fetchPlacesByMood(moodId: string): Promise<HomePlace[]> {
    await delay(2500);
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
    return sortByTopRated(byDistrict(params.district));
  },

  async fetchVenuesByType(params: VenueByTypeParams): Promise<HomePlace[]> {
    await delay(700);
    return sortByTopRated(byType(params.type));
  },

  async fetchVenuesByPriceRange(
    params: VenueByPriceRangeParams,
  ): Promise<HomePlace[]> {
    await delay(700);
    return sortByTopRated(byPriceRange(params.priceRange));
  },

  async fetchVenueTopRated(): Promise<HomePlace[]> {
    await delay(600);
    return sortByTopRated(normalizedPlaces()).slice(0, 8);
  },

  async fetchVenueTopRatedInArea(
    params: VenueTopRatedInAreaParams,
  ): Promise<HomePlace[]> {
    await delay(650);
    return sortByTopRated(byDistrict(params.area)).slice(0, 8);
  },
};
