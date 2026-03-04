/**
 * Admin Dashboard Page
 *
 * Overview of system-wide stats, recent activity, and quick actions.
 * Design follows the project's card-based layout with secondary (gold) accents.
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
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";

const AdminDashboardPage = () => {
  const { stats, activity, loading } = useAdminDashboard();

  if (loading || !stats) {
    return <LoadingSpinner size="md" text="Loading dashboard..." fullScreen />;
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Places",
      value: stats.totalPlaces,
      icon: MapPin,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Open Reports",
      value: stats.totalReports,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Active Today",
      value: stats.activeUsersToday,
      icon: TrendingUp,
      color: "bg-teal-100 text-teal-600",
    },
    {
      label: "New This Week",
      value: stats.newUsersThisWeek,
      icon: UserPlus,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Resolved Reports",
      value: stats.resolvedReportsThisWeek,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  const activityIcons: Record<string, typeof Users> = {
    user_joined: UserPlus,
    review_posted: MessageSquare,
    place_added: MapPin,
    report_filed: AlertTriangle,
  };

  const activityColors: Record<string, string> = {
    user_joined: "bg-blue-100 text-blue-600",
    review_posted: "bg-purple-100 text-purple-600",
    place_added: "bg-green-100 text-green-600",
    report_filed: "bg-red-100 text-red-600",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          System overview and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" />
          <h2 className="text-base font-semibold text-foreground">
            Recent Activity
          </h2>
        </div>
        <div className="space-y-3">
          {activity.map((item) => {
            const Icon = activityIcons[item.type] || Activity;
            const colorClass =
              activityColors[item.type] || "bg-muted text-muted-foreground";
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleDateString("en-US", {
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

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            System Health
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Server Status
              </span>
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                API Response Time
              </span>
              <span className="text-sm font-medium text-foreground">142ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="text-sm font-medium text-foreground">99.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Content Overview
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Active Places
              </span>
              <span className="text-sm font-medium text-foreground">
                {stats.totalPlaces}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Reviews Today
              </span>
              <span className="text-sm font-medium text-foreground">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Flagged Content
              </span>
              <span className="text-sm font-medium text-amber-600">
                {stats.pendingReviews}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
