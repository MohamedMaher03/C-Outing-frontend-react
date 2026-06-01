import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import { useOtpDigitInput } from "@/features/auth/hooks/useOtpDigitInput";
import { embedMaskedEmailForCopy } from "@/features/auth/utils/authEmailPresentation";
import type { VerificationEmailRouteState } from "@/features/auth/utils/verificationEmailContext";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/validation/resetPassword.schema";

export const useResetPasswordPage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const passwordReset = useResetPassword();
  const otpInput = useOtpDigitInput();

  const email =
    (location.state as VerificationEmailRouteState)?.email?.trim() ?? "";

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSucceeded, setResetSucceeded] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, otp: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    form.setValue("email", email);
  }, [email, form]);

  useEffect(() => {
    form.setValue("otp", otpInput.otpCode);
  }, [form, otpInput.otpCode]);

  const submitPasswordReset = async (data: ResetPasswordFormData) => {
    passwordReset.clearError();
    const succeeded = await passwordReset.resetPassword(data);
    if (succeeded) setResetSucceeded(true);
  };

  const requestFreshOtp = () => void passwordReset.resendResetOtp(email);

  const goToForgotPassword = () => navigate("/forgot-password");
  const goToLogin = () => navigate("/login", { replace: true });

  const toggleNewPasswordVisibility = () => setShowNewPassword((v) => !v);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((v) => !v);

  const maskedEmailForDisplay = email ? embedMaskedEmailForCopy(email) : "";
  const requiresEmailRedirect = email.length === 0;

  return {
    t,
    ...passwordReset,
    ...otpInput,
    form,
    email,
    maskedEmailForDisplay,
    requiresEmailRedirect,
    resetSucceeded,
    showNewPassword,
    showConfirmPassword,
    submitPasswordReset,
    requestFreshOtp,
    goToForgotPassword,
    goToLogin,
    toggleNewPasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
};
