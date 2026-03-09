import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import logo from "@/assets/images/logo2.png";
import cairoBg from "@/assets/images/cairo-bg.jpg";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

/** Masks an email address: john.doe@example.com → j*****e@example.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const { verifyOtp, resendOtp, isLoading, isResending, error, clearError } =
    useVerifyEmail();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect to register if there's no email in route state
  if (!email) return <Navigate to="/register" replace />;

  // Countdown timer for resend button
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleDigitChange = (index: number, raw: string) => {
    // Handle paste of full OTP into any box
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
      const focusIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
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

  const otp = digits.join("");
  const isComplete = otp.length === OTP_LENGTH && digits.every((d) => d !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isLoading) return;
    clearError();
    const success = await verifyOtp(email, otp);
    if (success) navigate("/onboarding", { replace: true });
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    clearError();
    const success = await resendOtp(email);
    if (success) {
      setCountdown(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
      setDigits(Array(OTP_LENGTH).fill(""));
      setSuccessMessage("A new code has been sent to your email.");
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-8">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cairoBg})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-primary/70" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo Header */}
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
          {/* Back to Register */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Register
          </button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-accent/20 p-4">
                <Mail className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Verify Your Email
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We sent a 6-digit verification code to{" "}
              <span className="font-medium text-foreground">
                {maskEmail(email)}
              </span>
              . Enter it below to confirm your account.
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

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3">
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
                    "h-14 w-12 rounded-xl border text-center text-xl font-bold",
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

            {/* Dev Hint */}
            <p className="text-center text-xs text-muted-foreground/60">
              Development mode — use code{" "}
              <span className="font-mono font-semibold text-accent/80">
                123456
              </span>
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={!isComplete || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <InlineLoading />
                  Verifying…
                </span>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          {/* Resend Section */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <InlineLoading />
                    Sending…
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Resend Code
                  </>
                )}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend in{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {countdown}s
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
