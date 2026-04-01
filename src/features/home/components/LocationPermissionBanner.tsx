import {
  AlertTriangle,
  Ban,
  Compass,
  LocateFixed,
  MapPinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n";
import type { UserLocationState } from "@/features/home/types";

interface LocationPermissionBannerProps {
  userLocation: UserLocationState;
  onEnableLocation: () => void;
  className?: string;
}

const CONTENT_BY_STATUS = {
  denied: {
    icon: Ban,
    titleKey: "home.location.denied.title",
    descriptionKey: "home.location.denied.description",
    toneClassName:
      "border-amber-300/80 bg-amber-50/90 text-amber-900 dark:border-amber-300/35 dark:bg-amber-500/12 dark:text-amber-100",
    actionLabelKey: "home.location.denied.action",
  },
  unsupported: {
    icon: MapPinOff,
    titleKey: "home.location.unsupported.title",
    descriptionKey: "home.location.unsupported.description",
    toneClassName:
      "border-slate-300/80 bg-slate-50/90 text-slate-800 dark:border-slate-300/30 dark:bg-slate-400/10 dark:text-slate-200",
    actionLabelKey: "home.location.unsupported.action",
  },
  unavailable: {
    icon: AlertTriangle,
    titleKey: "home.location.unavailable.title",
    descriptionKey: "home.location.unavailable.description",
    toneClassName:
      "border-orange-300/80 bg-orange-50/90 text-orange-900 dark:border-orange-300/35 dark:bg-orange-500/12 dark:text-orange-100",
    actionLabelKey: "home.location.unavailable.action",
  },
  error: {
    icon: Compass,
    titleKey: "home.location.error.title",
    descriptionKey: "home.location.error.description",
    toneClassName:
      "border-rose-300/80 bg-rose-50/90 text-rose-900 dark:border-rose-300/35 dark:bg-rose-500/12 dark:text-rose-100",
    actionLabelKey: "home.location.error.action",
  },
} as const;

const shouldRenderBanner = (status: UserLocationState["status"]) =>
  status === "denied" ||
  status === "unsupported" ||
  status === "unavailable" ||
  status === "error";

const LocationPermissionBanner = ({
  userLocation,
  onEnableLocation,
  className,
}: LocationPermissionBannerProps) => {
  const { t } = useI18n();

  if (!shouldRenderBanner(userLocation.status)) {
    return null;
  }

  const content = CONTENT_BY_STATUS[userLocation.status];
  const Icon = content.icon;
  const title = t(content.titleKey);
  const description = t(content.descriptionKey);
  const actionLabel = t(content.actionLabelKey);

  return (
    <button
      type="button"
      onClick={onEnableLocation}
      className={cn(
        "w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
        content.toneClassName,
        className,
      )}
      aria-label={`${title}. ${description}`}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-background/75">
          <Icon className="h-4.5 w-4.5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold tracking-tight text-safe-wrap">
            {title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-90 text-safe-wrap sm:text-sm">
            {description}
          </p>
        </div>

        <span className="inline-flex min-h-9 items-center gap-1 rounded-full border border-current/30 bg-background/80 px-3 py-1.5 text-xs font-bold">
          <LocateFixed className="h-3 w-3" />
          {actionLabel}
        </span>
      </div>
    </button>
  );
};

export default LocationPermissionBanner;
