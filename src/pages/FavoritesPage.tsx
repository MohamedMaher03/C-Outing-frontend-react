import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import PlaceCard from "../components/PlaceCard";
import { useFavorites } from "../hooks/useFavorites";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favorites, loading, error, toggleSave } = useFavorites();

  const handleToggleSave = async (id: string) => {
    try {
      await toggleSave(id);
    } catch {
      // Error is already logged in hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading favorites...</p>
      </div>
    );
  }

  if (error && favorites.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load favorites</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-secondary fill-secondary/20" /> Saved
          Places
        </h1>
        <p className="text-sm text-muted-foreground">
          {favorites.length} spots bookmarked
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
          <Heart className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No saved places yet.</p>
          <p className="text-sm text-muted-foreground">
            Tap the heart on any place to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((place) => (
            <PlaceCard
              key={place.id}
              place={{ ...place, isSaved: true }}
              onToggleSave={handleToggleSave}
              onClick={(id) => navigate(`/venue/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
