/**
 * Reported Content Page (Moderator)
 *
 * Handle user reports — view, investigate, resolve, or dismiss reports.
 */

import { useState, useEffect } from "react";
import {
  Search,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ArrowUpRight,
  Filter,
  MessageSquareWarning,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { moderatorMock } from "../mocks/moderatorMock";
import type { ReportedContent } from "../types";

const statusConfig: Record<
  ReportedContent["status"],
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  open: {
    label: "Open",
    class: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  investigating: {
    label: "Investigating",
    class: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    class: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  dismissed: {
    label: "Dismissed",
    class: "bg-gray-100 text-gray-500 border-gray-200",
    icon: XCircle,
  },
};

const priorityConfig: Record<
  ReportedContent["priority"],
  { label: string; class: string }
> = {
  high: { label: "High", class: "bg-red-500 text-white" },
  medium: { label: "Medium", class: "bg-amber-500 text-white" },
  low: { label: "Low", class: "bg-blue-400 text-white" },
};

const typeIcon: Record<ReportedContent["type"], typeof MessageSquareWarning> = {
  review: MessageSquareWarning,
  place: MapPin,
  user: User,
};

const ReportedContentPage = () => {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await moderatorMock.getReportedContent();
        setReports(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = async (
    reportId: string,
    status: ReportedContent["status"],
  ) => {
    await moderatorMock.updateReportStatus(reportId, status);
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status,
              ...(["resolved", "dismissed"].includes(status)
                ? { resolvedAt: new Date() }
                : {}),
            }
          : r,
      ),
    );
  };

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.reportedItemName.toLowerCase().includes(search.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const openCount = reports.filter((r) => r.status === "open").length;
  const investigatingCount = reports.filter(
    (r) => r.status === "investigating",
  ).length;

  if (loading) {
    return <LoadingSpinner size="md" text="Loading reports..." fullScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-secondary" />
          Reported Content
        </h1>
        <p className="text-sm text-muted-foreground">
          {openCount} open · {investigatingCount} investigating
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Status */}
          {["all", "open", "investigating", "resolved", "dismissed"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40",
                )}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Type:</span>
        {["all", "review", "place", "user"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              typeFilter === type
                ? "bg-secondary/20 text-secondary border-secondary/30"
                : "bg-card text-muted-foreground border-border hover:border-secondary/30",
            )}
          >
            {type === "all"
              ? "All Types"
              : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto" />
            <p className="text-muted-foreground font-medium">Queue is clear!</p>
            <p className="text-sm text-muted-foreground">
              No reports match your filters.
            </p>
          </div>
        ) : (
          filtered.map((report) => {
            const config = statusConfig[report.status];
            const StatusIcon = config.icon;
            const TypeIcon = typeIcon[report.type];
            const pConfig = priorityConfig[report.priority];
            const isExpanded = expandedId === report.id;
            const timeAgo = formatTimeAgo(report.createdAt);

            return (
              <div
                key={report.id}
                className={cn(
                  "p-4 rounded-xl bg-card border transition-all",
                  report.status === "open" && report.priority === "high"
                    ? "border-red-200 bg-red-50/30"
                    : report.status === "investigating"
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-border",
                )}
              >
                {/* Main Row */}
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div className="p-2 rounded-lg bg-muted/50 flex-shrink-0 mt-0.5">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {report.reportedItemName}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0", config.class)}
                      >
                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                        {config.label}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 border-0",
                          pConfig.class,
                        )}
                      >
                        {pConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reported by{" "}
                      <span className="font-medium">{report.reporterName}</span>{" "}
                      · {timeAgo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Reason:</span>{" "}
                      {report.reason}
                    </p>
                  </div>

                  {/* Expand / Actions */}
                  <div className="flex flex-shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : report.id)
                      }
                      className="text-xs gap-1 h-8"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isExpanded ? "Less" : "Details"}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    {report.resolvedAt && (
                      <p className="text-xs text-muted-foreground">
                        Resolved on{" "}
                        {report.resolvedAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}

                    {/* Action buttons */}
                    {(report.status === "open" ||
                      report.status === "investigating") && (
                      <div className="flex gap-2 flex-wrap">
                        {report.status === "open" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(report.id, "investigating")
                            }
                            className="text-xs gap-1 h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                          >
                            <Clock className="h-3.5 w-3.5" /> Investigate
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(report.id, "resolved")
                          }
                          className="text-xs gap-1 h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Resolve
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(report.id, "dismissed")
                          }
                          className="text-xs gap-1 h-8 text-gray-500 border-gray-200 hover:bg-gray-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Dismiss
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1 h-8 text-blue-600 border-blue-200 hover:bg-blue-50 ml-auto"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" /> Escalate to
                          Admin
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default ReportedContentPage;
