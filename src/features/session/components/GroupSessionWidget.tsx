import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Hash, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/i18n/useI18n";
import { cn } from "@/lib/utils";

interface GroupSessionWidgetProps {
  /** "sidebar" renders a compact card for the desktop right panel;
   *  "banner" renders a wide horizontal entry for mobile/tablet feeds. */
  variant?: "sidebar" | "banner";
  className?: string;
}

export function GroupSessionWidget({
  variant = "sidebar",
  className,
}: GroupSessionWidgetProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [mode, setMode] = useState<"idle" | "join">("idle");
  const [codeInput, setCodeInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────
  /** Navigate to the session page telling it to CREATE a new session. */
  const goCreate = () => {
    navigate("/session?action=create");
  };

  /** Navigate to the session page telling it to JOIN an existing session. */
  const goJoin = () => {
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) {
      setLocalError(t("session.widget.join.error"));
      return;
    }
    navigate(`/session?action=join&code=${code}`);
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);
    setCodeInput(cleaned);
    setLocalError(null);
  };

  if (variant === "banner") {
    return (
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl border border-[hsl(216,50%,16%)]/20 bg-gradient-to-br from-[hsl(216,50%,16%)] to-[hsl(216,50%,24%)] p-5 shadow-md dark:border-[hsl(38,42%,58%)]/25 dark:from-[hsl(216,50%,12%)] dark:to-[hsl(216,45%,18%)]",
          className,
        )}
        id="group-session-banner"
        aria-label={t("session.widget.ariaLabel")}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[hsl(38,42%,58%)]/15 blur-2xl" />
        <div className="pointer-events-none absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-[hsl(38,42%,58%)]/10 blur-xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[hsl(38,42%,78%)]">
                {t("session.widget.badgeNew")}
              </p>
              <h2 className="text-base font-bold text-white">
                {t("session.widget.title")}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-white/70">
                {t("session.widget.banner.description")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:flex-col lg:flex-row">
            <Button
              onClick={goCreate}
              className="h-9 flex-1 rounded-full bg-[hsl(38,42%,58%)] px-4 text-xs font-bold text-[hsl(216,50%,16%)] shadow hover:bg-[hsl(38,42%,66%)] sm:flex-none"
              id="session-create-btn-banner"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("session.widget.create")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setMode((m) => (m === "join" ? "idle" : "join"))}
              className="h-9 flex-1 rounded-full border-white/25 bg-white/8 px-4 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/15 sm:flex-none"
              id="session-join-btn-banner"
            >
              <Hash className="h-3.5 w-3.5" />
              {t("session.widget.join")}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mode === "join" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.26,
                ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
              }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex gap-2">
                <Input
                  value={codeInput}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goJoin();
                  }}
                  placeholder={t("session.widget.join.placeholderBanner")}
                  maxLength={6}
                  className="h-10 flex-1 rounded-xl border-white/25 bg-white/10 text-center font-mono text-base font-bold uppercase tracking-[0.3em] text-white placeholder:text-white/40 focus:border-[hsl(38,42%,58%)]/80 focus:ring-[hsl(38,42%,58%)]/30"
                  aria-label={t("session.widget.join.inputAriaBanner")}
                  id="session-code-input-banner"
                  autoFocus
                />
                <Button
                  onClick={goJoin}
                  disabled={codeInput.length !== 6}
                  className="h-10 w-10 rounded-xl bg-[hsl(38,42%,58%)] p-0 text-[hsl(216,50%,16%)] hover:bg-[hsl(38,42%,66%)]"
                  aria-label={t("session.widget.join.actionAria")}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("idle");
                    setCodeInput("");
                    setLocalError(null);
                  }}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 text-white/70 transition-colors hover:bg-white/10"
                  aria-label={t("common.cancel")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {localError && (
                <p className="mt-2 text-xs text-red-300">{localError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }

  // ── Sidebar variant ───────────────────────────────────────────
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[hsl(216,50%,16%)]/20 bg-gradient-to-br from-[hsl(216,50%,16%)] to-[hsl(216,50%,24%)] p-5 shadow-md dark:border-[hsl(38,42%,58%)]/25 dark:from-[hsl(216,50%,12%)] dark:to-[hsl(216,45%,18%)]",
        className,
      )}
      id="group-session-sidebar"
      aria-label={t("session.widget.ariaLabel")}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[hsl(38,42%,58%)]/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-3 bottom-0 h-20 w-20 rounded-full bg-[hsl(38,42%,58%)]/12 blur-xl" />

      <div className="relative z-10 space-y-4">
        {/* Title row */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/12">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(38,42%,78%)]">
              {t("session.widget.sidebar.eyebrow")}
            </p>
            <h2 className="text-sm font-bold text-white leading-tight">
              {t("session.widget.title")}
            </h2>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-white/70">
          {t("session.widget.sidebar.description")}
        </p>

        {/* Create button */}
        <Button
          onClick={goCreate}
          className="w-full h-10 rounded-2xl bg-[hsl(38,42%,58%)] text-xs font-bold text-[hsl(216,50%,16%)] shadow hover:bg-[hsl(38,42%,66%)] focus-visible:ring-[hsl(38,42%,58%)]"
          id="session-create-btn-sidebar"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("session.widget.create")}
        </Button>

        {/* Join toggle */}
        <AnimatePresence initial={false}>
          {mode === "idle" ? (
            <motion.button
              key="join-toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setMode("join")}
              className="w-full text-center text-xs font-semibold text-white/60 transition-colors hover:text-white/90 focus-visible:outline-none"
              id="session-join-toggle-sidebar"
            >
              {t("session.widget.join.toggle")}
            </motion.button>
          ) : (
            <motion.div
              key="join-form"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.22,
                ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
              }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <Input
                  value={codeInput}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goJoin();
                  }}
                  placeholder={t("session.widget.join.placeholderSidebar")}
                  maxLength={6}
                  className="h-10 flex-1 rounded-xl border-white/25 bg-white/10 text-center font-mono text-sm font-bold uppercase tracking-[0.28em] text-white placeholder:text-white/35 focus:border-[hsl(38,42%,58%)]/80 focus:ring-[hsl(38,42%,58%)]/30"
                  aria-label={t("session.widget.join.inputAria")}
                  id="session-code-input-sidebar"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setMode("idle");
                    setCodeInput("");
                    setLocalError(null);
                  }}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 text-white/60 transition-colors hover:bg-white/10"
                  aria-label={t("session.widget.join.cancelAria")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                onClick={goJoin}
                disabled={codeInput.length !== 6}
                className="w-full h-9 rounded-xl bg-white/14 text-xs font-semibold text-white hover:bg-white/22 border border-white/20 focus-visible:ring-white/40"
                id="session-join-submit-sidebar"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                {t("session.widget.join")}
              </Button>
              {localError && (
                <p className="text-xs text-red-300">{localError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
