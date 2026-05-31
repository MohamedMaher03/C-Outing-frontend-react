import { useCallback, useEffect, useMemo, useState } from "react";
import { homeService } from "@/features/home/services/homeService";
import type { HomePlace } from "@/features/home/types";
import { getErrorMessage } from "@/utils/apiError";

interface SimilarVenueStudioState {
  seedSearchQuery: string;
  setSeedSearchQuery: (query: string) => void;
  seedSearchResults: HomePlace[];
  isSeedSearchLoading: boolean;
  seedSearchError: string | null;
  isSeedInputFocused: boolean;
  setIsSeedInputFocused: (focused: boolean) => void;
  selectedSeedFromSearch: HomePlace | null;
  hasManuallySelectedSeed: boolean;
  commitSeedSelection: (place: HomePlace) => void;
  resolvedSeedPlace: HomePlace | null;
  effectiveSuggestions: HomePlace[];
  showSuggestionDropdown: boolean;
}

interface SimilarVenueStudioProps {
  selectedSimilarSeedId: string | null;
  selectPlaceForSimilar: (id: string | null) => void;
  seedCandidatePool: HomePlace[];
  defaultSeedOptions: HomePlace[];
}

const VENUE_SEARCH_DEBOUNCE_MS = 250;
const SUGGESTION_PAGE_SIZE = 8;

export const useSimilarVenueStudio = ({
  selectedSimilarSeedId,
  selectPlaceForSimilar,
  seedCandidatePool,
  defaultSeedOptions,
}: SimilarVenueStudioProps): SimilarVenueStudioState => {
  const [seedSearchQuery, setSeedSearchQuery] = useState("");
  const [seedSearchResults, setSeedSearchResults] = useState<HomePlace[]>([]);
  const [isSeedSearchLoading, setIsSeedSearchLoading] = useState(false);
  const [seedSearchError, setSeedSearchError] = useState<string | null>(null);
  const [isSeedInputFocused, setIsSeedInputFocused] = useState(false);
  const [selectedSeedFromSearch, setSelectedSeedFromSearch] = useState<HomePlace | null>(null);
  const [hasManuallySelectedSeed, setHasManuallySelectedSeed] = useState(false);

  const trimmedQuery = seedSearchQuery.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      setIsSeedSearchLoading(false);
      setSeedSearchError(null);
      return;
    }

    let cancelled = false;
    const debounceId = window.setTimeout(async () => {
      setIsSeedSearchLoading(true);
      setSeedSearchError(null);
      try {
        const response = await homeService.searchVenues({
          searchTerm: trimmedQuery,
          page: 1,
          pageSize: SUGGESTION_PAGE_SIZE,
        });
        if (!cancelled) setSeedSearchResults(response.items);
      } catch (err) {
        if (!cancelled) {
          setSeedSearchError(getErrorMessage(err, "Failed to search venues"));
          setSeedSearchResults([]);
        }
      } finally {
        if (!cancelled) setIsSeedSearchLoading(false);
      }
    }, VENUE_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceId);
    };
  }, [trimmedQuery]);

  const commitSeedSelection = useCallback(
    (place: HomePlace) => {
      setSeedSearchQuery(place.name);
      setSelectedSeedFromSearch(place);
      selectPlaceForSimilar(place.id);
      setHasManuallySelectedSeed(true);
      setIsSeedInputFocused(false);
    },
    [selectPlaceForSimilar],
  );

  const activeSeedPool = hasManuallySelectedSeed ? seedCandidatePool : defaultSeedOptions;

  const defaultSuggestions = useMemo(
    () => activeSeedPool.slice(0, SUGGESTION_PAGE_SIZE),
    [activeSeedPool],
  );

  const effectiveSuggestions = trimmedQuery ? seedSearchResults : defaultSuggestions;

  const resolvedSeedPlace = useMemo(() => {
    if (!selectedSimilarSeedId || !hasManuallySelectedSeed) return null;
    return (
      activeSeedPool.find((p) => p.id === selectedSimilarSeedId) ??
      (selectedSeedFromSearch?.id === selectedSimilarSeedId ? selectedSeedFromSearch : null)
    );
  }, [selectedSimilarSeedId, hasManuallySelectedSeed, activeSeedPool, selectedSeedFromSearch]);

  const showSuggestionDropdown =
    isSeedInputFocused ||
    (trimmedQuery.length > 0 && trimmedQuery !== resolvedSeedPlace?.name);

  return {
    seedSearchQuery,
    setSeedSearchQuery,
    seedSearchResults,
    isSeedSearchLoading,
    seedSearchError,
    isSeedInputFocused,
    setIsSeedInputFocused,
    selectedSeedFromSearch,
    hasManuallySelectedSeed,
    commitSeedSelection,
    resolvedSeedPlace,
    effectiveSuggestions,
    showSuggestionDropdown,
  };
};
