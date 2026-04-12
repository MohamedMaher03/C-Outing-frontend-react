import { createContext } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (nextPreference: ThemePreference) => void;
  toggleTheme: () => void;
}

export const THEME_STORAGE_KEY = "c-outing-theme";

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);
