import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useHomeSearch } from "@/features/home/hooks/useHomeSearch";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import { filterHomePlacesByQuickFilters } from "@/features/home/utils/filters";
import { safeParsePositiveInt } from "@/features/home/utils/domainHelpers";
import {
  buildCategorySelectOptions,
  buildDistrictSelectOptions,
  buildMinRatingSelectOptions,
  buildPriceBandSelectOptions,
  cycleQuickFilterSelection,
  composeSearchUrlParams,
  readQuickFiltersFromParam,
  HOME_SEARCH_QUICK_FILTER_KEY,
} from "@/features/home/utils/homeSearchPresentation";
import type { FilterType } from "@/features/home/types";
import { normalizeSearchTerm } from "@/utils/textNormalization";

export const useHomeSearchPage = () => {
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const userLocation = useUserLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get("q") ?? "";
  const districtParam = searchParams.get("district") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const priceRangeParam = searchParams.get("priceRange") ?? "";
  const minRatingParam = searchParams.get("minRating") ?? "";
  const filtersParam = searchParams.get(HOME_SEARCH_QUICK_FILTER_KEY) ?? "";

  const normalizedSearch = useMemo(
    () => normalizeSearchTerm(searchParam),
    [searchParam],
  );

  const selectedFilters = useMemo(
    () => readQuickFiltersFromParam(filtersParam),
    [filtersParam],
  );

  const [searchInput, setSearchInput] = useState(searchParam);
  const [districtInput, setDistrictInput] = useState(districtParam);
  const [typeInput, setTypeInput] = useState(typeParam);
  const [categoryInput, setCategoryInput] = useState(categoryParam);
  const [priceRangeInput, setPriceRangeInput] = useState(priceRangeParam);
  const [minRatingInput, setMinRatingInput] = useState(minRatingParam);

  const districtOptions = useMemo(() => buildDistrictSelectOptions(t), [t]);
  const categorySelectOptions = useMemo(() => buildCategorySelectOptions(t), [t]);
  const priceRangeOptions = useMemo(() => buildPriceBandSelectOptions(t), [t]);
  const minRatingOptions = useMemo(() => buildMinRatingSelectOptions(t), [t]);

  const {
    places,
    isLoading,
    error,
    saveError,
    clearSaveError,
    pageIndex,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    retryFetch,
    toggleSave,
    isSavePending,
  } = useHomeSearch({
    searchTerm: searchParam,
    district: districtParam,
    type: typeParam,
    category: categoryParam,
    priceRange: safeParsePositiveInt(priceRangeParam),
    minRating: safeParsePositiveInt(minRatingParam),
  });

  const pushSearchParams = useCallback(
    (overrides?: Partial<Record<string, string>>) => {
      const nextParams = composeSearchUrlParams({
        q: overrides?.q ?? searchInput,
        district: overrides?.district ?? districtInput,
        type: overrides?.type ?? typeInput,
        category: overrides?.category ?? categoryInput,
        priceRange: overrides?.priceRange ?? priceRangeInput,
        minRating: overrides?.minRating ?? minRatingInput,
        [HOME_SEARCH_QUICK_FILTER_KEY]:
          overrides?.[HOME_SEARCH_QUICK_FILTER_KEY] ?? filtersParam,
      });
      setPageIndex(1);
      setSearchParams(nextParams);
    },
    [
      searchInput,
      districtInput,
      typeInput,
      categoryInput,
      priceRangeInput,
      minRatingInput,
      filtersParam,
      setPageIndex,
      setSearchParams,
    ],
  );

  const commitSearchForm = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      pushSearchParams();
    },
    [pushSearchParams],
  );

  const toggleQuickFilter = useCallback(
    (filter: FilterType) => {
      const nextFilters = cycleQuickFilterSelection(filter, selectedFilters);
      pushSearchParams({
        [HOME_SEARCH_QUICK_FILTER_KEY]: nextFilters.join(","),
      });
    },
    [selectedFilters, pushSearchParams],
  );

  const clearQuickFilters = useCallback(() => {
    pushSearchParams({ [HOME_SEARCH_QUICK_FILTER_KEY]: "" });
  }, [pushSearchParams]);

  const filteredPlaces = useMemo(
    () => filterHomePlacesByQuickFilters(places, selectedFilters, userLocation),
    [places, selectedFilters, userLocation],
  );

  const activeFilterCount = selectedFilters.length;

  const navigateHome = useCallback(() => navigate("/"), [navigate]);

  const openVenueDetail = useCallback(
    (venueId: string) => navigate(`/venue/${venueId}`),
    [navigate],
  );

  const bindSelectFilter =
    (setter: (value: string) => void, paramKey: string) =>
    (value: string) => {
      setter(value);
      pushSearchParams({ [paramKey]: value });
    };

  return {
    t,
    formatNumber,
    navigateHome,
    openVenueDetail,
    userLocation,
    normalizedSearch,
    searchParam,
    selectedFilters,
    searchInput,
    setSearchInput,
    districtInput,
    typeInput,
    categoryInput,
    priceRangeInput,
    minRatingInput,
    districtOptions,
    categorySelectOptions,
    priceRangeOptions,
    minRatingOptions,
    filteredPlaces,
    activeFilterCount,
    commitSearchForm,
    toggleQuickFilter,
    clearQuickFilters,
    bindDistrictFilter: bindSelectFilter(setDistrictInput, "district"),
    bindTypeFilter: bindSelectFilter(setTypeInput, "type"),
    bindCategoryFilter: bindSelectFilter(setCategoryInput, "category"),
    bindPriceRangeFilter: bindSelectFilter(setPriceRangeInput, "priceRange"),
    bindMinRatingFilter: bindSelectFilter(setMinRatingInput, "minRating"),
    places,
    isLoading,
    error,
    saveError,
    clearSaveError,
    pageIndex,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    retryFetch,
    toggleSave,
    isSavePending,
  };
};
