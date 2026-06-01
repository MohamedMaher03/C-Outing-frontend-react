import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/features/auth/validation/forgotPassword.schema";

export const useForgotPasswordPage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const passwordRecovery = useForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const submitResetRequest = async (data: ForgotPasswordFormData) => {
    const delivered = await passwordRecovery.sendResetOtp(data);
    if (delivered) {
      navigate("/reset-password", { state: { email: data.email } });
    }
  };

  const goToLogin = () => navigate("/login");

  return {
    t,
    ...passwordRecovery,
    form,
    submitResetRequest,
    goToLogin,
  };
};
