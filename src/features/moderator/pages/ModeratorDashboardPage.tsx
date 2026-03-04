/**
 * Moderator Dashboard Page
 *
 * Overview of moderation queue, stats, and recent actions.
 */

import {
  MessageSquare,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Activity,
  TrendingUp,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useModeratorDashboard } from "@/features/moderator/hooks/useModeratorDashboard";

const ModeratorDashboardPage = () => {
  const { stats, actions, loading } = useModeratorDashboard();

  if (loading || !stats) {
    return <LoadingSpinner size="md" text="Loading dashboard..." fullScreen />;
  }

  const statCards = [
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Flagged Places",
      value: stats.flaggedPlaces,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Open Reports",
      value: stats.openReports,
      icon: MessageSquare,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Resolved Today",
      value: stats.resolvedToday,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Resolved This Week",
      value: stats.resolvedThisWeek,
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Moderated",
      value: stats.totalModerated,
      icon: Shield,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const actionIcons: Record<string, typeof CheckCircle> = {
    approved: CheckCircle,
    removed: AlertTriangle,
    warned: MessageSquare,
    escalated: Shield,
  };

  const actionColors: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-600",
    removed: "bg-red-100 text-red-600",
    warned: "bg-amber-100 text-amber-600",
    escalated: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-secondary" />
          Moderator Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Content moderation overview and queue status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                stat.color,
              )}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/moderator/reviews"
          className="bg-card border border-border rounded-xl p-5 hover:border-secondary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">
                Review Queue
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.pendingReviews} pending
              </p>
            </div>
          </div>
        </a>

        <a
          href="/moderator/places"
          className="bg-card border border-border rounded-xl p-5 hover:border-secondary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">
                Flagged Places
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.flaggedPlaces} to review
              </p>
            </div>
          </div>
        </a>

        <a
          href="/moderator/reports"
          className="bg-card border border-border rounded-xl p-5 hover:border-secondary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">
                Reports
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.openReports} open
              </p>
            </div>
          </div>
        </a>
      </div>

      {/* Recent Actions */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" />
          <h2 className="text-base font-semibold text-foreground">
            Recent Actions
          </h2>
        </div>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = actionIcons[action.action] || Activity;
            const colorClass =
              actionColors[action.action] || "bg-muted text-muted-foreground";
            return (
              <div
                key={action.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    colorClass,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{action.moderatorName}</span>{" "}
                    <span className="text-muted-foreground">
                      {action.action}
                    </span>{" "}
                    <span className="font-medium">{action.itemName}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      ({action.itemType})
                    </span>
                  </p>
                  {action.note && (
                    <p className="text-xs text-muted-foreground mt-0.5 italic">
                      "{action.note}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(action.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboardPage;
