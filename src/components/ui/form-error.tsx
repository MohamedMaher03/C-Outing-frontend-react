import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError = ({ message, className }: FormErrorProps) => {
  if (!message) return null;

  return (
    <p
      role="alert"
      aria-live="polite"
      className={cn("text-xs text-destructive break-words", className)}
      dir="auto"
    >
      {message}
    </p>
  );
};
