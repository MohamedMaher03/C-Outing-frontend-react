export type OtpDigitSlot = string;

const stripNonDigits = (value: string): string => value.replace(/\D/g, "");

export const createEmptyOtpSlots = (length: number): OtpDigitSlot[] =>
  Array.from({ length }, () => "");

export const otpSlotsToCode = (slots: readonly OtpDigitSlot[]): string =>
  slots.join("");

export const isOtpComplete = (
  slots: readonly OtpDigitSlot[],
  length: number,
): boolean =>
  slots.length === length && slots.every((digit) => digit.length > 0);

export const otpDigitCellClassName = (
  filled: boolean,
  disabled: boolean,
): string =>
  [
    "h-12 w-10 rounded-lg border text-center text-lg font-semibold sm:w-11",
    "bg-background/70 text-foreground",
    "transition-colors duration-200 ease-out",
    "focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/40",
    filled ? "border-primary/45 bg-primary/10" : "border-border/70",
    disabled ? "opacity-50 cursor-not-allowed" : "",
  ]
    .filter(Boolean)
    .join(" ");

export const applyOtpDigitInput = (
  slots: readonly OtpDigitSlot[],
  index: number,
  raw: string,
  length: number,
): { nextSlots: OtpDigitSlot[]; focusIndex: number | null } => {
  const pastedDigits = stripNonDigits(raw);

  if (pastedDigits.length > 1) {
    const nextSlots = [...slots];
    pastedDigits
      .slice(0, length)
      .split("")
      .forEach((digit: string, offset: number) => {
        const slotIndex = index + offset;
        if (slotIndex < length) nextSlots[slotIndex] = digit;
      });
    return {
      nextSlots,
      focusIndex: Math.min(index + pastedDigits.length, length - 1),
    };
  }

  if (!/^\d?$/.test(raw)) {
    return { nextSlots: [...slots], focusIndex: null };
  }

  const nextSlots = [...slots];
  nextSlots[index] = raw;
  const focusIndex =
    raw.length > 0 && index < length - 1 ? index + 1 : null;

  return { nextSlots, focusIndex };
};

export const applyOtpPaste = (
  clipboardText: string,
  length: number,
): { nextSlots: OtpDigitSlot[]; focusIndex: number } => {
  const digits = stripNonDigits(clipboardText).slice(0, length);
  const nextSlots = createEmptyOtpSlots(length);
  digits.split("").forEach((digit, index) => {
    nextSlots[index] = digit;
  });
  return {
    nextSlots,
    focusIndex: Math.min(Math.max(digits.length - 1, 0), length - 1),
  };
};

export const resolveOtpBackspaceFocusIndex = (
  index: number,
  slots: readonly OtpDigitSlot[],
): number | null => (index > 0 && !slots[index] ? index - 1 : null);
