import { RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AdminErrorBannerProps {
  title: string;
  message?: string | null;
  onRetry?: () => void;
}

const AdminErrorBanner = ({
  title,
  message,
  onRetry,
}: AdminErrorBannerProps) => {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-destructive/40">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="break-words">{message}</p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-9"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
};

export default AdminErrorBanner;
