import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}

const AdminEmptyState = ({
  title,
  description,
  icon: Icon,
  action,
}: AdminEmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card/70 px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-role-body font-semibold text-foreground">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-role-secondary text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
};

export default AdminEmptyState;
