/* structure is 
UI → Hook → Service → API */

import { useState } from "react";
import type { SignUpFormData } from "@/features/auth/validation/signUp.schema";

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  /* Before clicking Register → isLoading = false
     When user clicks Register → isLoading = true
     After API finishes → isLoading = false
     So it controls the spinner / loading button. */

  const registerUser = async (data: SignUpFormData) => {
    /*
        This function:Takes the form data
        Sends it to backend (later)
        Handles loading
        Handles error
      */
    setIsLoading(true);

    try {
      // TODO: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Sign-up attempt:", data);

      // here later:
      // await authService.register(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerUser,
    isLoading,
  };
};
/*
So inside your component you can use:
const { registerUser, isLoading } = useSignUp();
Then:
Call registerUser(data)
Use isLoading to disable button
*/
