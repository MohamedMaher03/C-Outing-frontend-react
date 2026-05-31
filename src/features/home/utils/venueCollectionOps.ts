import type { HomePlace } from "@/features/home/types";
import { homeService } from "@/features/home/services/homeService";
import {
  INTERACTION_ACTION_TYPES,
  trackVenueInteractionSafe,
} from "@/features/interactions";
import { getErrorMessage } from "@/utils/apiError";
import type { Dispatch, SetStateAction, MutableRefObject } from "react";

type PlaceCollection = HomePlace[];

type SaveErrorSetter = Dispatch<SetStateAction<string | null>>;
type SavePendingMapSetter = Dispatch<SetStateAction<Record<string, boolean>>>;

export interface ToggleSaveDeps {
  placeCollections: PlaceCollection[];
  saveInFlightIds: MutableRefObject<Set<string>>;
  setSaveError: SaveErrorSetter;
  setSavePendingMap: SavePendingMapSetter;
  onOptimisticUpdate: (id: string, nextSavedState: boolean) => void;
  onRollback: (id: string, previousSavedState: boolean) => void;
  trackInteraction?: boolean;
}

export const resolveVenueFromCollections = (
  id: string,
  collections: PlaceCollection[],
): HomePlace | undefined =>
  collections.flatMap((c) => c).find((p) => p.id === id);

export const buildToggleSaveHandler =
  ({
    placeCollections,
    saveInFlightIds,
    setSaveError,
    setSavePendingMap,
    onOptimisticUpdate,
    onRollback,
    trackInteraction = false,
  }: ToggleSaveDeps) =>
  async (id: string): Promise<void> => {
    if (saveInFlightIds.current.has(id)) return;
    const venue = resolveVenueFromCollections(id, placeCollections);
    if (!venue) return;

    const previousSavedState = Boolean(venue.isSaved);
    const nextSavedState = !previousSavedState;

    saveInFlightIds.current.add(id);
    setSaveError(null);
    setSavePendingMap((prev) => ({ ...prev, [id]: true }));
    onOptimisticUpdate(id, nextSavedState);

    try {
      await homeService.togglePlaceSave(id, nextSavedState);
      if (trackInteraction) {
        void trackVenueInteractionSafe(id, INTERACTION_ACTION_TYPES.favorite);
      }
    } catch (err) {
      onRollback(id, previousSavedState);
      setSaveError(
        getErrorMessage(err, "Could not update favorites right now."),
      );
    } finally {
      saveInFlightIds.current.delete(id);
      setSavePendingMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

export const patchSavedStateInCollection = (
  collection: HomePlace[],
  id: string,
  isSaved: boolean,
): HomePlace[] =>
  collection.map((place) => (place.id === id ? { ...place, isSaved } : place));
export const deduplicateVenuePool = (pools: HomePlace[][]): HomePlace[] => {
  const seen = new Set<string>();
  return pools
    .flat()
    .filter((place) => {
      if (seen.has(place.id)) return false;
      seen.add(place.id);
      return true;
    })
    .slice(0, 60);
};
