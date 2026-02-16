import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "../components/ui/input";
import PlaceCard from "../components/PlaceCard";
import { PLACES } from "../data/mockData";

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState(
    PLACES.map((p) => ({ ...p, isSaved: false })),
  );

  const toggleSave = (id: string) =>
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p)),
    );

  const filtered = places.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const curated = filtered.slice(0, 5);
  const topRated = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Search */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Discover Cairo <span className="text-secondary">✦</span>
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search places, districts, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Curated Row */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Curated for You
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {curated.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              variant="horizontal"
              onToggleSave={toggleSave}
              onClick={(id) => navigate(`/place/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* Top Rated Grid */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Top Rated in Cairo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topRated.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              variant="grid"
              onToggleSave={toggleSave}
              onClick={(id) => navigate(`/place/${id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
