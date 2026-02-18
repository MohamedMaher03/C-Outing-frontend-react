import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import PlaceCard from "../components/PlaceCard";
import { PLACES } from "../data/mockData";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(
    PLACES.slice(0, 3).map((p) => ({ ...p, isSaved: true })),
  );

  const toggleSave = (id: string) =>
    setSaved((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-secondary fill-secondary/20" /> Saved
          Places
        </h1>
        <p className="text-sm text-muted-foreground">
          {saved.length} spots bookmarked
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
          <Heart className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No saved places yet.</p>
          <p className="text-sm text-muted-foreground">
            Tap the heart on any place to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onToggleSave={toggleSave}
              onClick={(id) => navigate(`/place/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
