/**
 * Admin Dashboard Page
 *
 * Overview of system-wide stats, recent activity, and quick actions.
 */

import {
  Users,
  MapPin,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";
import { type CSSProperties } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  AdminErrorBanner,
  AdminPageHeader,
  AdminPageLayout,
  AdminSection,
} from "@/features/admin/components";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";

const integerFormatter = new Intl.NumberFormat();

const activityDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const ADMIN_ACTIVITY_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "88px",
  contain: "layout paint style",
};

const activityIcons: Record<string, typeof Users> = {
  user_joined: UserPlus,
  review_posted: MessageSquare,
  place_added: MapPin,
  report_filed: AlertTriangle,
};

const activityColors: Record<string, string> = {
  user_joined: "bg-primary/10 text-primary",
  review_posted: "bg-secondary/18 text-foreground",
  place_added: "bg-muted text-foreground",
  report_filed: "bg-destructive/10 text-destructive",
};

const AdminDashboardPage = () => {
  const { stats, activity, loading, error, retry } = useAdminDashboard();

  if (loading) {
    return <LoadingSpinner size="md" text="Loading dashboard..." fullScreen />;
  }

  if (!stats) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <AdminErrorBanner
          title="Dashboard data unavailable"
          message={error ?? "Failed to load dashboard data."}
          onRetry={() => {
            void retry();
          }}
        />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Places",
      value: stats.totalPlaces,
      icon: MapPin,
      color: "bg-secondary/18 text-foreground",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "bg-muted text-foreground",
    },
    {
      label: "Open Reports",
      value: stats.totalReports,
      icon: AlertTriangle,
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: "Active Today",
      value: stats.activeUsersToday,
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "New This Week",
      value: stats.newUsersThisWeek,
      icon: UserPlus,
      color: "bg-secondary/18 text-foreground",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      color: "bg-secondary/25 text-foreground",
    },
    {
      label: "Resolved Reports",
      value: stats.resolvedReportsThisWeek,
      icon: CheckCircle,
      color: "bg-primary/15 text-primary",
    },
  ];

  const isHealthy =
    (stats.systemStatus ?? "Healthy").toLowerCase() === "healthy";
  const primaryStatCards = statCards.slice(0, 4);
  const secondaryStatCards = statCards.slice(4);

  return (
    <AdminPageLayout>
      <AdminPageHeader
        title="Admin Dashboard"
        description="System overview and moderation activity"
        meta={
          <p className="text-role-caption uppercase text-muted-foreground">
            {activity.length} events synced in this snapshot
          </p>
        }
      />

      <AdminErrorBanner
        title="Couldn't refresh dashboard data"
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:items-start">
        <AdminSection
          title="Core Metrics"
          description="Primary platform counts and growth indicators"
          tone="surface"
          contentClassName="gap-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {primaryStatCards.map((stat) => (
              <article
                key={stat.label}
                className="space-y-3 rounded-xl border border-border bg-background/45 p-4"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-role-subheading text-numeric-tabular text-foreground">
                    {integerFormatter.format(stat.value)}
                  </p>
                  <p className="text-role-caption text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {secondaryStatCards.map((stat) => (
              <article
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/20 px-3 py-3"
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${stat.color}`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-role-caption text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-role-secondary text-numeric-tabular font-semibold text-foreground">
                    {integerFormatter.format(stat.value)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </AdminSection>

        <AdminSection
          title="Recent Activity"
          description="Latest user and moderation events"
          tone="surface"
          contentClassName="gap-2"
        >
          {activity.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center">
              <p className="text-role-secondary text-muted-foreground">
                No recent activity has been recorded yet.
              </p>
            </div>
          ) : (
            <div className="max-h-[32rem] space-y-2 overflow-auto pr-1">
              {activity.map((item) => {
                const Icon = activityIcons[item.type] || Activity;
                const colorClass =
                  activityColors[item.type] || "bg-muted text-muted-foreground";

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-transparent p-3 transition-colors motion-reduce:transition-none hover:border-border hover:bg-muted/30"
                    style={ADMIN_ACTIVITY_ROW_STYLE}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-role-secondary text-foreground">
                        {item.description}
                      </p>
                      <p className="text-role-caption text-muted-foreground">
                        {activityDateTimeFormatter.format(
                          new Date(item.timestamp),
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AdminSection>
      </div>

      <AdminSection
        title="Operational Snapshot"
        description="Health and queue indicators for this reporting window"
        tone="muted"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-role-caption text-muted-foreground">
              Server Status
            </p>
            <p
              className={
                isHealthy
                  ? "mt-1 flex items-center gap-1 text-role-secondary font-semibold text-primary"
                  : "mt-1 flex items-center gap-1 text-role-secondary font-semibold text-destructive"
              }
            >
              <span
                className={
                  isHealthy
                    ? "h-2 w-2 rounded-full bg-primary"
                    : "h-2 w-2 rounded-full bg-destructive"
                }
              />
              {stats.systemStatus ?? "Unknown"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-role-caption text-muted-foreground">
              API Response Time
            </p>
            <p className="mt-1 text-role-secondary text-numeric-tabular font-semibold text-foreground">
              142ms
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-role-caption text-muted-foreground">
              Flagged Content
            </p>
            <p className="mt-1 text-role-secondary text-numeric-tabular font-semibold text-destructive">
              {stats.pendingReviews}
            </p>
          </div>
        </div>
      </AdminSection>
    </AdminPageLayout>
  );
};

export default AdminDashboardPage;
