import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/components/i18n";
import { FILTER_OPTIONS, type FilterType } from "@/features/home";
import PlaceCard from "@/features/home/components/PlaceCard";
import LocationPermissionBanner from "@/features/home/components/LocationPermissionBanner";
import { useHomeSearch } from "@/features/home/hooks/useHomeSearch";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import { normalizeSearchTerm } from "@/utils/textNormalization";
import { POPULAR_DISTRICTS, CATEGORIES } from "@/mocks/mockData";
import { VENUE_PRICE_RANGE_OPTIONS } from "@/features/home/mocks";
import { PRICE_LEVEL_VALUES } from "@/utils/priceLevels";
import { getTranslatedText } from "@/utils/helpers";
import {
  HOME_QUICK_FILTER_QUERY_KEY,
  filterHomePlacesByQuickFilters,
  parseHomeQuickFilters,
} from "../utils/filters";
import { safeParsePositiveInt, buildVenueSearchParams } from "../utils/domainHelpers";

const QUICK_FILTER_QUERY_KEY = HOME_QUICK_FILTER_QUERY_KEY;

const HomeSearchPage = () => {
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
  const filtersParam = searchParams.get(QUICK_FILTER_QUERY_KEY) ?? "";

  const normalizedSearch = useMemo(() => normalizeSearchTerm(searchParam), [searchParam]);
  const selectedFilters = useMemo(() => parseHomeQuickFilters(filtersParam), [filtersParam]);

  const [searchInput, setSearchInput] = useState(searchParam);
  const [districtInput, setDistrictInput] = useState(districtParam);
  const [typeInput, setTypeInput] = useState(typeParam);
  const [categoryInput, setCategoryInput] = useState(categoryParam);
  const [priceRangeInput, setPriceRangeInput] = useState(priceRangeParam);
  const [minRatingInput, setMinRatingInput] = useState(minRatingParam);

  const districtOptions = useMemo(
    () =>
      POPULAR_DISTRICTS.map((district) => ({
        value: district.name,
        label: getTranslatedText(district.nameKey, district.name, t),
      })),
    [t],
  );

  const typeOptions = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        value: category.id,
        label: getTranslatedText(category.nameKey, category.label, t),
      })),
    [t],
  );

  const categoryOptions = typeOptions;

  const priceRangeOptions = useMemo(
    () =>
      VENUE_PRICE_RANGE_OPTIONS.map((option) => ({
        value: String(PRICE_LEVEL_VALUES.indexOf(option.id) + 1),
        label: t(`budget.${option.id}`, undefined, option.label),
      })),
    [t],
  );

  const minRatingOptions = useMemo(
    () => [
      { value: "", label: t("home.search.filter.anyOption", undefined, "Any") },
      { value: "4", label: t("home.search.filter.minRatingOption4", undefined, "4.0+") },
      { value: "4.5", label: t("home.search.filter.minRatingOption45", undefined, "4.5+") },
    ],
    [t],
  );

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

  const applyFilters = (overrides?: Partial<Record<string, string>>) => {
    const nextParams = buildVenueSearchParams({
      q: overrides?.q ?? searchInput,
      district: overrides?.district ?? districtInput,
      type: overrides?.type ?? typeInput,
      category: overrides?.category ?? categoryInput,
      priceRange: overrides?.priceRange ?? priceRangeInput,
      minRating: overrides?.minRating ?? minRatingInput,
      [QUICK_FILTER_QUERY_KEY]: overrides?.[QUICK_FILTER_QUERY_KEY] ?? filtersParam,
    });
    setPageIndex(1);
    setSearchParams(nextParams);
  };

  const handleQuickFilterToggle = (filter: FilterType) => {
    const nextFilters =
      filter === "all"
        ? []
        : selectedFilters.includes(filter)
          ? selectedFilters.filter((item) => item !== filter)
          : [...selectedFilters, filter];
    applyFilters({ [QUICK_FILTER_QUERY_KEY]: nextFilters.join(",") });
  };

  const filteredPlaces = useMemo(
    () => filterHomePlacesByQuickFilters(places, selectedFilters, userLocation),
    [places, selectedFilters, userLocation],
  );

  const activeFilterCount = selectedFilters.length;

  if (isLoading) {
    return (
      <PageLoading
        text={t("home.search.loading", undefined, "Searching venues")}
        subText={t("home.search.loadingSubtitle", undefined, "Gathering the best matches for you")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("home.search.backHome", undefined, "Back to home")}
            </button>
            <div className="flex items-center gap-2 text-foreground">
              <Search className="h-5 w-5 text-secondary dark:text-primary" />
              <h1 className="text-3xl font-black tracking-tight">
                {t("home.search.title", undefined, "Search results")}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {normalizedSearch
                ? t("home.search.subtitle", { query: searchParam })
                : t("home.search.subtitleEmpty", undefined, "Start typing to search for places in Cairo")}
            </p>
          </div>
        </div>

        <LocationPermissionBanner userLocation={userLocation} onEnableLocation={userLocation.requestLocation} />

        {saveError && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-destructive">{saveError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSaveError}
                className="h-8 rounded-full border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                {t("common.dismiss")}
              </Button>
            </div>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("home.search.inputPlaceholder", undefined, "Search places, cafes, districts")}
                className="h-12 rounded-2xl border-border/70 bg-card pl-11"
              />
            </div>
            <Button type="submit" className="h-12 rounded-2xl px-5">
              {t("home.search.action", undefined, "Search")}
            </Button>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/90 p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground">
                  {t("home.search.quickFiltersTitle", undefined, "Quick filters")}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    "home.search.quickFiltersSubtitle",
                    undefined,
                    "Use the same fast filters from the home page to narrow live, saved, or nearby places.",
                  )}
                </p>
              </div>

              {activeFilterCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFilters({ filters: "" })}
                  className="h-9 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {t("home.search.clearFilters", undefined, "Clear filters")}
                </Button>
              )}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible">
              {FILTER_OPTIONS.map((filter) => {
                const Icon = filter.icon;
                const isActive =
                  filter.id === "all" ? selectedFilters.length === 0 : selectedFilters.includes(filter.id);
                return (
                  <button
                    type="button"
                    key={filter.id}
                    onClick={() => handleQuickFilterToggle(filter.id)}
                    aria-pressed={isActive}
                    className={`inline-flex min-h-11 flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                        : "border-border/70 bg-background text-foreground hover:border-primary/60 hover:bg-primary/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(`home.filter.${filter.id}`, undefined, filter.label)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {(
              [
                {
                  labelKey: "home.search.filter.districtLabel",
                  labelFallback: "District",
                  value: districtInput,
                  options: districtOptions,
                  onChange: (val: string) => { setDistrictInput(val); applyFilters({ district: val }); },
                },
                {
                  labelKey: "home.search.filter.typeLabel",
                  labelFallback: "Type",
                  value: typeInput,
                  options: typeOptions,
                  onChange: (val: string) => { setTypeInput(val); applyFilters({ type: val }); },
                },
                {
                  labelKey: "home.search.filter.categoryLabel",
                  labelFallback: "Category",
                  value: categoryInput,
                  options: categoryOptions,
                  onChange: (val: string) => { setCategoryInput(val); applyFilters({ category: val }); },
                },
                {
                  labelKey: "home.search.filter.priceRangeLabel",
                  labelFallback: "Price range",
                  value: priceRangeInput,
                  options: priceRangeOptions,
                  onChange: (val: string) => { setPriceRangeInput(val); applyFilters({ priceRange: val }); },
                },
              ] as const
            ).map(({ labelKey, labelFallback, value, options, onChange }) => (
              <label key={labelKey} className="space-y-1 text-xs font-semibold text-muted-foreground">
                <span>{t(labelKey, undefined, labelFallback)}</span>
                <select
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm text-foreground"
                >
                  <option value="">{t("home.search.filter.anyOption", undefined, "Any")}</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            ))}

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              <span>{t("home.search.filter.minRatingLabel", undefined, "Min rating")}</span>
              <select
                value={minRatingInput}
                onChange={(event) => {
                  const val = event.target.value;
                  setMinRatingInput(val);
                  applyFilters({ minRating: val });
                }}
                className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm text-foreground"
              >
                {minRatingOptions.map((opt) => (
                  <option key={opt.value || "any"} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
        </form>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
            <p className="text-sm font-semibold text-destructive">
              {t("home.search.errorTitle", undefined, "Search failed")}
            </p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
            <Button
              type="button"
              onClick={retryFetch}
              variant="outline"
              size="sm"
              className="mt-3 h-9 rounded-full border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              {t("common.retry")}
            </Button>
          </div>
        ) : normalizedSearch.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 px-4 py-10 text-center">
            <p className="font-semibold text-foreground">
              {t("home.search.emptyQueryTitle", undefined, "Tell us what you are looking for")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("home.search.emptyQueryDescription", undefined, "Try a venue name, district, or category")}
            </p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 px-4 py-10 text-center">
            <p className="font-semibold text-foreground">
              {activeFilterCount > 0
                ? t("home.search.filteredEmptyTitle", undefined, "No places match these filters")
                : t("home.search.emptyTitle", undefined, "No matches yet")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilterCount > 0
                ? t("home.search.filteredEmptyDescription", undefined, "Try clearing one or more filters, or refine your search term.")
                : t("home.search.emptyDescription", undefined, "Try a different keyword or remove filters")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{t("home.search.resultCount", { count: formatNumber(filteredPlaces.length) })}</span>
              <span>{t("home.search.pageLabel", { page: formatNumber(pageIndex), total: formatNumber(totalPages) })}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  variant="grid"
                  userLocation={userLocation}
                  onToggleSave={toggleSave}
                  isSavePending={isSavePending(place.id)}
                  onClick={(id) => navigate(`/venue/${id}`)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={!hasPreviousPage}
                className="min-h-11"
              >
                {t("home.search.prev", undefined, "Previous")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={!hasNextPage}
                className="min-h-11"
              >
                {t("home.search.next", undefined, "Next")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSearchPage;
