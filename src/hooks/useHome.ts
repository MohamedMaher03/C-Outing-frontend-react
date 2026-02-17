/**
 * useHome Hook
 * Manages all state and logic for the HomePage
 * Separates business logic from UI components
 */

import { useState, useEffect, useMemo } from "react";
import type { Place } from "../data/mockData";
import { fetchPlaces } from "../services/api/homeService";

export type FilterType = "all" | "top-rated" | "near-me" | "open-now";

interface UseHomeReturn {
  // State
  search: string;
  selectedFilter: FilterType;
  places: Place[];
  isLoading: boolean;
  error: string | null;

  // Computed data
  filteredPlaces: Place[];
  curatedPlaces: Place[];
  topRatedPlaces: Place[];

  // Actions
  setSearch: (search: string) => void;
  setSelectedFilter: (filter: FilterType) => void;
  toggleSave: (id: string) => void;
  reloadPlaces: () => Promise<void>;
}

/**
 * Custom hook for home page logic
 */
export const useHome = (): UseHomeReturn => {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
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
  const toggleSave = (id: string) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p)),
    );
  };

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
  const filteredPlaces = useMemo(() => {
    let result = searchFilteredPlaces;

    if (selectedFilter === "top-rated") {
      result = result.filter((p) => p.rating >= 4.5);
    } else if (selectedFilter === "near-me") {
      result = [...result].sort((a, b) => {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distA - distB;
      });
    }

    return result;
  }, [searchFilteredPlaces, selectedFilter]);

  // Curated recommendations (top 5)
  const curatedPlaces = useMemo(() => {
    return filteredPlaces.slice(0, 5);
  }, [filteredPlaces]);

  // Top rated places (sorted by rating)
  const topRatedPlaces = useMemo(() => {
    return [...filteredPlaces].sort((a, b) => b.rating - a.rating);
  }, [filteredPlaces]);

  return {
    // State
    search,
    selectedFilter,
    places,
    isLoading,
    error,

    // Computed data
    filteredPlaces,
    curatedPlaces,
    topRatedPlaces,

    // Actions
    setSearch,
    setSelectedFilter,
    toggleSave,
    reloadPlaces: loadPlaces,
  };
};
