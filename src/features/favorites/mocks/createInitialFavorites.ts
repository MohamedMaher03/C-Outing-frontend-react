import { PLACES } from "@/mocks/mockData";
import type { FavoriteItem } from "../types";
export const createInitialFavorites = (): FavoriteItem[] =>
  PLACES.slice(0, 3).map((place) => ({
    venue: {
      ...place,
      isSaved: true,
    },
    createdAt: new Date().toISOString().slice(0, 10),
  }));
