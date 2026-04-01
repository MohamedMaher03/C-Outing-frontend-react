import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  ThemeContext,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme.context";

const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

const getSystemResolvedTheme = (): ResolvedTheme => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
};

const resolveTheme = (
  themePreference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme =>
  themePreference === "system" ? systemTheme : themePreference;

const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(storedPreference)) {
      return storedPreference;
    }
  } catch {
    // Fallback to system theme if storage is unavailable.
  }

  return "system";
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    getStoredThemePreference,
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(
    getSystemResolvedTheme,
  );

  const resolvedTheme = useMemo(
    () => resolveTheme(themePreference, systemTheme),
    [themePreference, systemTheme],
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      const nextPreference = isThemePreference(event.newValue)
        ? event.newValue
        : "system";

      setThemePreferenceState(nextPreference);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    root.dataset.themePreference = themePreference;
    root.dataset.theme = resolvedTheme;
  }, [resolvedTheme, themePreference]);

  const setThemePreference = useCallback((nextPreference: ThemePreference) => {
    setThemePreferenceState(nextPreference);

    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // Ignore storage failures and keep theme state in memory.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setThemePreference]);

  const contextValue = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference,
      toggleTheme,
    }),
    [themePreference, resolvedTheme, setThemePreference, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
