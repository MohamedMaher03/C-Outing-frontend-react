import {
  useCallback,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { AUTH_OTP_LENGTH } from "@/features/auth/constants";
import {
  applyOtpDigitInput,
  applyOtpPaste,
  createEmptyOtpSlots,
  isOtpComplete,
  otpSlotsToCode,
  resolveOtpBackspaceFocusIndex,
  type OtpDigitSlot,
} from "@/features/auth/utils/otpDigitInput";

export const useOtpDigitInput = (otpLength = AUTH_OTP_LENGTH) => {
  const [digits, setDigits] = useState<OtpDigitSlot[]>(() =>
    createEmptyOtpSlots(otpLength),
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusSlot = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const assignInputRef = useCallback(
    (index: number) => (element: HTMLInputElement | null) => {
      inputRefs.current[index] = element;
    },
    [],
  );

  const resetDigits = useCallback(() => {
    setDigits(createEmptyOtpSlots(otpLength));
  }, [otpLength]);

  const handleDigitChange = useCallback(
    (index: number, raw: string) => {
      const { nextSlots, focusIndex } = applyOtpDigitInput(
        digits,
        index,
        raw,
        otpLength,
      );
      setDigits(nextSlots);
      if (focusIndex !== null) focusSlot(focusIndex);
    },
    [digits, focusSlot, otpLength],
  );

  const handleKeyDown = useCallback(
    (index: number, event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Backspace") return;
      const focusIndex = resolveOtpBackspaceFocusIndex(index, digits);
      if (focusIndex !== null) focusSlot(focusIndex);
    },
    [digits, focusSlot],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const { nextSlots, focusIndex } = applyOtpPaste(
        event.clipboardData.getData("text"),
        otpLength,
      );
      if (!nextSlots.some(Boolean)) return;
      setDigits(nextSlots);
      focusSlot(focusIndex);
    },
    [focusSlot, otpLength],
  );

  return {
    digits,
    otpCode: otpSlotsToCode(digits),
    otpComplete: isOtpComplete(digits, otpLength),
    otpLength,
    assignInputRef,
    resetDigits,
    focusFirstSlot: () => focusSlot(0),
    handleDigitChange,
    handleKeyDown,
    handlePaste,
  };
};
