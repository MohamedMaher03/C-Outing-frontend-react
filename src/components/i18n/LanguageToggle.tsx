import { cn } from "@/lib/utils";
import { useI18n } from "./useI18n";
import {
  LANGUAGE_LABEL,
  LANGUAGE_NATIVE_LABEL,
  type AppLanguage,
} from "./translations";

type LanguageToggleMode = "segmented" | "compact";

interface LanguageToggleProps {
  mode?: LanguageToggleMode;
  className?: string;
  showCompactLabel?: boolean;
}

const LANGUAGE_OPTIONS: AppLanguage[] = ["en", "ar"];

const SHORT_LABEL: Record<AppLanguage, string> = {
  en: "EN",
  ar: "AR",
};

export function LanguageToggle({
  mode = "segmented",
  className,
  showCompactLabel = false,
}: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage, t } = useI18n();

  if (mode === "compact") {
    const nextLanguage: AppLanguage = language === "en" ? "ar" : "en";

    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-card/90 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
          showCompactLabel ? "min-w-fit gap-2 px-3" : "w-11",
          className,
        )}
        aria-label={t("language.switchTo", {
          language: LANGUAGE_LABEL[nextLanguage],
        })}
        title={t("language.current", {
          language: LANGUAGE_LABEL[language],
        })}
      >
        <span className="text-xs font-semibold tracking-[0.03em]">
          {SHORT_LABEL[language]}
        </span>
        {showCompactLabel && (
          <span className="text-xs font-semibold tracking-[0.03em]">
            {LANGUAGE_NATIVE_LABEL[language]}
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
      aria-label={t("common.language")}
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = option === language;

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setLanguage(option)}
            className={cn(
              "group relative inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "border-slate-400 bg-background text-foreground shadow-sm ring-1 ring-slate-300 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-background/70 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-white",
            )}
            aria-label={LANGUAGE_LABEL[option]}
            title={LANGUAGE_LABEL[option]}
          >
            <span>{SHORT_LABEL[option]}</span>
          </button>
        );
      })}
    </div>
  );
}
