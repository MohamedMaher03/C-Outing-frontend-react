import { PLACES } from "@/mocks/mockData";
import type {
  HomePlace,
  HomeRecommendationsQuery,
  HomeSearchQuery,
  SimilarRecommendationsParams,
  VenueByDistrictParams,
  VenueByPriceRangeParams,
  VenueByTypeParams,
  VenueTopRatedInAreaParams,
} from "../types";
import type { PaginatedResponse } from "@/types";
import { normalizeSearchTerm } from "@/utils/textNormalization";

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

const buildPaginatedResponse = (
  items: HomePlace[],
  pageIndex: number,
  pageSize: number,
): PaginatedResponse<HomePlace> => {
  const totalCount = items.length;
  const normalizedPageSize = Math.max(1, Math.trunc(pageSize));
  const totalPages = Math.max(1, Math.ceil(totalCount / normalizedPageSize));
  const normalizedPageIndex = Math.min(
    Math.max(1, Math.trunc(pageIndex)),
    totalPages,
  );
  const start = (normalizedPageIndex - 1) * normalizedPageSize;
  const end = start + normalizedPageSize;

  return {
    items: items.slice(start, end),
    pageIndex: normalizedPageIndex,
    pageSize: normalizedPageSize,
    totalCount,
    totalPages,
    hasPreviousPage: normalizedPageIndex > 1,
    hasNextPage: normalizedPageIndex < totalPages,
  };
};

export const homeMock = {
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

  async fetchMoodRecommendations(
    moodId?: string,
    count?: number,
  ): Promise<HomePlace[]> {
    await delay(2500);
    void moodId;
    return withCount(normalizedPlaces(), count, 10);
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

  async searchVenues(
    params: HomeSearchQuery,
  ): Promise<PaginatedResponse<HomePlace>> {
    await delay(650);

    const normalizedSearch = normalizeSearchTerm(params.searchTerm ?? "");
    const filtered = normalizedSearch
      ? normalizedPlaces().filter((place) => {
          const haystack = normalizeSearchTerm(
            `${place.name} ${place.address} ${place.category} ${(place.atmosphereTags ?? []).join(" ")}`,
          );
          return haystack.includes(normalizedSearch);
        })
      : normalizedPlaces();

    return buildPaginatedResponse(
      filtered,
      params.page ?? 1,
      params.pageSize ?? 20,
    );
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
