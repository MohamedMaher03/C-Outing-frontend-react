import { cn } from "@/lib/utils";

interface FilterChipOption {
  value: string;
  label: string;
}

interface AdminFilterChipsProps<T extends string> {
  label?: string;
  options: ReadonlyArray<FilterChipOption & { value: T }>;
  value: T;
  onChange: (value: T) => void;
}

const AdminFilterChips = <T extends string>({
  label,
  options,
  value,
  onChange,
}: AdminFilterChipsProps<T>) => {
  return (
    <div className="space-y-1.5">
      {label ? (
        <p className="px-1 text-role-caption uppercase text-muted-foreground/85">
          {label}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-border/70 bg-muted/20 p-1.5">
        <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={value === option.value}
              className={cn(
                "min-h-11 rounded-lg border px-3 py-2 text-role-secondary font-medium whitespace-nowrap transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                value === option.value
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-secondary/45 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminFilterChips;
