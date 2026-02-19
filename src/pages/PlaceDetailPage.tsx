import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  ExternalLink,
  Heart,
  DollarSign,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { usePlaceDetail } from "../hooks/usePlaceDetail";

const PlaceDetailPage = () => {
  const { id } = useParams();
  const {
    place,
    loading,
    error,
    isFavorite,
    savingFavorite,
    toggleFavorite,
    openInMaps,
    goBack,
  } = usePlaceDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading place details...</p>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">{error || "Place not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="relative h-64 sm:h-80">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <button
          onClick={goBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          onClick={toggleFavorite}
          disabled={savingFavorite}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors disabled:opacity-50"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "text-secondary fill-secondary" : "text-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{place.name}</h1>
            <Badge className="bg-secondary/10 text-secondary border-secondary/30 gap-1 shrink-0">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              {place.rating}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {place.district} · {place.distance}
            </span>
            <span className="flex items-center gap-0.5 ml-2">
              {Array.from({ length: place.priceLevel }).map((_, i) => (
                <DollarSign key={i} className="h-3 w-3 text-secondary" />
              ))}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            About
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {place.description}
          </p>
        </div>

        <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 space-y-1">
          <h2 className="text-sm font-semibold text-secondary flex items-center gap-1.5">
            ✦ Why We Recommend This
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {place.whyRecommend}
          </p>
        </div>

        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold h-12 gap-2"
          onClick={openInMaps}
        >
          <ExternalLink className="h-4 w-4" /> Open in Google Maps
        </Button>
      </div>
    </div>
  );
};

export default PlaceDetailPage;
