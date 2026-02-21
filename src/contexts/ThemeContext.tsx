// /**
//  * Theme Context
//  * Manages global theme state and language (Arabic/English with RTL support)
//  */

// import React, { createContext, useContext, useState, useEffect } from "react";

// type Language = "ar" | "en";

// interface ThemeContextType {
//   language: Language;
//   setLanguage: (lang: Language) => void;
//   isDarkMode: boolean;
//   setIsDarkMode: (dark: boolean) => void;
//   isRTL: boolean;
// }

// export const ThemeContext = createContext<ThemeContextType | undefined>(
//   undefined,
// );

// export interface ThemeProviderProps {
//   children: React.ReactNode;
//   defaultLanguage?: Language;
// }

// /**
//  * ThemeProvider component
//  * Provides theme and language settings to entire app
//  */
// export function ThemeProvider({
//   children,
//   defaultLanguage = "en",
// }: ThemeProviderProps): React.ReactElement {
//   const [language, setLanguageState] = useState<Language>(defaultLanguage);
//   const [isDarkMode, setIsDarkModeState] = useState(false);

//   /**
//    * Load preferences from storage on mount
//    */
//   useEffect(() => {
//     const storedLanguage = localStorage.getItem("language") as Language;
//     const storedDarkMode = localStorage.getItem("darkMode");

//     if (storedLanguage) {
//       setLanguageState(storedLanguage);
//     }

//     if (storedDarkMode) {
//       setIsDarkModeState(JSON.parse(storedDarkMode));
//     }

//     // Apply RTL to document
//     document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
//     document.documentElement.lang = language;
//   }, []);

//   const setLanguage = (lang: Language): void => {
//     setLanguageState(lang);
//     localStorage.setItem("language", lang);
//     document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
//     document.documentElement.lang = lang;
//   };

//   const setIsDarkMode = (dark: boolean): void => {
//     setIsDarkModeState(dark);
//     localStorage.setItem("darkMode", JSON.stringify(dark));
//   };

//   const value: ThemeContextType = {
//     language,
//     setLanguage,
//     isDarkMode,
//     setIsDarkMode,
//     isRTL: language === "ar",
//   };

//   return (
//     <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
//   );
// }

// /**
//  * useTheme hook
//  * Access theme context anywhere in the app
//  */
// export function useTheme(): ThemeContextType {
//   const context = useContext(ThemeContext);
//   if (context === undefined) {
//     throw new Error("useTheme must be used within ThemeProvider");
//   }
//   return context;
// }
