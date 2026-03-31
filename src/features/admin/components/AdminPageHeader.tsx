import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  meta?: ReactNode;
  actions?: ReactNode;
}

const HEADER_STACK_STYLE: CSSProperties = {
  gap: "clamp(0.6rem, 0.4rem + 0.45vw, 1rem)",
};

const AdminPageHeader = ({
  title,
  description,
  icon: Icon,
  meta,
  actions,
}: AdminPageHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0" style={HEADER_STACK_STYLE}>
        <h1 className="flex min-w-0 items-center gap-2 text-role-subheading text-foreground">
          {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-secondary" />}
          <span className="truncate">{title}</span>
        </h1>
        {description ? (
          <p className="text-role-secondary break-words text-muted-foreground">
            {description}
          </p>
        ) : null}
        {meta ? <div className="pt-0.5">{meta}</div> : null}
      </div>

      {actions ? (
        <div className="flex w-full items-center justify-stretch gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
};

export default AdminPageHeader;
