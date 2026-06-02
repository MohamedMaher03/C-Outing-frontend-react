const getCurrentLocale = (): string => {
  if (typeof document !== "undefined") {
    const current = document.documentElement.lang?.trim();
    if (current) {
      return current;
    }
  }

  if (typeof navigator !== "undefined") {
    return navigator.language || "en-US";
  }

  return "en-US";
};

export function formatRating(rating: number, decimals: number = 2): string {
  return rating.toFixed(decimals);
}

export function formatSentiment(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

export function formatDate(
  date: Date | string,
  locale: string = getCurrentLocale(),
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString(locale);
}

export function formatTime(
  date: Date | string,
  locale: string = getCurrentLocale(),
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, Math.max(0, delay));
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastExecutionAt = 0;

  return (...args: Parameters<T>) => {
    const currentTimestamp = Date.now();
    if (currentTimestamp - lastExecutionAt >= Math.max(0, delay)) {
      lastExecutionAt = currentTimestamp;
      fn(...args);
    }
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((nameSegment) => nameSegment[0])
    .filter((symbol): symbol is string => typeof symbol === "string")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getTranslatedText(
  translationKey: string | undefined,
  fallbackText: string,
  t:
    | ((
        key: string,
        values?: Record<string, string | number>,
        fallback?: string,
      ) => string)
    | null,
): string {
  if (!translationKey || typeof t !== "function") {
    return fallbackText;
  }

  const translatedLabel = t(translationKey, undefined, fallbackText);
  return translatedLabel.trim().length > 0 ? translatedLabel : fallbackText;
}
