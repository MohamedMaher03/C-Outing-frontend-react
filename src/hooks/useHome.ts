/**
 * useHome Hook
 * Manages all state and logic for the HomePage
 * Separates business logic from UI components
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Place } from "../data/mockData";
import {
  CATEGORIES,
  MOOD_OPTIONS,
  TRENDING_TAGS,
  POPULAR_DISTRICTS,
} from "../data/mockData";
import { fetchPlaces } from "../services/api/homeService";

export type FilterType = "all" | "top-rated" | "near-me" | "open-now";

interface UseHomeReturn {
  // State
  search: string;
  selectedFilter: FilterType;
  selectedMood: string | null;
  selectedCategory: string | null;
  places: Place[];
  isLoading: boolean;
  error: string | null;

  // Computed data
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
  setSelectedFilter: (filter: FilterType) => void;
  setSelectedMood: (mood: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  toggleSave: (id: string) => void;
  reloadPlaces: () => Promise<void>;
}

/**
 * Custom hook for home page logic
 */
export const useHome = (): UseHomeReturn => {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load places on mount
  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchPlaces();
      setPlaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load places");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle save status for a place
  const toggleSave = useCallback((id: string) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p)),
    );
  }, []);

  // Apply search filter
  const searchFilteredPlaces = useMemo(() => {
    if (!search) return places;

    const query = search.toLowerCase();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.district.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)),
    );
  }, [places, search]);

  // Apply category filter
  const categoryFilteredPlaces = useMemo(() => {
    if (!selectedCategory) return searchFilteredPlaces;
    return searchFilteredPlaces.filter((p) =>
      p.category.toLowerCase().includes(selectedCategory.toLowerCase()),
    );
  }, [searchFilteredPlaces, selectedCategory]);

  // Apply category + type filter
  const filteredPlaces = useMemo(() => {
    let result = categoryFilteredPlaces;

    if (selectedFilter === "top-rated") {
      result = result.filter((p) => p.rating >= 4.5);
    } else if (selectedFilter === "near-me") {
      result = [...result].sort((a, b) => {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distA - distB;
      });
    } else if (selectedFilter === "open-now") {
      result = result.filter((p) => p.isOpen === true);
    }

    return result;
  }, [categoryFilteredPlaces, selectedFilter]);

  // Curated recommendations (top 5 by matchScore)
  const curatedPlaces = useMemo(() => {
    return [...filteredPlaces]
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
      .slice(0, 5);
  }, [filteredPlaces]);

  // Top rated places (sorted by rating)
  const topRatedPlaces = useMemo(() => {
    return [...filteredPlaces].sort((a, b) => b.rating - a.rating);
  }, [filteredPlaces]);

  // Trending places (most reviewed)
  const trendingPlaces = useMemo(() => {
    return [...filteredPlaces]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 6);
  }, [filteredPlaces]);

  return {
    // State
    search,
    selectedFilter,
    selectedMood,
    selectedCategory,
    places,
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
    setSelectedFilter,
    setSelectedMood,
    setSelectedCategory,
    toggleSave,
    reloadPlaces: loadPlaces,
  };
};
