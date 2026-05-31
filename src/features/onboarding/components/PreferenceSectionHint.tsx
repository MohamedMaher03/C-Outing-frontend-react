import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";

type PreferenceSectionHintProps = {
  hintKey: string;
  className?: string;
};

export const PreferenceSectionHint = ({
  hintKey,
  className,
}: PreferenceSectionHintProps) => {
  const { t } = useI18n();

  return (
    <p className={cn("text-role-secondary text-muted-foreground", className)}>
      {t(hintKey)}
    </p>
  );
};
