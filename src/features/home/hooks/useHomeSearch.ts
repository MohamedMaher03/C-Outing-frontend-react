import { useCallback, useEffect, useMemo, useState } from "react";
import { homeService } from "@/features/home/services/homeService";
import type { HomePlace } from "@/features/home/types";
import { getErrorMessage } from "@/utils/apiError";
import {
  normalizeSearchTerm,
  normalizeTrimmed,
} from "@/utils/textNormalization";

interface UseHomeSearchOptions {
  searchTerm: string;
  district?: string;
  type?: string;
  category?: string;
  priceRange?: number;
  minRating?: number;
}

interface UseHomeSearchReturn {
  places: HomePlace[];
  isLoading: boolean;
  error: string | null;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  setPageIndex: (pageIndex: number) => void;
  retryFetch: () => void;
}

const DEFAULT_PAGE_SIZE = 20;

export const useHomeSearch = ({
  searchTerm,
  district,
  type,
  category,
  priceRange,
  minRating,
}: UseHomeSearchOptions): UseHomeSearchReturn => {
  const normalizedSearch = useMemo(
    () => normalizeSearchTerm(searchTerm),
    [searchTerm],
  );
  const normalizedDistrict = useMemo(
    () => normalizeTrimmed(district),
    [district],
  );
  const normalizedType = useMemo(() => normalizeTrimmed(type), [type]);
  const normalizedCategory = useMemo(
    () => normalizeTrimmed(category),
    [category],
  );

  const hasFilters =
    Boolean(normalizedDistrict) ||
    Boolean(normalizedType) ||
    Boolean(normalizedCategory) ||
    typeof priceRange === "number" ||
    typeof minRating === "number";
  const hasSearchCriteria = Boolean(normalizedSearch) || hasFilters;

  const [places, setPlaces] = useState<HomePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setPageIndex(1);
  }, [
    normalizedSearch,
    normalizedDistrict,
    normalizedType,
    normalizedCategory,
    priceRange,
    minRating,
    pageSize,
  ]);

  useEffect(() => {
    if (!hasSearchCriteria) {
      setPlaces([]);
      setError(null);
      setIsLoading(false);
      setTotalCount(0);
      setTotalPages(1);
      setHasPreviousPage(false);
      setHasNextPage(false);
      return;
    }

    let cancelled = false;
    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await homeService.searchVenues({
          searchTerm: normalizedSearch || undefined,
          district: normalizedDistrict || undefined,
          type: normalizedType || undefined,
          category: normalizedCategory || undefined,
          priceRange,
          minRating,
          page: pageIndex,
          pageSize,
        });

        if (!cancelled) {
          setPlaces(response.items);
          setTotalCount(response.totalCount);
          setTotalPages(response.totalPages);
          setHasPreviousPage(response.hasPreviousPage);
          setHasNextPage(response.hasNextPage);
        }
      } catch (err) {
        if (!cancelled) {
          setPlaces([]);
          setError(getErrorMessage(err, "Failed to search venues"));
          setTotalCount(0);
          setTotalPages(1);
          setHasPreviousPage(false);
          setHasNextPage(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchPlaces();
    return () => {
      cancelled = true;
    };
  }, [
    normalizedSearch,
    normalizedDistrict,
    normalizedType,
    normalizedCategory,
    priceRange,
    minRating,
    pageIndex,
    pageSize,
    reloadKey,
    hasSearchCriteria,
  ]);

  const retryFetch = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  return {
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
    retryFetch,
  };
};
