import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/components/i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
