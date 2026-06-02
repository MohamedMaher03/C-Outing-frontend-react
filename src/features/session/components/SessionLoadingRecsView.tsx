import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SESSION_PAGE_VARIANTS } from "../constants/sessionPresentation";

interface SessionLoadingRecsViewProps {
  prefersReducedMotion: boolean;
  title: string;
  subtitle: string;
}

export function SessionLoadingRecsView({
  prefersReducedMotion,
  title,
  subtitle,
}: SessionLoadingRecsViewProps) {
  return (
    <motion.div
      key="loading-recs"
      variants={SESSION_PAGE_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.32 }}
      className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center space-y-6"
    >
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[hsl(216,50%,16%)] to-[hsl(216,50%,28%)] shadow-lg dark:from-[hsl(38,42%,52%)] dark:to-[hsl(38,42%,40%)]">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        {!prefersReducedMotion && (
          <div className="absolute -inset-2 rounded-[22px] border-2 border-[hsl(38,42%,58%)]/40 animate-ping" />
        )}
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-[hsl(38,42%,58%)]"
            style={{
              animation: prefersReducedMotion
                ? "none"
                : `bounce 1.2s ease-in-out ${index * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
