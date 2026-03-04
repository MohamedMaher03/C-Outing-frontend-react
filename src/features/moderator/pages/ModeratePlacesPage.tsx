/**
 * Moderate Places Page (Moderator)
 *
 * Verify/edit place information. Moderators can approve/flag but cannot delete.
 */

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Flag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { adminMock } from "@/features/admin/mocks/adminMock";
import type { AdminPlace } from "@/features/admin/types";

const statusConfig: Record<
  string,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  active: {
    label: "Active",
    class: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    class: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  flagged: {
    label: "Flagged",
    class: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  removed: {
    label: "Removed",
    class: "bg-gray-100 text-gray-500 border-gray-200",
    icon: XCircle,
  },
};

const ModeratePlacesPage = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminMock.getPlaces();
        setPlaces(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (placeId: string) => {
    await adminMock.updatePlaceStatus(placeId, "active");
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, status: "active" as const } : p,
      ),
    );
  };

  const handleFlag = async (placeId: string) => {
    await adminMock.updatePlaceStatus(placeId, "flagged");
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, status: "flagged" as const } : p,
      ),
    );
  };

  const filtered = places.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner size="md" text="Loading places..." fullScreen />;
  }

  const pendingCount = places.filter((p) => p.status === "pending").length;
  const flaggedCount = places.filter((p) => p.status === "flagged").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6 text-secondary" />
          Moderate Places
        </h1>
        <p className="text-sm text-muted-foreground">
          {pendingCount} pending · {flaggedCount} flagged
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search places or districts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "flagged", "active"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                statusFilter === status
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40",
              )}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto" />
            <p className="text-muted-foreground font-medium">All clear!</p>
            <p className="text-sm text-muted-foreground">
              No places match the current filter.
            </p>
          </div>
        ) : (
          filtered.map((place) => {
            const config = statusConfig[place.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={place.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl bg-card border hover:shadow-sm transition-all",
                  place.status === "flagged"
                    ? "border-red-200 bg-red-50/30"
                    : place.status === "pending"
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-border",
                )}
              >
                {/* Image */}
                <img
                  src={place.image}
                  alt={place.name}
                  className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {place.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", config.class)}
                    >
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{place.category}</span>
                    <span>·</span>
                    <span>{place.district}</span>
                    {place.rating > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-secondary fill-secondary" />{" "}
                          {place.rating}
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>{place.reviewCount} reviews</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/venue/${place.id}`)}
                    className="text-xs gap-1 h-8"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>

                  {(place.status === "pending" ||
                    place.status === "flagged") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(place.id)}
                      className="text-xs gap-1 h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}

                  {place.status === "active" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFlag(place.id)}
                      className="text-xs gap-1 h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <Flag className="h-3.5 w-3.5" /> Flag
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
        <p className="text-sm text-foreground">
          <span className="font-medium">ℹ️ Note:</span> As a moderator, you can
          approve or flag places. To delete a place, please escalate to an
          admin.
        </p>
      </div>
    </div>
  );
};

export default ModeratePlacesPage;
