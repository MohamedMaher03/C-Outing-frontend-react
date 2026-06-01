import { type CSSProperties } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  AdminErrorBanner,
  AdminPageHeader,
  AdminPageLayout,
  AdminSection,
} from "@/features/admin/components";
import { useAdminDashboardPage } from "@/features/admin/hooks/useAdminDashboardPage";
import {
  ADMIN_ACTIVITY_ROW_INTRINSIC_SIZE,
  resolveAdminActivityVisuals,
} from "@/features/admin/utils/adminDashboardPresentation";

const ADMIN_ACTIVITY_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: ADMIN_ACTIVITY_ROW_INTRINSIC_SIZE,
  contain: "layout paint style",
};

const AdminDashboardPage = () => {
  const {
    t,
    formatNumber,
    stats,
    activity,
    loading,
    error,
    primaryMetricCards,
    secondaryMetricCards,
    operationalHealth,
    formatActivityTimestamp,
    retryDashboard,
  } = useAdminDashboardPage();

  if (loading) {
    return (
      <LoadingSpinner
        size="md"
        text={t("admin.dashboard.loading")}
        fullScreen
      />
    );
  }

  if (!stats || !operationalHealth) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <AdminErrorBanner
          title={t("admin.dashboard.unavailableTitle")}
          message={error ?? t("admin.dashboard.unavailableMessage")}
          onRetry={retryDashboard}
        />
      </div>
    );
  }

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
        onRetry={retryDashboard}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:items-start">
        <AdminSection
          title={t("admin.dashboard.section.coreMetrics.title")}
          description={t("admin.dashboard.section.coreMetrics.description")}
          tone="surface"
          contentClassName="gap-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {primaryMetricCards.map((stat) => (
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
            {secondaryMetricCards.map((stat) => (
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
                const { Icon, toneClass } = resolveAdminActivityVisuals(
                  item.type,
                );

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-transparent p-3 transition-colors motion-reduce:transition-none hover:border-border hover:bg-muted/30"
                    style={ADMIN_ACTIVITY_ROW_STYLE}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${toneClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-role-secondary text-foreground">
                        {item.description}
                      </p>
                      <p className="text-role-caption text-muted-foreground">
                        {formatActivityTimestamp(item.timestamp)}
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
                operationalHealth.isHealthy
                  ? "mt-1 flex items-center gap-1 text-role-secondary font-semibold text-primary"
                  : "mt-1 flex items-center gap-1 text-role-secondary font-semibold text-destructive"
              }
            >
              <span
                className={
                  operationalHealth.isHealthy
                    ? "h-2 w-2 rounded-full bg-primary"
                    : "h-2 w-2 rounded-full bg-destructive"
                }
              />
              {operationalHealth.statusLabel}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-role-caption text-muted-foreground">
              {t("admin.dashboard.operational.apiResponse")}
            </p>
            <p className="mt-1 text-role-secondary text-numeric-tabular font-semibold text-foreground">
              {operationalHealth.healthTimestampLabel}
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
