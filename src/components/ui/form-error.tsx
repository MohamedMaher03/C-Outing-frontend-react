interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError = ({ message, className }: FormErrorProps) => {
  if (!message) return null;

  return <p className={className || "text-xs text-destructive"}>{message}</p>;
};
