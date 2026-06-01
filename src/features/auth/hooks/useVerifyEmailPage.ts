import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { useOtpDigitInput } from "@/features/auth/hooks/useOtpDigitInput";
import { embedMaskedEmailForCopy } from "@/features/auth/utils/authEmailPresentation";
import {
  AUTH_SUCCESS_BANNER_DISMISS_MS,
  AUTH_VERIFICATION_RESEND_COOLDOWN_SEC,
  buildVerifyEmailRoute,
  isRecoverableEmail,
  resolveVerificationEmail,
} from "@/features/auth/utils/verificationEmailContext";
import { normalizeEmail } from "@/utils/textNormalization";

export const useVerifyEmailPage = () => {
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    pendingVerificationEmail,
    setPendingVerificationEmail,
    clearPendingVerificationEmail,
  } = useAuth();
  const emailVerification = useVerifyEmail();
  const otpInput = useOtpDigitInput();

  const email = resolveVerificationEmail(
    location,
    pendingVerificationEmail ?? "",
  );
  const hasEmailContext = email.length > 0;

  const [emailEntry, setEmailEntry] = useState(email);
  const [emailEntryError, setEmailEntryError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(
    AUTH_VERIFICATION_RESEND_COOLDOWN_SEC,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const successDismissTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasEmailContext) return;
    setPendingVerificationEmail(email);
  }, [email, hasEmailContext, setPendingVerificationEmail]);

  useEffect(() => {
    if (!hasEmailContext || resendCountdown <= 0) return;
    const timerId = window.setTimeout(
      () => setResendCountdown((current) => current - 1),
      1_000,
    );
    return () => window.clearTimeout(timerId);
  }, [hasEmailContext, resendCountdown]);

  useEffect(
    () => () => {
      if (successDismissTimerRef.current !== null) {
        window.clearTimeout(successDismissTimerRef.current);
      }
    },
    [],
  );

  const scheduleSuccessBannerDismiss = () => {
    if (successDismissTimerRef.current !== null) {
      window.clearTimeout(successDismissTimerRef.current);
    }
    successDismissTimerRef.current = window.setTimeout(
      () => setSuccessMessage(null),
      AUTH_SUCCESS_BANNER_DISMISS_MS,
    );
  };

  const submitOtpVerification = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasEmailContext || !otpInput.otpComplete || emailVerification.isLoading) {
      return;
    }
    emailVerification.clearError();
    const verified = await emailVerification.verifyOtp(email, otpInput.otpCode);
    if (verified) {
      clearPendingVerificationEmail();
      navigate("/onboarding", { replace: true });
    }
  };

  const resendVerificationCode = async () => {
    if (
      !hasEmailContext ||
      resendCountdown > 0 ||
      emailVerification.isResending
    ) {
      return;
    }

    emailVerification.clearError();
    const delivered = await emailVerification.resendOtp(email);
    if (!delivered) return;

    setPendingVerificationEmail(email);
    setResendCountdown(AUTH_VERIFICATION_RESEND_COOLDOWN_SEC);
    otpInput.resetDigits();
    setSuccessMessage(t("auth.verify.newCodeSent"));
    otpInput.focusFirstSlot();
    scheduleSuccessBannerDismiss();
  };

  const startEmailRecovery = async () => {
    const normalizedEmail = normalizeEmail(emailEntry);

    if (!isRecoverableEmail(normalizedEmail)) {
      setEmailEntryError(t("auth.validation.invalidEmail"));
      return;
    }

    setEmailEntryError(null);
    emailVerification.clearError();

    const delivered = await emailVerification.resendOtp(normalizedEmail);
    if (!delivered) return;

    setPendingVerificationEmail(normalizedEmail);
    setSuccessMessage(t("auth.verify.recovery.codeSent"));
    setResendCountdown(AUTH_VERIFICATION_RESEND_COOLDOWN_SEC);

    navigate(buildVerifyEmailRoute(normalizedEmail), {
      replace: true,
      state: { email: normalizedEmail },
    });
  };

  const updateEmailEntry = (value: string) => {
    setEmailEntry(value);
    if (emailEntryError) setEmailEntryError(null);
  };

  const goToLogin = () => navigate("/login");
  const goToRegister = () => navigate("/register");

  const maskedEmailForDisplay = hasEmailContext
    ? embedMaskedEmailForCopy(email)
    : "";
  const canResendVerification = resendCountdown <= 0;

  return {
    t,
    formatNumber,
    ...emailVerification,
    ...otpInput,
    email,
    hasEmailContext,
    emailEntry,
    emailEntryError,
    resendCountdown,
    successMessage,
    maskedEmailForDisplay,
    canResendVerification,
    submitOtpVerification,
    resendVerificationCode,
    startEmailRecovery,
    updateEmailEntry,
    goToLogin,
    goToRegister,
  };
};
