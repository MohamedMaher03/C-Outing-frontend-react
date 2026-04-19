import type {
  HomePageData,
  HomePlace,
  HomeRecommendationsQuery,
  SimilarRecommendationsParams,
  VenueByDistrictParams,
  VenueByPriceRangeParams,
  VenueByTypeParams,
  VenueTopRatedInAreaParams,
} from "@/features/home/types";
import {
  mapMapAtlasHomePageData,
  mapMapAtlasPlaces,
} from "@/features/map-atlas/mappers/mapAtlasMapper";
import { mapAtlasDataSource } from "@/features/map-atlas/services/mapAtlasDataSource";

const normalizeRecommendationCount = (
  count: number | undefined,
  fallback: number,
): number => {
  if (typeof count !== "number" || !Number.isFinite(count)) {
    return fallback;
  }

  return Math.max(1, Math.min(100, Math.floor(count)));
};

const normalizeStringParam = (value: string | undefined | null): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizePlaceId = (placeId: string): string => {
  const normalized = normalizeStringParam(placeId);
  if (!normalized) {
    throw new Error("Invalid place id");
  }

  return normalized;
};

export const fetchMapAtlasHomePageData = async (
  params?: HomeRecommendationsQuery,
): Promise<HomePageData> => {
  const data = await mapAtlasDataSource.fetchHomePageData({
    count: normalizeRecommendationCount(params?.count, 12),
  });

  return mapMapAtlasHomePageData(data);
};

export const fetchMapAtlasPersonalizedRecommendations = async (
  params?: HomeRecommendationsQuery,
): Promise<HomePlace[]> => {
  const places = await mapAtlasDataSource.fetchPersonalizedRecommendations({
    count: normalizeRecommendationCount(params?.count, 40),
  });

  return mapMapAtlasPlaces(places);
};

export const fetchMapAtlasTrendingRecommendations = async (
  params?: HomeRecommendationsQuery,
): Promise<HomePlace[]> => {
  const places = await mapAtlasDataSource.fetchTrendingRecommendations({
    count: normalizeRecommendationCount(params?.count, 40),
  });

  return mapMapAtlasPlaces(places);
};

export const fetchMapAtlasSimilarRecommendations = async (
  params: SimilarRecommendationsParams,
): Promise<HomePlace[]> => {
  const venueId = normalizeStringParam(params.venueId);
  if (!venueId) {
    return [];
  }

  const places = await mapAtlasDataSource.fetchSimilarRecommendations({
    venueId,
    count: normalizeRecommendationCount(params.count, 8),
  });

  return mapMapAtlasPlaces(places);
};

export const toggleMapAtlasPlaceSave = async (
  placeId: string,
  isSaved: boolean,
): Promise<void> => {
  await mapAtlasDataSource.togglePlaceSave(normalizePlaceId(placeId), isSaved);
};

export const fetchMapAtlasPlacesByMood = async (
  moodId: string,
): Promise<HomePlace[]> => {
  const normalizedMoodId = normalizeStringParam(moodId);
  if (!normalizedMoodId) {
    return [];
  }

  const places = await mapAtlasDataSource.fetchPlacesByMood(normalizedMoodId);
  return mapMapAtlasPlaces(places);
};

export const fetchMapAtlasVenuesByDistrict = async (
  params: VenueByDistrictParams,
): Promise<HomePlace[]> => {
  const district = normalizeStringParam(params.district);
  if (!district) {
    return [];
  }

  const places = await mapAtlasDataSource.fetchVenuesByDistrict({ district });
  return mapMapAtlasPlaces(places);
};

export const fetchMapAtlasVenuesByType = async (
  params: VenueByTypeParams,
): Promise<HomePlace[]> => {
  const type = normalizeStringParam(params.type);
  if (!type) {
    return [];
  }

  const places = await mapAtlasDataSource.fetchVenuesByType({ type });
  return mapMapAtlasPlaces(places);
};

export const fetchMapAtlasVenuesByPriceRange = async (
  params: VenueByPriceRangeParams,
): Promise<HomePlace[]> => {
  const places = await mapAtlasDataSource.fetchVenuesByPriceRange(params);
  return mapMapAtlasPlaces(places);
};

export const fetchMapAtlasVenueTopRated = async (): Promise<HomePlace[]> => {
  const places = await mapAtlasDataSource.fetchVenueTopRated();
  return mapMapAtlasPlaces(places);
};

export const fetchMapAtlasVenueTopRatedInArea = async (
  params: VenueTopRatedInAreaParams,
): Promise<HomePlace[]> => {
  const area = normalizeStringParam(params.area);
  if (!area) {
    return [];
  }

  const places = await mapAtlasDataSource.fetchVenueTopRatedInArea({ area });
  return mapMapAtlasPlaces(places);
};

export const mapAtlasService = {
  fetchHomePageData: fetchMapAtlasHomePageData,
  fetchPersonalizedRecommendations: fetchMapAtlasPersonalizedRecommendations,
  fetchTrendingRecommendations: fetchMapAtlasTrendingRecommendations,
  fetchSimilarRecommendations: fetchMapAtlasSimilarRecommendations,
  togglePlaceSave: toggleMapAtlasPlaceSave,
  fetchPlacesByMood: fetchMapAtlasPlacesByMood,
  fetchVenuesByDistrict: fetchMapAtlasVenuesByDistrict,
  fetchVenuesByType: fetchMapAtlasVenuesByType,
  fetchVenuesByPriceRange: fetchMapAtlasVenuesByPriceRange,
  fetchVenueTopRated: fetchMapAtlasVenueTopRated,
  fetchVenueTopRatedInArea: fetchMapAtlasVenueTopRatedInArea,
};
