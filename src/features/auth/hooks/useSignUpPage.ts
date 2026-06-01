import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { AUTH_PASSWORD_RULES } from "@/features/auth/constants";
import { useSignUp } from "@/features/auth/hooks/useSignUp";
import {
  signUpSchema,
  type SignUpFormData,
  type SignUpFormInput,
} from "@/features/auth/validation/signUp.schema";
import { buildPasswordStrengthIndicators } from "@/features/auth/utils/passwordStrengthIndicators";
import { mapSignUpServerFieldToForm } from "@/features/auth/utils/signUpServerFieldMap";
import {
  COUNTRIES,
  CUSTOM_COUNTRY_VALUE,
  DEFAULT_COUNTRY,
  normalizePhone,
} from "@/utils/SignUpForm.constants";

export const useSignUpPage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const authSignUp = useSignUp();
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);

  const activeDialCode =
    countryCode === CUSTOM_COUNTRY_VALUE ? "" : countryCode;

  const countryLabel = useMemo(() => {
    if (countryCode === CUSTOM_COUNTRY_VALUE) return t("auth.phoneCountryOther");
    return COUNTRIES.find(({ code }) => code === countryCode)?.label ?? "";
  }, [countryCode, t]);

  const form = useForm<SignUpFormInput, unknown, SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const passwordValue = useWatch({ control: form.control, name: "password" }) ?? "";

  const passwordStrengthIndicators = buildPasswordStrengthIndicators(
    passwordValue,
    {
      minChars: t("auth.passwordRuleMinChars", {
        min: AUTH_PASSWORD_RULES.MIN_LENGTH,
      }),
      upperLower: t("auth.passwordRuleUpperLower"),
      number: t("auth.passwordRuleNumber"),
      specialChar: t("auth.passwordRuleSpecialChar"),
    },
  );

  useEffect(() => {
    if (!authSignUp.validationErrors) return;

    Object.entries(authSignUp.validationErrors).forEach(
      ([backendField, messages]) => {
        const formField = mapSignUpServerFieldToForm(backendField);
        const message = messages[0];
        if (!formField || !message) return;
        form.setError(formField, { type: "server", message });
      },
    );
  }, [authSignUp.validationErrors, form]);

  const submitRegistration = async (data: SignUpFormData) => {
    authSignUp.clearError();
    form.clearErrors();
    const normalizedPhone = normalizePhone(data.phone, activeDialCode);
    const registered = await authSignUp.registerUser({
      ...data,
      phone: normalizedPhone,
    });
    if (registered) {
      form.reset();
      navigate("/verify-email", { state: { email: data.email } });
    }
  };

  const goToLogin = () => navigate("/login");

  return {
    t,
    ...authSignUp,
    form,
    countryCode,
    setCountryCode,
    countryLabel,
    passwordStrengthIndicators,
    submitRegistration,
    goToLogin,
    countries: COUNTRIES,
    customCountryValue: CUSTOM_COUNTRY_VALUE,
  };
};
