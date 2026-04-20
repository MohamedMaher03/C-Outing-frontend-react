import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/features/auth/validation/forgotPassword.schema";
import {
  AuthShell,
  AuthSurface,
} from "@/features/auth/components/layout/AuthShell";
import { AuthStatusBanner } from "@/features/auth/components/ui/AuthStatusBanner";
import { useI18n } from "@/components/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { sendResetOtp, isLoading, error, clearError } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const success = await sendResetOtp(data);
    if (success) {
      navigate("/reset-password", { state: { email: data.email } });
    }
  };

  return (
    <AuthShell>
      <AuthSurface>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="-mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground/90"
        >
          <ArrowLeft className="rtl-mirror h-4 w-4" />
          {t("auth.backToLogin")}
        </button>

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/15 p-3.5">
              <Mail className="h-7 w-7 text-accent/85" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            {t("auth.forgotPassword.title")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("auth.forgotPassword.subtitle")}
          </p>
        </div>

        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
          aria-busy={isLoading}
        >
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              placeholder={t("auth.placeholders.email")}
              disabled={isLoading}
              aria-invalid={!!errors.email}
              className={`h-11 text-base sm:text-sm ${errors.email ? "border-destructive" : ""}`}
              {...register("email")}
            />
            <FormError message={errors.email?.message} />
          </div>

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <InlineLoading size="lg" />
                {t("auth.forgotPassword.sendingCode")}
              </span>
            ) : (
              t("auth.forgotPassword.sendCode")
            )}
          </Button>
        </form>
      </AuthSurface>
    </AuthShell>
  );
}
