export const withAdminServiceError = async <T>(
  operation: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(fallbackMessage, error);
    const details = error instanceof Error ? error.message : "";
    if (!details || details === fallbackMessage) {
      throw new Error(fallbackMessage);
    }

    throw new Error(`${fallbackMessage}. ${details}`);
  }
};
