import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { InlineLoading } from "@/components/ui/LoadingSpinner";

interface LogoutProgressOverlayProps {
  isVisible: boolean;
  className?: string;
}

export const LogoutProgressOverlay = ({
  isVisible,
  className,
}: LogoutProgressOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="logout-progress-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "fixed inset-0 z-[80] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm",
            className,
          )}
          role="status"
          aria-live="polite"
          aria-label="Logging out"
          aria-busy="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border/80 bg-card/95 px-4 py-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <InlineLoading size="sm" className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium text-foreground">Signing out</p>
                <p className="text-xs text-muted-foreground">Please wait a moment...</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
