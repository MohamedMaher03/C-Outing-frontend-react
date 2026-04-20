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
import { type CSSProperties, useMemo } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  AdminErrorBanner,
  AdminPageHeader,
  AdminPageLayout,
  AdminSection,
} from "@/features/admin/components";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { useI18n } from "@/components/i18n";

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
  const { t, locale, formatNumber } = useI18n();
  const { stats, activity, loading, error, retry } = useAdminDashboard();

  const activityDateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  if (loading) {
    return (
      <LoadingSpinner
        size="md"
        text={t("admin.dashboard.loading")}
        fullScreen
      />
    );
  }

  if (!stats) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <AdminErrorBanner
          title={t("admin.dashboard.unavailableTitle")}
          message={error ?? t("admin.dashboard.unavailableMessage")}
          onRetry={() => {
            void retry();
          }}
        />
      </div>
    );
  }

  const statCards = [
    {
      label: t("admin.dashboard.stat.totalUsers"),
      value: stats.totalUsers,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: t("admin.dashboard.stat.totalPlaces"),
      value: stats.totalPlaces,
      icon: MapPin,
      color: "bg-secondary/18 text-foreground",
    },
    {
      label: t("admin.dashboard.stat.totalReviews"),
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "bg-muted text-foreground",
    },
    {
      label: t("admin.dashboard.stat.openReports"),
      value: stats.totalReports,
      icon: AlertTriangle,
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: t("admin.dashboard.stat.activeToday"),
      value: stats.activeUsersToday,
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
    },
    {
      label: t("admin.dashboard.stat.newThisWeek"),
      value: stats.newUsersThisWeek,
      icon: UserPlus,
      color: "bg-secondary/18 text-foreground",
    },
    {
      label: t("admin.dashboard.stat.pendingReviews"),
      value: stats.pendingReviews,
      icon: Clock,
      color: "bg-secondary/25 text-foreground",
    },
    {
      label: t("admin.dashboard.stat.resolvedReports"),
      value: stats.resolvedReportsThisWeek,
      icon: CheckCircle,
      color: "bg-primary/15 text-primary",
    },
  ];

  const normalizedSystemStatus = (
    stats.systemStatus ?? "healthy"
  ).toLowerCase();
  const isHealthy = normalizedSystemStatus === "healthy";
  const systemStatusLabel =
    normalizedSystemStatus === "healthy"
      ? t("admin.status.healthy")
      : normalizedSystemStatus === "degraded"
        ? t("admin.status.degraded")
        : normalizedSystemStatus === "down"
          ? t("admin.status.down")
          : (stats.systemStatus ?? t("admin.status.unknown"));
  const primaryStatCards = statCards.slice(0, 4);
  const secondaryStatCards = statCards.slice(4);

  return (
    <AdminPageLayout>
      <AdminPageHeader
        title={t("admin.dashboard.header.title")}
        description={t("admin.dashboard.header.description")}
        meta={
          <p className="text-role-caption uppercase text-muted-foreground">
            {t("admin.dashboard.header.syncedEvents", {
              count: formatNumber(activity.length),
            })}
          </p>
        }
      />

      <AdminErrorBanner
        title={t("admin.dashboard.errorRefreshTitle")}
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:items-start">
        <AdminSection
          title={t("admin.dashboard.section.coreMetrics.title")}
          description={t("admin.dashboard.section.coreMetrics.description")}
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
                    {formatNumber(stat.value)}
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
                    {formatNumber(stat.value)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </AdminSection>

        <AdminSection
          title={t("admin.dashboard.section.recentActivity.title")}
          description={t("admin.dashboard.section.recentActivity.description")}
          tone="surface"
          contentClassName="gap-2"
        >
          {activity.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center">
              <p className="text-role-secondary text-muted-foreground">
                {t("admin.dashboard.section.recentActivity.empty")}
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
        title={t("admin.dashboard.section.operational.title")}
        description={t("admin.dashboard.section.operational.description")}
        tone="muted"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-role-caption text-muted-foreground">
              {t("admin.dashboard.operational.serverStatus")}
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
              {systemStatusLabel}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-role-caption text-muted-foreground">
              {t("admin.dashboard.operational.apiResponse")}
            </p>
            <p className="mt-1 text-role-secondary text-numeric-tabular font-semibold text-foreground">
              {t("admin.dashboard.operational.apiResponseValue")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-role-caption text-muted-foreground">
              {t("admin.dashboard.operational.flaggedContent")}
            </p>
            <p className="mt-1 text-role-secondary text-numeric-tabular font-semibold text-destructive">
              {formatNumber(stats.pendingReviews)}
            </p>
          </div>
        </div>
      </AdminSection>
    </AdminPageLayout>
  );
};

export default AdminDashboardPage;
