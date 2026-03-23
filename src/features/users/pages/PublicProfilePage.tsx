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
  Mail,
  BadgeCheck,
  ShieldAlert,
  Activity,
  Sparkles,
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

function roleLabel(role?: number): string {
  switch (role) {
    case 1:
      return "User";
    case 2:
      return "Moderator";
    case 3:
      return "Admin";
    default:
      return "Member";
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { profile, reviews, loading, error, isOwnProfile, reload } =
    usePublicProfile(id ?? "");

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

  const safeAge = typeof profile.age === "number" ? profile.age : null;
  const hasVerifiedEmail = !!profile.isEmailVerified;
  const isBanned = !!profile.isBanned;

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
      <div className="relative mt-4 mx-4 rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-[hsl(var(--navy-light))] to-primary p-6 text-primary-foreground shadow-xl">
        {/* subtle decorative circles */}
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute top-6 right-6 hidden sm:flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          Public Profile
        </div>

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
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 font-medium">
                {roleLabel(profile.role)}
              </span>
              {safeAge !== null && (
                <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 font-medium">
                  Age {safeAge}
                </span>
              )}
              {hasVerifiedEmail && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/20 px-2.5 py-1 font-medium">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
              {isBanned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-300/20 px-2.5 py-1 font-medium">
                  <ShieldAlert className="h-3 w-3" />
                  Restricted
                </span>
              )}
            </div>
            {joinedYear && (
              <div className="flex items-center gap-1 mt-0.5 text-primary-foreground/70 text-xs">
                <CalendarDays className="h-3 w-3" />
                <span>Member since {joinedYear}</span>
              </div>
            )}
            {profile.email && (
              <div className="mt-1 flex items-center gap-1 text-primary-foreground/75 text-xs truncate">
                <Mail className="h-3 w-3" />
                <span className="truncate">{profile.email}</span>
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
            value={profile.totalInteractions ?? "—"}
            label="Interactions"
          />
        </div>
      </div>

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

      {!isOwnProfile && (
        <div className="px-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Community activity snapshot
              </p>
              <p className="text-xs text-muted-foreground">
                This page is powered by profile + review history from backend.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void reload()}
              className="gap-1.5"
            >
              <Activity className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
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
                </div>
                <StarRow rating={r.rating} />
              </div>

              {/* Comment */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {r.comment}
              </p>

              {typeof r.sentimentScore === "number" && (
                <div className="inline-flex rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">
                  Sentiment score: {r.sentimentScore.toFixed(1)}
                </div>
              )}

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
