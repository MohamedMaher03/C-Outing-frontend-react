import { ArrowLeft } from "lucide-react";

interface SessionTopBarProps {
  title: string;
  backHomeAria: string;
  sessionCode?: string;
  onBackHome: () => void;
}

export function SessionTopBar({
  title,
  backHomeAria,
  sessionCode,
  onBackHome,
}: SessionTopBarProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={backHomeAria}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        {sessionCode && (
          <span className="ml-auto rounded-full border border-border/60 bg-muted px-3 py-1 text-xs font-mono font-semibold tracking-widest text-foreground">
            {sessionCode}
          </span>
        )}
      </div>
    </div>
  );
}
