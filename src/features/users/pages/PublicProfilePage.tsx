/**
 * Public Profile Page
 *
 * Shown when a user taps on another user's name/avatar anywhere in the app.
 * Read-only view: displays bio, stats, follow button, and recent reviews.
 *
 * Design mirrors the existing ProfilePage aesthetic:
 *   – CSS variable tokens (bg-card, text-foreground, border-border…)
 *   – Secondary (gold) accent for interactive elements
 *   – rounded-xl cards, Plus Jakarta Sans font (inherited)
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Star,
  MapPin,
  CalendarDays,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { usePublicProfile } from "../hooks/usePublicProfile";

// ── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "text-secondary fill-secondary"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    profile,
    reviews,
    loading,
    followLoading,
    error,
    isOwnProfile,
    follow,
  } = usePublicProfile(id ?? "");

  // ── Loading ──────────────────────────────

  if (loading) {
    return (
      <LoadingSpinner size="md" text="Loading profile…" fullScreen={true} />
    );
  }

  // ── Error ────────────────────────────────

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-destructive font-medium">
          {error ?? "Profile not found"}
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  // ── Own profile redirect hint ────────────

  const joinedYear = profile.joinedDate
    ? new Date(profile.joinedDate).getFullYear()
    : null;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* ── Back nav ─────────────────────────────────────────── */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative mt-4 mx-4 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-[hsl(var(--navy-light))] p-6 text-primary-foreground">
        {/* subtle decorative circles */}
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div className="h-20 w-20 flex-shrink-0 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center overflow-hidden shadow-lg">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {profile.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl font-bold leading-tight truncate">
              {profile.name}
            </h1>
            {joinedYear && (
              <div className="flex items-center gap-1 mt-0.5 text-primary-foreground/70 text-xs">
                <CalendarDays className="h-3 w-3" />
                <span>Member since {joinedYear}</span>
              </div>
            )}
            {profile.bio && (
              <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed line-clamp-3">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mt-5 flex items-center justify-around border-t border-white/20 pt-4">
          <StatPill value={profile.reviewCount} label="Reviews" />
          <div className="h-8 w-px bg-white/20" />
          <StatPill value={reviews.length} label="Recent" />
          <div className="h-8 w-px bg-white/20" />
          <StatPill
            value={
              isOwnProfile ? "You" : profile.isFollowing ? "Following" : "—"
            }
            label="Status"
          />
        </div>
      </div>

      {/* ── Follow button (not shown on own profile) ──────────── */}
      {!isOwnProfile && (
        <div className="px-4 mt-4">
          <Button
            onClick={follow}
            disabled={followLoading}
            variant={profile.isFollowing ? "outline" : "default"}
            className={`w-full font-semibold gap-2 transition-all ${
              profile.isFollowing
                ? "border-secondary text-secondary hover:bg-secondary/10"
                : "bg-primary text-primary-foreground hover:bg-[hsl(var(--navy-light))]"
            }`}
          >
            {profile.isFollowing ? (
              <>
                <UserCheck className="h-4 w-4" />
                {followLoading ? "Updating…" : "Following"}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {followLoading ? "Updating…" : "Follow"}
              </>
            )}
          </Button>
        </div>
      )}

      {/* ── Own profile CTA ─────────────────────────────────── */}
      {isOwnProfile && (
        <div className="px-4 mt-4">
          <Link to="/profile">
            <Button
              variant="outline"
              className="w-full font-semibold gap-2 border-secondary text-secondary hover:bg-secondary/10"
            >
              <User className="h-4 w-4" />
              View your full profile
            </Button>
          </Link>
        </div>
      )}

      {/* ── Recent Reviews ───────────────────────────────────── */}
      <div className="px-4 mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Recent Reviews
        </h2>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <Link
              key={r.reviewId}
              to={`/venue/${r.placeId}`}
              className="block rounded-xl border border-border bg-card p-4 space-y-2 hover:border-secondary/50 hover:shadow-sm transition-all"
            >
              {/* Place name + category */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />
                  <span className="text-sm font-semibold text-foreground truncate">
                    {r.placeName}
                  </span>
                  {r.placeCategory && (
                    <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium flex-shrink-0">
                      {r.placeCategory}
                    </span>
                  )}
                </div>
                <StarRow rating={r.rating} />
              </div>

              {/* Comment */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {r.comment}
              </p>

              {/* Date */}
              <p className="text-xs text-muted-foreground/60">
                {new Date(r.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
