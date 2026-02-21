/**
 * useHome Hook
 * Manages all state and logic for the HomePage.
 *
 * Data architecture:
 *   - The backend (simulated) is responsible for computing and returning three
 *     pre-curated sections: curatedPlaces, trendingPlaces, topRatedPlaces.
 *   - The frontend only applies user-driven filter pills on top of those lists:
 *       "All"        → no extra filter (show everything the backend returned)
 *       "Top Rated"  → keep places with rating >= 4.5
 *       "Open Now"   → keep only places where isOpen === true
 *       "Near Me"    → sort by distance ascending
 *   - Multiple pills can be active simultaneously (AND logic).
 *   - Search text and category selection narrow results further on the client.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Place } from "@/mocks/mockData";
import {
  CATEGORIES,
  MOOD_OPTIONS,
  TRENDING_TAGS,
  POPULAR_DISTRICTS,
} from "@/mocks/mockData";
import { fetchHomePageData } from "@/features/home/services/homeService";

export type FilterType = "all" | "top-rated" | "near-me" | "open-now";

interface UseHomeReturn {
  // State
  search: string;
  /** Active filter pills — empty array means "All" (no filter). */
  selectedFilters: FilterType[];
  selectedMood: string | null;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;

  // Computed / filtered data
  /** Same as filteredTopRated — used for the "X venues match" count. */
  filteredPlaces: Place[];
  curatedPlaces: Place[];
  topRatedPlaces: Place[];
  trendingPlaces: Place[];

  // Static data
  categories: typeof CATEGORIES;
  moodOptions: typeof MOOD_OPTIONS;
  trendingTags: typeof TRENDING_TAGS;
  popularDistricts: typeof POPULAR_DISTRICTS;

  // Actions
  setSearch: (search: string) => void;
  /** Toggle a filter pill on/off. Clicking "all" clears all active filters. */
  toggleFilter: (filter: FilterType) => void;
  setSelectedMood: (mood: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  toggleSave: (id: string) => void;
  reloadPlaces: () => Promise<void>;
}

export const useHome = (): UseHomeReturn => {
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw backend-provided sections (source-of-truth ordering / curation)
  const [rawCurated, setRawCurated] = useState<Place[]>([]);
  const [rawTrending, setRawTrending] = useState<Place[]>([]);
  const [rawTopRated, setRawTopRated] = useState<Place[]>([]);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { curatedPlaces, trendingPlaces, topRatedPlaces } =
        await fetchHomePageData();
      setRawCurated(curatedPlaces);
      setRawTrending(trendingPlaces);
      setRawTopRated(topRatedPlaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load places");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle a filter pill.
   * Clicking "all" clears every active filter.
   * Clicking any other pill toggles it in the active set.
   */
  const toggleFilter = useCallback((filter: FilterType) => {
    if (filter === "all") {
      setSelectedFilters([]);
    } else {
      setSelectedFilters((prev) =>
        prev.includes(filter)
          ? prev.filter((f) => f !== filter)
          : [...prev, filter],
      );
    }
  }, []);

  /** Toggle the saved state for a place across all three backend sections. */
  const toggleSave = useCallback((id: string) => {
    const toggle = (list: Place[]) =>
      list.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p));
    setRawCurated((prev) => toggle(prev));
    setRawTrending((prev) => toggle(prev));
    setRawTopRated((prev) => toggle(prev));
  }, []);

  /**
   * Apply all active client-side filters to a list.
   *
   * Order:
   *   1. Search text
   *   2. Category
   *   3. "top-rated" pill  → rating >= 4.5
   *   4. "open-now"  pill  → isOpen === true
   *   5. "near-me"   pill  → sort by distance (can combine with others)
   */
  const applyFilters = useCallback(
    (list: Place[]): Place[] => {
      let result = [...list];

      // Search
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      // Category
      if (selectedCategory) {
        result = result.filter((p) =>
          p.category.toLowerCase().includes(selectedCategory.toLowerCase()),
        );
      }

      // Filter pills (AND logic — all active filters must match)
      if (selectedFilters.includes("top-rated")) {
        result = result.filter((p) => p.rating >= 4.5);
      }
      if (selectedFilters.includes("open-now")) {
        result = result.filter((p) => p.isOpen === true);
      }
      if (selectedFilters.includes("near-me")) {
        result = result.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance),
        );
      }

      return result;
    },
    [search, selectedCategory, selectedFilters],
  );

  const curatedPlaces = useMemo(
    () => applyFilters(rawCurated),
    [rawCurated, applyFilters],
  );
  const trendingPlaces = useMemo(
    () => applyFilters(rawTrending),
    [rawTrending, applyFilters],
  );
  const topRatedPlaces = useMemo(
    () => applyFilters(rawTopRated),
    [rawTopRated, applyFilters],
  );

  // Alias used by the "X venues match your criteria" counter
  const filteredPlaces = topRatedPlaces;

  return {
    // State
    search,
    selectedFilters,
    selectedMood,
    selectedCategory,
    isLoading,
    error,

    // Computed data
    filteredPlaces,
    curatedPlaces,
    topRatedPlaces,
    trendingPlaces,

    // Static data
    categories: CATEGORIES,
    moodOptions: MOOD_OPTIONS,
    trendingTags: TRENDING_TAGS,
    popularDistricts: POPULAR_DISTRICTS,

    // Actions
    setSearch,
    toggleFilter,
    setSelectedMood,
    setSelectedCategory,
    toggleSave,
    reloadPlaces: loadPlaces,
  };
};
