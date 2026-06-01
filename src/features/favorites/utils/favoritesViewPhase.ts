export type FavoritesViewPhase = "initial-loading" | "fatal-error" | "content";

export const resolveFavoritesViewPhase = (
  loading: boolean,
  loadError: string | null,
  favoriteCount: number,
): FavoritesViewPhase => {
  if (loading && favoriteCount === 0) return "initial-loading";
  if (loadError && favoriteCount === 0) return "fatal-error";
  return "content";
};
