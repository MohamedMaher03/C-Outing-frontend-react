import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "../../components/ui/input";

type Props = {
  id: string;
  placeholder?: string;
  error?: boolean;
  register: UseFormRegisterReturn;
};

export const PasswordInput = ({ id, placeholder, error, register }: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        {...register}
        className={`pr-10 ${
          error ? "border-destructive focus-visible:ring-destructive" : ""
        }`}
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};
