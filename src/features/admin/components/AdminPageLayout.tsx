import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminPageWidth = "3xl" | "4xl" | "6xl";

type AdminSectionTone = "plain" | "surface" | "muted";

interface AdminPageLayoutProps {
  children: ReactNode;
  maxWidth?: AdminPageWidth;
  className?: string;
}

interface AdminSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: AdminSectionTone;
}

const PAGE_WIDTH_CLASS: Record<AdminPageWidth, string> = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
};

const PAGE_STACK_STYLE: CSSProperties = {
  gap: "clamp(1.25rem, 0.95rem + 1vw, 2.25rem)",
};

const SECTION_STACK_STYLE: CSSProperties = {
  gap: "clamp(0.75rem, 0.6rem + 0.45vw, 1.1rem)",
};

const SECTION_TONE_CLASS: Record<AdminSectionTone, string> = {
  plain: "",
  surface: "rounded-2xl border border-border bg-card px-4 py-4 sm:px-5 sm:py-5",
  muted:
    "rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 sm:px-5 sm:py-5",
};

export const AdminPageLayout = ({
  children,
  maxWidth = "6xl",
  className,
}: AdminPageLayoutProps) => {
  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col px-4 py-6 sm:px-6",
        PAGE_WIDTH_CLASS[maxWidth],
        className,
      )}
      style={PAGE_STACK_STYLE}
    >
      {children}
    </main>
  );
};

export const AdminSection = ({
  children,
  title,
  description,
  actions,
  className,
  contentClassName,
  tone = "plain",
}: AdminSectionProps) => {
  return (
    <section className={cn(SECTION_TONE_CLASS[tone], className)}>
      {(title || description || actions) && (
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h2 className="text-role-body font-semibold text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-role-secondary text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
        </div>
      )}
      <div
        className={cn("flex flex-col", contentClassName)}
        style={SECTION_STACK_STYLE}
      >
        {children}
      </div>
    </section>
  );
};
