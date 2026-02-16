import { Heart, MapPin, Star } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { cn } from "../libs/utils";
import type { Place } from "../data/mockData";

interface PlaceCardProps {
  place: Place;
  variant?: "horizontal" | "grid";
  onToggleSave?: (id: string) => void;
  onClick?: (id: string) => void;
  //   showAiPick?: boolean;
}

const PlaceCard = ({
  place,
  variant = "grid",
  onToggleSave,
  onClick,
  //   showAiPick = false,
}: PlaceCardProps) => {
  const isHorizontal = variant === "horizontal";

  return (
    <div
      onClick={() => onClick?.(place.id)}
      className={cn(
        "group relative bg-white rounded-xl border border-border overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 shadow-md",
        isHorizontal ? "w-[260px] flex-shrink-0" : "w-full",
        // showAiPick && "ring-2 ring-gold/30",
      )}
    >
      {/* AI Pick Badge
      {showAiPick && (
        <div className="absolute top-2 left-2 z-10 bg-gold text-navy px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
          <Sparkles className="h-3 w-3" />
          AI PICK
        </div>
      )} */}

      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden",
          isHorizontal ? "h-36" : "h-44",
        )}
      >
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(place.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              place.isSaved
                ? "fill-destructive text-destructive"
                : "text-foreground",
            )}
          />
        </button>

        {/* Rating Badge */}
        <Badge className="absolute bottom-3 left-3 bg-white/90 text-foreground backdrop-blur-sm border-0 gap-1 font-semibold">
          <Star className="h-3 w-3 fill-secondary text-secondary" />
          {place.rating}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-1.5">
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1">
          {place.name}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <MapPin className="h-3 w-3" />
          <span>
            {place.distance} · {place.district}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {place.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
