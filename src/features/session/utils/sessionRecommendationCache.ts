import {
  DEFAULT_RECOMMENDATION_COUNT,
  RECOMMENDATION_COUNT_OPTIONS,
  type RecommendationCount,
  type SessionRecommendation,
} from "../types/session.types";
import { normalizeSessionCode } from "./sessionCode";

const recsStorageKey = (code: string, count: RecommendationCount): string =>
  `session-recs:${normalizeSessionCode(code)}:${count}`;

const countMetaStorageKey = (code: string): string =>
  `session-rec-count:${normalizeSessionCode(code)}`;

const isRecommendationCount = (value: number): value is RecommendationCount =>
  (RECOMMENDATION_COUNT_OPTIONS as readonly number[]).includes(value);

export const persistSessionRecommendations = (
  code: string,
  count: RecommendationCount,
  recommendations: SessionRecommendation[],
): void => {
  try {
    sessionStorage.setItem(
      recsStorageKey(code, count),
      JSON.stringify(recommendations),
    );
    sessionStorage.setItem(countMetaStorageKey(code), String(count));
  } catch {
    return;
  }
};

export const readSessionRecommendations = (
  code: string,
  count: RecommendationCount,
): SessionRecommendation[] | null => {
  try {
    const cached = sessionStorage.getItem(recsStorageKey(code, count));
    if (!cached) return null;
    const parsed: unknown = JSON.parse(cached);
    return Array.isArray(parsed) ? (parsed as SessionRecommendation[]) : null;
  } catch {
    return null;
  }
};

export const readPersistedRecommendationCount = (
  code: string,
): RecommendationCount => {
  try {
    const stored = sessionStorage.getItem(countMetaStorageKey(code));
    const parsed = Number(stored);
    return isRecommendationCount(parsed)
      ? parsed
      : DEFAULT_RECOMMENDATION_COUNT;
  } catch {
    return DEFAULT_RECOMMENDATION_COUNT;
  }
};

export const purgeSessionRecommendationCache = (code: string): void => {
  try {
    RECOMMENDATION_COUNT_OPTIONS.forEach((count) => {
      sessionStorage.removeItem(recsStorageKey(code, count));
    });
    sessionStorage.removeItem(countMetaStorageKey(code));
  } catch {
    return;
  }
};
