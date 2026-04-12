/**
 * Moderator Dashboard Page
 *
 * Overview of moderation queue, stats, and recent actions.
 */

import {
  Shield,
  Activity,
  MapPin,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModeratorDashboard } from "@/features/moderator/hooks/useModeratorDashboard";
import {
  moderationActionColor,
  moderationActionIcon,
} from "@/features/moderator/constants/statusConfigs";
import {
  ModeratorEmptyState,
  ModeratorErrorBanner,
  ModeratorPageHeader,
  ModeratorPageLayout,
  ModeratorSection,
} from "@/features/moderator/components";
import {
  formatCount,
  formatDateTime,
} from "@/features/moderator/utils/formatters";
import { useI18n } from "@/components/i18n";

const ModeratorDashboardPage = () => {
  const { t, locale } = useI18n();
  const { stats, actions, loading, error, retry } = useModeratorDashboard();

  if (loading) {
    return (
      <LoadingSpinner
        size="md"
        text={t("moderator.dashboard.loading")}
        fullScreen
      />
    );
  }

  if (!stats) {
    return (
      <ModeratorPageLayout
        maxWidth="4xl"
        className="min-h-[50vh] justify-center"
      >
        <ModeratorEmptyState
          icon={AlertTriangle}
          title={t("moderator.dashboard.unavailableTitle")}
          description={error ?? t("moderator.dashboard.unavailableMessage")}
          action={
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => {
                void retry();
              }}
            >
              {t("common.retry")}
            </Button>
          }
        />
      </ModeratorPageLayout>
    );
  }

  const statCards = [
    {
      label: t("moderator.dashboard.stat.pendingReviews"),
      value: stats.pendingReviews,
      icon: MessageSquare,
      color: "bg-secondary/18 text-foreground",
    },
    {
      label: t("moderator.dashboard.stat.flaggedPlaces"),
      value: stats.flaggedPlaces,
      icon: AlertTriangle,
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: t("moderator.dashboard.stat.openReports"),
      value: stats.openReports,
      icon: Shield,
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: t("moderator.dashboard.stat.resolvedToday"),
      value: stats.resolvedToday,
      icon: Activity,
      color: "bg-primary/10 text-primary",
    },
    {
      label: t("moderator.dashboard.stat.resolvedThisWeek"),
      value: stats.resolvedThisWeek,
      icon: Activity,
      color: "bg-primary/10 text-primary",
    },
    {
      label: t("moderator.dashboard.stat.totalModerated"),
      value: stats.totalModerated,
      icon: Shield,
      color: "bg-primary/20 text-primary",
    },
  ];

  const quickLinks = [
    {
      label: t("moderator.dashboard.quick.reviewQueue"),
      subtitle: t("moderator.dashboard.quick.pending", {
        count: formatCount(stats.pendingReviews, locale),
      }),
      to: "/moderator/reviews",
      icon: MessageSquare,
      iconClass: "bg-secondary/18 text-foreground",
    },
    {
      label: t("moderator.dashboard.quick.flaggedPlaces"),
      subtitle: t("moderator.dashboard.quick.toReview", {
        count: formatCount(stats.flaggedPlaces, locale),
      }),
      to: "/moderator/places",
      icon: MapPin,
      iconClass: "bg-destructive/10 text-destructive",
    },
    {
      label: t("moderator.dashboard.quick.reports"),
      subtitle: t("moderator.dashboard.quick.open", {
        count: formatCount(stats.openReports, locale),
      }),
      to: "/moderator/reports",
      icon: AlertTriangle,
      iconClass: "bg-destructive/10 text-destructive",
    },
  ];

  const primaryStatCards = statCards.slice(0, 3);
  const secondaryStatCards = statCards.slice(3);

  return (
    <ModeratorPageLayout>
      <ModeratorPageHeader
        title={t("moderator.dashboard.header.title")}
        description={t("moderator.dashboard.header.description")}
        icon={Shield}
      />

      <ModeratorErrorBanner
        title={t("moderator.dashboard.errorRefreshTitle")}
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:items-start">
        <ModeratorSection
          tone="surface"
          title={t("moderator.dashboard.section.queue.title")}
          description={t("moderator.dashboard.section.queue.description")}
          contentClassName="gap-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {primaryStatCards.map((stat) => (
              <article
                key={stat.label}
                className="space-y-3 rounded-xl border border-border bg-background/45 p-4"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    stat.color,
                  )}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-role-subheading text-numeric-tabular font-bold text-foreground">
                    {formatCount(stat.value, locale)}
                  </p>
                  <p className="text-role-caption text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {secondaryStatCards.map((stat) => (
              <article
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/20 px-3 py-3"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                    stat.color,
                  )}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-role-caption text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-role-secondary text-numeric-tabular font-semibold text-foreground">
                    {formatCount(stat.value, locale)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </ModeratorSection>

        <ModeratorSection
          tone="surface"
          title={t("moderator.dashboard.section.quickNavigation.title")}
          description={t(
            "moderator.dashboard.section.quickNavigation.description",
          )}
          contentClassName="gap-3"
        >
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card/70 p-4 transition-all motion-reduce:transition-none hover:border-secondary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    link.iconClass,
                  )}
                >
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-role-secondary font-semibold text-foreground transition-colors group-hover:text-secondary">
                    {link.label}
                  </p>
                  <p className="truncate text-role-caption text-muted-foreground">
                    {link.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-role-caption font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
                {t("moderator.dashboard.quick.openAction")}
              </span>
            </Link>
          ))}
        </ModeratorSection>
      </div>

      <ModeratorSection
        tone="muted"
        title={t("moderator.dashboard.section.recentActions.title")}
        description={t("moderator.dashboard.section.recentActions.description")}
        contentClassName="gap-2"
      >
        {actions.length === 0 ? (
          <ModeratorEmptyState
            icon={Activity}
            title={t("moderator.dashboard.section.recentActions.emptyTitle")}
            description={t(
              "moderator.dashboard.section.recentActions.emptyDescription",
            )}
          />
        ) : (
          <div className="max-h-[32rem] space-y-2 overflow-auto pr-1">
            {actions.map((action) => {
              const Icon = moderationActionIcon[action.action] || Activity;
              const colorClass =
                moderationActionColor[action.action] ||
                "bg-muted text-muted-foreground";

              return (
                <div
                  key={action.id}
                  className="flex items-start gap-3 rounded-lg border border-transparent p-3 transition-colors motion-reduce:transition-none hover:border-border hover:bg-muted/30"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                      colorClass,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-role-secondary text-foreground break-words">
                      <span className="font-medium">
                        {action.moderatorName}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {t(
                          `moderator.dashboard.action.${action.action}`,
                          undefined,
                          action.action,
                        )}
                      </span>{" "}
                      <span className="font-medium">{action.itemName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        (
                        {t(
                          `moderator.dashboard.itemType.${action.itemType}`,
                          undefined,
                          action.itemType,
                        )}
                        )
                      </span>
                    </p>
                    {action.note ? (
                      <p className="mt-0.5 text-role-caption italic text-muted-foreground break-words">
                        "{action.note}"
                      </p>
                    ) : null}
                    <p className="mt-0.5 text-role-caption text-muted-foreground">
                      {formatDateTime(action.timestamp, locale)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ModeratorSection>
    </ModeratorPageLayout>
  );
};

export default ModeratorDashboardPage;
