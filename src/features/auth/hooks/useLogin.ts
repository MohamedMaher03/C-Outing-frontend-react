/* structure is 
UI → Hook → Service → API */

import { useState } from "react";
import type { LoginFormData } from "@/features/auth/validation/login.schema";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginUser = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      console.log("Login attempt:", data);

      // simulate API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // later:
      // await authService.login(data); FROM : services/auth.service.ts
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginUser,
    isLoading,
  };
};
