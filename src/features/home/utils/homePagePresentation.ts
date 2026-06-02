import type { LucideIcon } from "lucide-react";
import { authService } from "@/features/auth";
import type {
  DiscoverySource,
  HomePlace,
  VenuePriceRange,
} from "@/features/home/types";
import type {
  DISCOVERY_SOURCE_OPTIONS,
  FILTER_OPTIONS,
  VENUE_PRICE_RANGE_OPTIONS,
} from "@/features/home/mocks";
import type { CATEGORIES } from "@/mocks/mockData";
import { getTranslatedText } from "@/utils/helpers";
import {
  buildHeroContainerVariants,
  buildHeroItemVariants,
  buildStateTransition,
  buildStaggeredCardDelay,
  EASE_OUT_EXPO,
  EASE_OUT_QUART,
} from "@/features/home/utils/motionVariants";

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
) => string;

export interface LocalizedFilterChip {
  id: (typeof FILTER_OPTIONS)[number]["id"];
  label: string;
  icon: LucideIcon;
}

export interface LocalizedDiscoveryChip {
  id: (typeof DISCOVERY_SOURCE_OPTIONS)[number]["id"];
  label: string;
  icon: LucideIcon;
}

export interface LocalizedPriceBand {
  id: VenuePriceRange;
  label: string;
  caption: string;
}

export interface VenueTypeChip {
  id: string;
  label: string;
}

export interface HomeMotionBundle {
  stateTransition: ReturnType<typeof buildStateTransition>;
  heroContainerVariants: ReturnType<typeof buildHeroContainerVariants>;
  heroItemVariants: ReturnType<typeof buildHeroItemVariants>;
  cardDelay: (index: number, base?: number) => number;
  pageFadeDuration: number;
  heroImageScaleFrom: number;
  heroImageDuration: number;
  easeOutQuart: typeof EASE_OUT_QUART;
  easeOutExpo: typeof EASE_OUT_EXPO;
}

export const localizeQuickFilterChips = (
  t: TranslateFn,
  options: typeof FILTER_OPTIONS,
): LocalizedFilterChip[] =>
  options.map((filter) => ({
    ...filter,
    label: t(`home.filter.${filter.id}`, undefined, filter.label),
  }));

export const localizeDiscoverySourceChips = (
  t: TranslateFn,
  options: typeof DISCOVERY_SOURCE_OPTIONS,
): LocalizedDiscoveryChip[] =>
  options.map((source) => ({
    ...source,
    label: t(`home.discovery.source.${source.id}`, undefined, source.label),
  }));

export const localizeVenuePriceBands = (
  t: TranslateFn,
  options: typeof VENUE_PRICE_RANGE_OPTIONS,
): LocalizedPriceBand[] =>
  options.map((option) => ({
    ...option,
    label: t(`budget.${option.id}`, undefined, option.label),
    caption: t(`home.price.caption.${option.id}`, undefined, option.caption),
  }));

export const projectCategoryLabels = (
  categories: typeof CATEGORIES,
  t: TranslateFn,
): VenueTypeChip[] =>
  categories.map((category) => ({
    id: category.id,
    label: getTranslatedText(category.nameKey, category.label, t),
  }));

export const isQuickFilterActive = (
  filterId: (typeof FILTER_OPTIONS)[number]["id"],
  activeFilters: string[],
): boolean =>
  filterId === "all" ? activeFilters.length === 0 : activeFilters.includes(filterId);

export const resolveDiscoveryLoadingGate = (
  isDiscoveryLoading: boolean,
  activeSource: DiscoverySource,
  isGlobalTopRatedLoading: boolean,
  isTopRatedInAreaLoading: boolean,
): boolean =>
  isDiscoveryLoading ||
  (activeSource === "top-rated" && isGlobalTopRatedLoading) ||
  (activeSource === "top-rated-area" && isTopRatedInAreaLoading);

export const flipOptionalSelection = <T>(
  current: T | null,
  candidate: T,
): T | null => (current === candidate ? null : candidate);

export const composeVenueSearchRoute = (rawQuery: string): string | null => {
  const trimmed = rawQuery.trim();
  return trimmed ? `/home/search?q=${encodeURIComponent(trimmed)}` : null;
};

export const launchVenueDetailTab = (venueId: string): void => {
  authService.promoteSessionForNewTab();
  window.open(`/venue/${venueId}`, "_blank", "noopener,noreferrer");
};

export const resolveMoodTranslation = (
  t: TranslateFn,
  moodId: string,
  slot: "label" | "description",
  fallback: string,
): string => t(`home.mood.${moodId}.${slot}`, undefined, fallback);

export const resolveQuickSeedVenueStrip = (
  hasManualSeed: boolean,
  manualPool: HomePlace[],
  curatedPool: HomePlace[],
  limit = 6,
): HomePlace[] =>
  (hasManualSeed ? manualPool : curatedPool.slice(0, limit)).slice(0, limit);

export const assembleHomeMotionBundle = (
  prefersReducedMotion: boolean,
): HomeMotionBundle => ({
  stateTransition: buildStateTransition(prefersReducedMotion),
  heroContainerVariants: buildHeroContainerVariants(prefersReducedMotion),
  heroItemVariants: buildHeroItemVariants(prefersReducedMotion),
  cardDelay: (index, base = 0) =>
    buildStaggeredCardDelay(index, prefersReducedMotion, base),
  pageFadeDuration: prefersReducedMotion ? 0.01 : 0.32,
  heroImageScaleFrom: prefersReducedMotion ? 1 : 1.06,
  heroImageDuration: prefersReducedMotion ? 0.01 : 0.85,
  easeOutQuart: EASE_OUT_QUART,
  easeOutExpo: EASE_OUT_EXPO,
});
