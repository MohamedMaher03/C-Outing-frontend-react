import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useLogin } from "@/features/auth/hooks/useLogin";
import {
  loginSchema,
  type LoginFormData,
  type LoginFormInput,
} from "@/features/auth/validation/login.schema";
import { normalizeEmail } from "@/utils/textNormalization";

export const useLoginPage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const authLogin = useLogin();
  const [verificationHint, setVerificationHint] = useState<string | null>(null);

  const form = useForm<LoginFormInput, unknown, LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { staySignedIn: false },
  });

  const typedEmail = useWatch({ control: form.control, name: "email" }) ?? "";
  const recoveryEmail =
    authLogin.pendingVerificationEmail ?? normalizeEmail(typedEmail);
  const hasRecoveryEmail = recoveryEmail.length > 0;

  const submitCredentials = async (data: LoginFormData) => {
    setVerificationHint(null);
    await authLogin.loginUser(data);
  };

  const openVerificationFlow = () => {
    if (!hasRecoveryEmail) return;
    navigate(`/verify-email?email=${encodeURIComponent(recoveryEmail)}`, {
      state: { email: recoveryEmail },
    });
  };

  const resendVerificationCode = async () => {
    if (!hasRecoveryEmail) return;
    authLogin.clearError();
    const delivered = await authLogin.resendVerificationEmail(recoveryEmail);
    if (delivered) {
      setVerificationHint(t("auth.login.verifyGuide.resendSuccess"));
    }
  };

  const goToForgotPassword = () => navigate("/forgot-password");
  const goToRegister = () => navigate("/register");

  return {
    t,
    ...authLogin,
    form,
    recoveryEmail,
    hasRecoveryEmail,
    verificationHint,
    submitCredentials,
    openVerificationFlow,
    resendVerificationCode,
    goToForgotPassword,
    goToRegister,
  };
};
