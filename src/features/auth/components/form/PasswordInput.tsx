import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/i18n";

type Props = {
  id: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  register: UseFormRegisterReturn;
};

export const PasswordInput = ({
  id,
  placeholder,
  error,
  disabled,
  register,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        dir="ltr"
        placeholder={placeholder}
        {...register}
        disabled={disabled}
        aria-invalid={error}
        className={`h-11 pr-10 text-base sm:text-sm ${
          error ? "border-destructive focus-visible:ring-destructive" : ""
        }`}
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        aria-pressed={visible}
        className="absolute top-1/2 -translate-y-1/2 flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        style={{ insetInlineEnd: "0.25rem" }}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};
