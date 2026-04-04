import type { ReactNode } from "react";
import logo from "@/assets/images/logo6.png";
import cairoBg from "@/assets/images/cairo-bg.jpg";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageToggle } from "@/components/i18n";

type AuthShellProps = {
  children: ReactNode;
  maxWidth?: "lg" | "2xl" | "4xl";
  logoSrc?: string;
};

const MAX_WIDTH_CLASS: Record<
  NonNullable<AuthShellProps["maxWidth"]>,
  string
> = {
  lg: "max-w-lg",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
};

export const AuthShell = ({
  children,
  maxWidth = "lg",
  logoSrc = logo,
}: AuthShellProps) => {
  return (
    <div className="relative flex min-h-[100svh] w-full items-start justify-center overflow-y-auto py-5 sm:items-center sm:py-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cairoBg})` }}
      />
      <div className="absolute inset-0 bg-[rgba(17,39,73,0.58)] dark:bg-[rgba(6,14,27,0.72)]" />

      <div
        dir="ltr"
        className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6"
      >
        <LanguageToggle
          mode="compact"
          className="border-white/30 bg-black/35 text-white backdrop-blur-sm hover:bg-black/50"
        />
        <ThemeToggle
          mode="compact"
          compactIconClassName="text-white"
          className="border-white/30 bg-black/35 text-white backdrop-blur-sm hover:bg-black/50"
        />
      </div>

      <div
        className={cn(
          "relative z-10 w-full px-4 sm:px-0",
          MAX_WIDTH_CLASS[maxWidth],
        )}
      >
        <div className="mb-6 flex items-center justify-center gap-3 sm:mb-8">
          <img
            src={logoSrc}
            alt="C-Outing Logo"
            width={120}
            height={120}
            decoding="async"
            className="h-11 w-auto rounded-lg"
          />
          <h1 className="text-[clamp(1.5rem,2.6vw,1.875rem)] font-semibold tracking-tight text-white">
            C-OUTING
          </h1>
        </div>

        {children}
      </div>
    </div>
  );
};

type AuthSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export const AuthSurface = ({ children, className }: AuthSurfaceProps) => {
  return (
    <div
      className={cn(
        "glass space-y-6 rounded-xl border-border/65 bg-card/90 p-5 shadow-xl backdrop-blur-lg sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
};
