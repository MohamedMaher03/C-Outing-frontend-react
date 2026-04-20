import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "./form/FormField";
import { useNavigate } from "react-router-dom";
import { AuthShell, AuthSurface } from "./layout/AuthShell";
import { AuthStatusBanner } from "./ui/AuthStatusBanner";

import { loginSchema } from "@/features/auth/validation/login.schema";
import type { LoginFormData } from "@/features/auth/validation/login.schema";
import { PasswordInput } from "./form/PasswordInput";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LOGIN_FORM_FIELDS } from "@/features/auth/mocks";
import type { LoginField } from "../types";
import { useI18n } from "@/components/i18n";
import { normalizeEmail } from "@/utils/textNormalization";

const LoginForm = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const {
    loginUser,
    resendVerificationEmail,
    isLoading,
    isResendingVerification,
    pendingVerificationEmail,
    error,
    clearError,
  } = useLogin();
  const [verificationHint, setVerificationHint] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const typedEmail = useWatch({ control, name: "email" }) ?? "";
  const recoveryEmail = pendingVerificationEmail ?? normalizeEmail(typedEmail);
  const hasRecoveryEmail = recoveryEmail.length > 0;

  const onSubmit = async (data: LoginFormData) => {
    setVerificationHint(null);
    await loginUser(data);
  };

  const handleOpenVerification = () => {
    if (!hasRecoveryEmail) return;

    navigate(`/verify-email?email=${encodeURIComponent(recoveryEmail)}`, {
      state: { email: recoveryEmail },
    });
  };

  const handleResendVerification = async () => {
    if (!hasRecoveryEmail) return;

    clearError();
    const success = await resendVerificationEmail(recoveryEmail);
    if (success) {
      setVerificationHint(t("auth.login.verifyGuide.resendSuccess"));
    }
  };

  return (
    <AuthShell>
      <AuthSurface>
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("auth.welcomeBack")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.discoverCairo")}
          </p>
        </div>

        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        {pendingVerificationEmail && (
          <div className="space-y-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {t("auth.login.verifyGuide.title")}
            </p>
            <p className="text-muted-foreground">
              {t("auth.login.verifyGuide.subtitle", {
                email: recoveryEmail,
              })}
            </p>

            <ol className="space-y-1 text-muted-foreground">
              <li>{t("auth.login.verifyGuide.step1")}</li>
              <li>{t("auth.login.verifyGuide.step2")}</li>
              <li>{t("auth.login.verifyGuide.step3")}</li>
            </ol>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                size="sm"
                className="h-10"
                disabled={!hasRecoveryEmail || isLoading}
                onClick={handleOpenVerification}
              >
                {t("auth.login.verifyGuide.continueAction")}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10"
                disabled={
                  !hasRecoveryEmail || isLoading || isResendingVerification
                }
                onClick={handleResendVerification}
              >
                {isResendingVerification ? (
                  <span className="inline-flex items-center gap-2">
                    <InlineLoading />
                    {t("auth.login.verifyGuide.sending")}
                  </span>
                ) : (
                  t("auth.login.verifyGuide.resendAction")
                )}
              </Button>
            </div>

            {verificationHint && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {verificationHint}
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
          aria-busy={isLoading}
        >
          {LOGIN_FORM_FIELDS.map((field: LoginField) => (
            <FormField
              key={field.id}
              id={field.id}
              label={
                field.id === "email" ? t("auth.fields.email") : field.label
              }
              placeholder={
                field.id === "email"
                  ? t("auth.placeholders.email")
                  : field.placeholder
              }
              type={field.type}
              error={errors[field.id]?.message}
              disabled={isLoading}
              register={register(field.id)}
            />
          ))}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => navigate("/forgot-password")}
                className="-mx-2 inline-flex min-h-11 items-center px-2 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground/95"
              >
                {t("auth.forgotPassword")}
              </button>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              register={register("password")}
              error={!!errors.password}
              disabled={isLoading}
            />
            <FormError message={errors.password?.message} />
          </div>

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95 disabled:opacity-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <InlineLoading size="lg" />
                {t("auth.signingIn")}
              </span>
            ) : (
              t("auth.signIn")
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="inline-flex min-h-11 items-center font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t("auth.createOne")}
          </button>
        </p>
      </AuthSurface>

      <p className="mt-4 pb-2 text-center text-sm text-cream/75 sm:mt-6 sm:pb-0">
        {t("auth.footer")}
      </p>
    </AuthShell>
  );
};

export default LoginForm;
