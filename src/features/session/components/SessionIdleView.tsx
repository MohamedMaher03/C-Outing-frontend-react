import { motion } from "framer-motion";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SESSION_PAGE_VARIANTS } from "../constants/sessionPresentation";

interface SessionIdleViewProps {
  prefersReducedMotion: boolean;
  title: string;
  subtitle: string;
  backLabel: string;
  onBackHome: () => void;
}

export function SessionIdleView({
  prefersReducedMotion,
  title,
  subtitle,
  backLabel,
  onBackHome,
}: SessionIdleViewProps) {
  return (
    <motion.div
      key="idle"
      variants={SESSION_PAGE_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.32 }}
      className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center space-y-5"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Button onClick={onBackHome} className="rounded-full px-6">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Button>
    </motion.div>
  );
}
