import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  error?: string;
  disabled?: boolean;
  register: UseFormRegisterReturn;
};

export const FormField = ({
  id,
  label,
  placeholder,
  type = "text",
  icon,
  error,
  disabled,
  register,
}: Props) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          {...register}
          disabled={disabled}
          aria-invalid={!!error}
          className={`h-11 text-base sm:text-sm ${icon ? "pl-10" : ""} ${
            error ? "border-destructive focus-visible:ring-destructive" : ""
          }`}
        />
      </div>

      <FormError message={error} />
    </div>
  );
};
