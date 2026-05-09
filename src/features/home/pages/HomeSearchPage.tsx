import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/components/i18n";
import PlaceCard from "@/features/home/components/PlaceCard";
import { useHomeSearch } from "@/features/home/hooks/useHomeSearch";
import { normalizeSearchTerm } from "@/utils/textNormalization";
import { POPULAR_DISTRICTS, CATEGORIES } from "@/mocks/mockData";
import { VENUE_PRICE_RANGE_OPTIONS } from "@/features/home/mocks";
import { PRICE_LEVEL_VALUES } from "@/utils/priceLevels";
import { getTranslatedText } from "@/utils/helpers";

const PAGE_SIZE_OPTIONS = [12, 24, 36];

const HomeSearchPage = () => {
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("q") ?? "";
  const districtParam = searchParams.get("district") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const priceRangeParam = searchParams.get("priceRange") ?? "";
  const minRatingParam = searchParams.get("minRating") ?? "";
  const normalizedSearch = useMemo(
    () => normalizeSearchTerm(searchParam),
    [searchParam],
  );
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

  const categoryOptions = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        value: category.id,
        label: getTranslatedText(category.nameKey, category.label, t),
      })),
    [t],
  );

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
      {
        value: "4",
        label: t("home.search.filter.minRatingOption4", undefined, "4.0+"),
      },
      {
        value: "4.5",
        label: t("home.search.filter.minRatingOption45", undefined, "4.5+"),
      },
    ],
    [t],
  );

  const parseNumberParam = (value: string) => {
    if (!value.trim()) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const priceRangeValue = parseNumberParam(priceRangeParam);
  const minRatingValue = parseNumberParam(minRatingParam);

  const {
    places,
    isLoading,
    error,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
    retryFetch,
  } = useHomeSearch({
    searchTerm: searchParam,
    district: districtParam,
    type: typeParam,
    category: categoryParam,
    priceRange: priceRangeValue,
    minRating: minRatingValue,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    const nextDistrict = districtInput.trim();
    const nextType = typeInput.trim();
    const nextCategory = categoryInput.trim();
    const nextPriceRange = priceRangeInput.trim();
    const nextMinRating = minRatingInput.trim();

    const nextParams = new URLSearchParams();
    if (nextQuery) nextParams.set("q", nextQuery);
    if (nextDistrict) nextParams.set("district", nextDistrict);
    if (nextType) nextParams.set("type", nextType);
    if (nextCategory) nextParams.set("category", nextCategory);
    if (nextPriceRange) nextParams.set("priceRange", nextPriceRange);
    if (nextMinRating) nextParams.set("minRating", nextMinRating);

    setSearchParams(nextParams);
  };

  if (isLoading) {
    return (
      <PageLoading
        text={t("home.search.loading", undefined, "Searching venues")}
        subText={t(
          "home.search.loadingSubtitle",
          undefined,
          "Gathering the best matches for you",
        )}
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
              <Search className="h-5 w-5 text-secondary" />
              <h1 className="text-3xl font-black tracking-tight">
                {t("home.search.title", undefined, "Search results")}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {normalizedSearch
                ? t("home.search.subtitle", { query: searchParam })
                : t(
                    "home.search.subtitleEmpty",
                    undefined,
                    "Start typing to search for places in Cairo",
                  )}
            </p>
          </div>

          <div
            className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm"
            role="group"
            aria-label={t(
              "home.search.countGroup",
              undefined,
              "Results per page",
            )}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setPageSize(option)}
                aria-pressed={pageSize === option}
                className={`min-h-11 rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${
                  pageSize === option
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {t("home.search.countOption", {
                  count: formatNumber(option),
                })}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t(
                  "home.search.inputPlaceholder",
                  undefined,
                  "Search places, cafes, districts",
                )}
                className="h-12 rounded-2xl border-border/70 bg-card pl-11"
              />
            </div>
            <Button type="submit" className="h-12 rounded-2xl px-5">
              {t("home.search.action", undefined, "Search")}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              <span>
                {t("home.search.filter.districtLabel", undefined, "District")}
              </span>
              <select
                value={districtInput}
                onChange={(event) => setDistrictInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm text-foreground"
              >
                <option value="">
                  {t("home.search.filter.anyOption", undefined, "Any")}
                </option>
                {districtOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              <span>
                {t("home.search.filter.typeLabel", undefined, "Type")}
              </span>
              <select
                value={typeInput}
                onChange={(event) => setTypeInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm text-foreground"
              >
                <option value="">
                  {t("home.search.filter.anyOption", undefined, "Any")}
                </option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              <span>
                {t("home.search.filter.categoryLabel", undefined, "Category")}
              </span>
              <select
                value={categoryInput}
                onChange={(event) => setCategoryInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm text-foreground"
              >
                <option value="">
                  {t("home.search.filter.anyOption", undefined, "Any")}
                </option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              <span>
                {t(
                  "home.search.filter.priceRangeLabel",
                  undefined,
                  "Price range",
                )}
              </span>
              <select
                value={priceRangeInput}
                onChange={(event) => setPriceRangeInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm text-foreground"
              >
                <option value="">
                  {t("home.search.filter.anyOption", undefined, "Any")}
                </option>
                {priceRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              <span>
                {t(
                  "home.search.filter.minRatingLabel",
                  undefined,
                  "Min rating",
                )}
              </span>
              <select
                value={minRatingInput}
                onChange={(event) => setMinRatingInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm text-foreground"
              >
                {minRatingOptions.map((option) => (
                  <option key={option.value || "any"} value={option.value}>
                    {option.label}
                  </option>
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
              {t(
                "home.search.emptyQueryTitle",
                undefined,
                "Tell us what you are looking for",
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                "home.search.emptyQueryDescription",
                undefined,
                "Try a venue name, district, or category",
              )}
            </p>
          </div>
        ) : places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 px-4 py-10 text-center">
            <p className="font-semibold text-foreground">
              {t("home.search.emptyTitle", undefined, "No matches yet")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                "home.search.emptyDescription",
                undefined,
                "Try a different keyword or remove filters",
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {t("home.search.resultCount", {
                  count: formatNumber(totalCount),
                })}
              </span>
              <span>
                {t("home.search.pageLabel", {
                  page: formatNumber(pageIndex),
                  total: formatNumber(totalPages),
                })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  variant="grid"
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
