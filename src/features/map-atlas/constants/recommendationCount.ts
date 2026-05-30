export const MAP_ATLAS_RECOMMENDATION_COUNT_OPTIONS = [10, 20, 30] as const;

export type MapAtlasRecommendationCount =
  (typeof MAP_ATLAS_RECOMMENDATION_COUNT_OPTIONS)[number];

export const DEFAULT_MAP_ATLAS_RECOMMENDATION_COUNT: MapAtlasRecommendationCount = 10;

export const isMapAtlasRecommendationCount = (
  value: number,
): value is MapAtlasRecommendationCount =>
  MAP_ATLAS_RECOMMENDATION_COUNT_OPTIONS.includes(
    value as MapAtlasRecommendationCount,
  );
