export const maskAccountEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!domain || localPart.length <= 2) return email;
  const obscuredCore = `${localPart[0]}${"*".repeat(localPart.length - 2)}${localPart.at(-1)}`;
  return `${obscuredCore}@${domain}`;
};

export const embedMaskedEmailForCopy = (email: string): string =>
  `\u2068${maskAccountEmail(email)}\u2069`;
