import { Monitor, Moon, Sun } from "lucide-react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./useTheme";
import type { ThemePreference } from "./theme.context";
import { useI18n } from "@/components/i18n";

type ThemeToggleMode = "segmented" | "compact";

interface ThemeToggleProps {
  mode?: ThemeToggleMode;
  className?: string;
  showCompactLabel?: boolean;
  compactIconClassName?: string;
  alwaysShowLabels?: boolean;
}

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  labelKey: string;
  descriptionKey: string;
  Icon: typeof Sun;
}> = [
  {
    value: "system",
    labelKey: "theme.option.system.label",
    descriptionKey: "theme.option.system.description",
    Icon: Monitor,
  },
  {
    value: "light",
    labelKey: "theme.option.light.label",
    descriptionKey: "theme.option.light.description",
    Icon: Sun,
  },
  {
    value: "dark",
    labelKey: "theme.option.dark.label",
    descriptionKey: "theme.option.dark.description",
    Icon: Moon,
  },
];

const NEXT_THEME_PREFERENCE: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const THEME_ICON: Record<ThemePreference, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

export function ThemeToggle({
  mode = "segmented",
  className,
  showCompactLabel = false,
  compactIconClassName,
  alwaysShowLabels = false,
}: ThemeToggleProps) {
  const { themePreference, setThemePreference } = useTheme();
  const { t, direction } = useI18n();

  const handleSegmentedKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();

    const currentIndex = THEME_OPTIONS.findIndex(
      (option) => option.value === themePreference,
    );

    if (event.key === "Home") {
      setThemePreference(THEME_OPTIONS[0].value);
      return;
    }

    if (event.key === "End") {
      setThemePreference(THEME_OPTIONS[THEME_OPTIONS.length - 1].value);
      return;
    }

    const isForwardKey =
      event.key === "ArrowDown" ||
      (direction === "rtl"
        ? event.key === "ArrowLeft"
        : event.key === "ArrowRight");

    const nextIndex = isForwardKey
      ? (currentIndex + 1) % THEME_OPTIONS.length
      : (currentIndex - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;

    setThemePreference(THEME_OPTIONS[nextIndex].value);
  };

  if (mode === "compact") {
    const CompactIcon = THEME_ICON[themePreference];
    const nextPreference = NEXT_THEME_PREFERENCE[themePreference];
    const currentDescription = t(
      `theme.option.${themePreference}.description`,
      undefined,
      "",
    );
    const nextDescription = t(
      `theme.option.${nextPreference}.description`,
      undefined,
      "",
    );

    // Better label for system mode
    const getCompactModeLabel = (): string => {
      if (themePreference === "system") {
        return t("theme.mode.system");
      }

      if (themePreference === "light") {
        return t("theme.mode.light");
      }

      return t("theme.mode.dark");
    };

    return (
      <button
        type="button"
        onClick={() => setThemePreference(nextPreference)}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-card/90 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
          showCompactLabel ? "min-w-fit gap-2 px-3" : "w-11",
          className,
        )}
        aria-label={t("theme.switcher", {
          current: currentDescription,
          next: nextDescription,
        })}
        title={t("theme.switcher", {
          current: currentDescription,
          next: nextDescription,
        })}
      >
        <CompactIcon
          className={cn("h-5 w-5 shrink-0", compactIconClassName)}
          aria-hidden="true"
        />
        {showCompactLabel && (
          <span className="truncate text-xs font-semibold tracking-[0.03em]">
            {getCompactModeLabel()}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex min-h-12 items-stretch gap-1 rounded-xl border border-slate-300/90 bg-slate-100/85 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/55",
        className,
      )}
      role="radiogroup"
      aria-label={t("theme.selector")}
      onKeyDown={handleSegmentedKeyDown}
    >
      {THEME_OPTIONS.map(({ value, labelKey, descriptionKey, Icon }) => {
        const isActive = themePreference === value;
        const label = t(labelKey);
        const description = t(descriptionKey);

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setThemePreference(value)}
            className={cn(
              "group relative inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "border-slate-400 bg-background text-foreground shadow-sm ring-1 ring-slate-300 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-background/70 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-white",
            )}
            aria-label={`${label}: ${description}`}
            title={description}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span
              className={cn(
                "truncate",
                alwaysShowLabels ? "inline" : "hidden sm:inline",
              )}
            >
              {label}
            </span>
            {value === "system" && !isActive && (
              <span
                className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-current opacity-50 transition-opacity group-hover:opacity-75"
                aria-hidden="true"
                title={t("theme.option.system.description")}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
