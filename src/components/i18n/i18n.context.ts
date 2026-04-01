import { createContext } from "react";
import type { AppDirection, AppLanguage } from "./translations";

export interface I18nContextValue {
  language: AppLanguage;
  locale: string;
  direction: AppDirection;
  isArabic: boolean;
  setLanguage: (nextLanguage: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (
    key: string,
    values?: Record<string, string | number>,
    fallback?: string,
  ) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(
  undefined,
);
