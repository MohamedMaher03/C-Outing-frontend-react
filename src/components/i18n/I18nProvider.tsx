import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { I18nContext } from "./i18n.context";
import {
  I18N_STORAGE_KEY,
  TRANSLATIONS,
  getLanguageDirection,
  isAppLanguage,
  type AppLanguage,
} from "./translations";

interface I18nProviderProps {
  children: ReactNode;
}

const formatTemplate = (
  template: string,
  values?: Record<string, string | number>,
): string => {
  if (!values) {
    return template;
  }

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, token: string) => {
    const value = values[token];
    return value === undefined ? `{${token}}` : String(value);
  });
};

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === "undefined") {
    return "en";
  }

  try {
    const stored = window.localStorage.getItem(I18N_STORAGE_KEY);
    if (isAppLanguage(stored)) {
      return stored;
    }
  } catch {
    // Fallback to browser language when storage is unavailable.
  }

  const browserLanguage = window.navigator.language?.toLowerCase() ?? "en";
  return browserLanguage.startsWith("ar") ? "ar" : "en";
};

const getLocaleFromLanguage = (language: AppLanguage): string =>
  language === "ar" ? "ar-EG" : "en-US";

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] =
    useState<AppLanguage>(getInitialLanguage);

  const direction = useMemo(() => getLanguageDirection(language), [language]);
  const locale = useMemo(() => getLocaleFromLanguage(language), [language]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.dir = direction;
    root.dataset.language = language;
    root.dataset.direction = direction;
  }, [direction, language]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== I18N_STORAGE_KEY) {
        return;
      }

      const nextLanguage = isAppLanguage(event.newValue)
        ? event.newValue
        : "en";
      setLanguageState(nextLanguage);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);

    try {
      window.localStorage.setItem(I18N_STORAGE_KEY, nextLanguage);
    } catch {
      // Keep state in memory if storage access fails.
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "ar" : "en");
  }, [language, setLanguage]);

  const t = useCallback(
    (
      key: string,
      values?: Record<string, string | number>,
      fallback?: string,
    ): string => {
      const localized = TRANSLATIONS[language][key];
      const englishFallback = TRANSLATIONS.en[key];
      const template = localized ?? englishFallback ?? fallback ?? key;
      return formatTemplate(template, values);
    },
    [language],
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string =>
      new Intl.NumberFormat(locale, options).format(value),
    [locale],
  );

  const contextValue = useMemo(
    () => ({
      language,
      locale,
      direction,
      isArabic: language === "ar",
      setLanguage,
      toggleLanguage,
      t,
      formatNumber,
    }),
    [direction, formatNumber, language, locale, setLanguage, t, toggleLanguage],
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}
