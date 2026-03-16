import {
  AlertTriangle,
  Ban,
  Compass,
  LocateFixed,
  MapPinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserLocationState } from "@/features/home/types";

interface LocationPermissionBannerProps {
  userLocation: UserLocationState;
  onEnableLocation: () => void;
  className?: string;
}

const CONTENT_BY_STATUS = {
  denied: {
    icon: Ban,
    title: "Location permission is blocked",
    description:
      "Tap here to retry location access. If blocked by the browser, enable location for this site in browser settings.",
    toneClassName: "border-amber-300 bg-amber-50 text-amber-900",
    actionLabel: "Retry location",
  },
  unsupported: {
    icon: MapPinOff,
    title: "Location is not supported on this browser",
    description:
      "Distance and Near Me sorting need geolocation support from your browser or device.",
    toneClassName: "border-slate-300 bg-slate-50 text-slate-700",
    actionLabel: "Try again",
  },
  unavailable: {
    icon: AlertTriangle,
    title: "Location is currently unavailable",
    description:
      "Tap to retry. Check that GPS/location services are enabled on your device.",
    toneClassName: "border-orange-300 bg-orange-50 text-orange-900",
    actionLabel: "Retry now",
  },
  error: {
    icon: Compass,
    title: "Could not access your location",
    description: "Tap to try again and allow location if prompted.",
    toneClassName: "border-rose-300 bg-rose-50 text-rose-900",
    actionLabel: "Enable location",
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
  if (!shouldRenderBanner(userLocation.status)) {
    return null;
  }

  const content = CONTENT_BY_STATUS[userLocation.status];
  const Icon = content.icon;

  return (
    <button
      type="button"
      onClick={onEnableLocation}
      className={cn(
        "w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
        content.toneClassName,
        className,
      )}
      aria-label={`${content.title}. ${content.description}`}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-white/60">
          <Icon className="h-4.5 w-4.5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold tracking-tight">
            {content.title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-90">
            {userLocation.message ?? content.description}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-current/30 bg-white/70 px-3 py-1.5 text-[11px] font-bold">
          <LocateFixed className="h-3 w-3" />
          {content.actionLabel}
        </span>
      </div>
    </button>
  );
};

export default LocationPermissionBanner;
