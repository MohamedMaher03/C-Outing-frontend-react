import { Ban, CheckCircle, AlertTriangle, Clock, XCircle } from "lucide-react";

export const userRoleBadge: Record<string, { label: string; class: string }> = {
  admin: { label: "Admin", class: "bg-red-100 text-red-700 border-red-200" },
  moderator: {
    label: "Moderator",
    class: "bg-blue-100 text-blue-700 border-blue-200",
  },
  user: { label: "User", class: "bg-gray-100 text-gray-700 border-gray-200" },
};

export const userStatusBadge: Record<
  string,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  active: { label: "Active", class: "text-emerald-600", icon: CheckCircle },
  banned: { label: "Banned", class: "text-red-600", icon: Ban },
  suspended: {
    label: "Suspended",
    class: "text-amber-600",
    icon: AlertTriangle,
  },
};

export const placeStatusConfig: Record<
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

export const reviewStatusConfig: Record<
  string,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  published: {
    label: "Published",
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
