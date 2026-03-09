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
import logo from "@/assets/images/logo3.png";
import cairoBg from "@/assets/images/cairo-bg.jpg";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/validation/resetPassword.schema";

const OTP_LENGTH = 6;

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

  const { resetPassword, isLoading, error, clearError } = useResetPassword();

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
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cairoBg})` }}
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img
              src={logo}
              alt="C-Outing Logo"
              className="h-12 w-auto rounded-lg"
            />
            <h1 className="text-3xl font-bold tracking-tight text-cream">
              C-OUTING
            </h1>
          </div>
          <div className="glass rounded-2xl p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Password Reset!
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your password has been updated successfully. You can now log in
              with your new password.
            </p>
            <Button
              className="w-full font-semibold h-11"
              onClick={() => navigate("/login", { replace: true })}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────

  const otpComplete =
    digits.length === OTP_LENGTH && digits.every((d) => d !== "");

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-8">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cairoBg})` }}
      />
      <div className="absolute inset-0 bg-primary/70" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src={logo}
            alt="C-Outing Logo"
            className="h-12 w-auto rounded-lg"
          />
          <h1 className="text-3xl font-bold tracking-tight text-cream">
            C-OUTING
          </h1>
        </div>

        {/* Glass Card */}
        <div className="glass rounded-2xl p-8 space-y-6">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-accent/20 p-4">
                <KeyRound className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Reset Password
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">
                {maskEmail(email)}
              </span>{" "}
              and choose a new password.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Hidden email field */}
            <input type="hidden" {...register("email")} />

            {/* OTP Boxes */}
            <div className="space-y-2">
              <Label>Reset Code</Label>
              <Controller
                name="otp"
                control={control}
                render={() => (
                  <div className="flex justify-center gap-2">
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
                        onChange={(e) =>
                          handleDigitChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={[
                          "h-12 w-11 rounded-xl border text-center text-lg font-bold",
                          "bg-background/50 text-foreground",
                          "transition-all duration-150",
                          "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
                          digit
                            ? "border-accent/60 bg-accent/10"
                            : "border-border/60",
                          isLoading ? "opacity-50 cursor-not-allowed" : "",
                        ].join(" ")}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                )}
              />
              <FormError message={errors.otp?.message} />
              <p className="text-center text-xs text-muted-foreground/60">
                Development mode — use{" "}
                <span className="font-mono font-semibold text-accent/80">
                  123456
                </span>
              </p>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className={`pr-10 ${errors.newPassword ? "border-destructive" : ""}`}
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
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
                  className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
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
              className="w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold h-11"
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
              onClick={() => navigate("/forgot-password")}
              className="font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Request a new one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
