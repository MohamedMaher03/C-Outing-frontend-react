import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import { AUTH_OTP_LENGTH } from "@/features/auth/constants";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/validation/resetPassword.schema";
import {
  AuthShell,
  AuthSurface,
} from "@/features/auth/components/layout/AuthShell";
import { AuthStatusBanner } from "@/features/auth/components/ui/AuthStatusBanner";

const OTP_LENGTH = AUTH_OTP_LENGTH;

/** Masks an email: john.doe@example.com → j*****e@example.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const { resetPassword, resendResetOtp, isLoading, error, clearError } =
    useResetPassword();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, otp: "", newPassword: "", confirmPassword: "" },
  });

  // Keep hidden email field in sync
  useEffect(() => {
    setValue("email", email);
  }, [email, setValue]);

  // Keep hidden otp field in sync with digit boxes
  useEffect(() => {
    setValue("otp", digits.join(""));
  }, [digits, setValue]);

  if (!email) return <Navigate to="/forgot-password" replace />;

  // ── OTP box handlers ──────────────────────────────────────

  const handleDigitChange = (index: number, raw: string) => {
    const pasted = raw.replace(/\D/g, "");
    if (pasted.length > 1) {
      const next = [...digits];
      pasted
        .split("")
        .slice(0, OTP_LENGTH)
        .forEach((d, i) => {
          if (index + i < OTP_LENGTH) next[index + i] = d;
        });
      setDigits(next);
      inputRefs.current[
        Math.min(index + pasted.length, OTP_LENGTH - 1)
      ]?.focus();
      return;
    }
    if (!/^\d?$/.test(raw)) return;
    const next = [...digits];
    next[index] = raw;
    setDigits(next);
    if (raw && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    text
      .split("")
      .slice(0, OTP_LENGTH)
      .forEach((d, i) => (next[i] = d));
    setDigits(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  // ── Submit ────────────────────────────────────────────────

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearError();
    const ok = await resetPassword(data);
    if (ok) setSuccess(true);
  };

  // ── Success screen ────────────────────────────────────────

  if (success) {
    return (
      <AuthShell>
        <AuthSurface className="text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-600/12 p-3.5">
              <CheckCircle2 className="h-9 w-9 text-green-700 dark:text-green-300" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground" role="status">
            Password Reset!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your password has been updated successfully. You can now log in with
            your new password.
          </p>
          <Button
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95"
            onClick={() => navigate("/login", { replace: true })}
          >
            Back to Login
          </Button>
        </AuthSurface>
      </AuthShell>
    );
  }

  // ── Main form ─────────────────────────────────────────────

  const otpComplete =
    digits.length === OTP_LENGTH && digits.every((d) => d !== "");

  return (
    <AuthShell>
      <AuthSurface>
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="-mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/15 p-3.5">
              <KeyRound className="h-7 w-7 text-accent/85" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Reset Password
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-foreground break-all" dir="auto">
              {maskEmail(email)}
            </span>{" "}
            and choose a new password.
          </p>
        </div>

        {/* Error Banner */}
        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
          aria-busy={isLoading}
        >
          {/* Hidden email field */}
          <input type="hidden" {...register("email")} />

          {/* OTP Boxes */}
          <div className="space-y-2">
            <Label>Reset Code</Label>
            <Controller
              name="otp"
              control={control}
              render={() => (
                <div className="flex justify-center gap-1.5 sm:gap-2" dir="ltr">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      autoFocus={index === 0}
                      aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={[
                        "h-12 w-10 rounded-lg border text-center text-lg font-semibold sm:w-11",
                        "bg-background/70 text-foreground",
                        "transition-colors duration-200 ease-out",
                        "focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/40",
                        digit
                          ? "border-primary/45 bg-primary/10"
                          : "border-border/70",
                        isLoading ? "opacity-50 cursor-not-allowed" : "",
                      ].join(" ")}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              )}
            />
            <FormError message={errors.otp?.message} />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                disabled={isLoading}
                aria-invalid={!!errors.newPassword}
                className={`h-11 pr-10 text-base sm:text-sm ${errors.newPassword ? "border-destructive" : ""}`}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FormError message={errors.newPassword?.message} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your new password"
                disabled={isLoading}
                aria-invalid={!!errors.confirmPassword}
                className={`h-11 pr-10 text-base sm:text-sm ${errors.confirmPassword ? "border-destructive" : ""}`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                disabled={isLoading}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                aria-pressed={showConfirm}
                className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FormError message={errors.confirmPassword?.message} />
          </div>

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95"
            disabled={isLoading || !otpComplete}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <InlineLoading size="lg" />
                Resetting Password…
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Didn't receive a code?{" "}
          <button
            type="button"
            onClick={() => {
              void resendResetOtp(email);
            }}
            className="inline-flex min-h-11 items-center px-1 font-medium text-foreground/80 transition-colors hover:text-foreground"
            disabled={isLoading}
          >
            Request a new one
          </button>
        </p>
      </AuthSurface>
    </AuthShell>
  );
}
