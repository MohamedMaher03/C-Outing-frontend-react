import { POPULAR_DISTRICTS, CATEGORIES } from "@/mocks/mockData";
import { VENUE_PRICE_RANGE_OPTIONS } from "@/features/home/mocks";
import type { FilterType } from "@/features/home/types";
import { PRICE_LEVEL_VALUES } from "@/utils/priceLevels";
import { getTranslatedText } from "@/utils/helpers";
import {
  HOME_QUICK_FILTER_QUERY_KEY,
  parseHomeQuickFilters,
} from "@/features/home/utils/filters";
import { buildVenueSearchParams } from "@/features/home/utils/domainHelpers";

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
) => string;

export interface SelectOption {
  value: string;
  label: string;
}

export const HOME_SEARCH_QUICK_FILTER_KEY = HOME_QUICK_FILTER_QUERY_KEY;

export const buildDistrictSelectOptions = (t: TranslateFn): SelectOption[] =>
  POPULAR_DISTRICTS.map((district) => ({
    value: district.name,
    label: getTranslatedText(district.nameKey, district.name, t),
  }));

export const buildCategorySelectOptions = (t: TranslateFn): SelectOption[] =>
  CATEGORIES.map((category) => ({
    value: category.id,
    label: getTranslatedText(category.nameKey, category.label, t),
  }));

export const buildPriceBandSelectOptions = (t: TranslateFn): SelectOption[] =>
  VENUE_PRICE_RANGE_OPTIONS.map((option) => ({
    value: String(PRICE_LEVEL_VALUES.indexOf(option.id) + 1),
    label: t(`budget.${option.id}`, undefined, option.label),
  }));

export const buildMinRatingSelectOptions = (t: TranslateFn): SelectOption[] => [
  { value: "", label: t("home.search.filter.anyOption", undefined, "Any") },
  { value: "4", label: t("home.search.filter.minRatingOption4", undefined, "4.0+") },
  { value: "4.5", label: t("home.search.filter.minRatingOption45", undefined, "4.5+") },
];

export const cycleQuickFilterSelection = (
  filter: FilterType,
  activeFilters: FilterType[],
): FilterType[] =>
  filter === "all"
    ? []
    : activeFilters.includes(filter)
      ? activeFilters.filter((item) => item !== filter)
      : [...activeFilters, filter];

export const composeSearchUrlParams = (
  fields: Record<string, string | undefined>,
): URLSearchParams => buildVenueSearchParams(fields);

export const readQuickFiltersFromParam = (raw: string): FilterType[] =>
  parseHomeQuickFilters(raw);
