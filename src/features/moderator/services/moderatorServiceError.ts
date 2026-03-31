export const withModeratorServiceError = async <T>(
  operation: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const details = error instanceof Error ? error.message.trim() : "";

    if (!details) {
      throw new Error(fallbackMessage);
    }

    if (details.toLowerCase().includes(fallbackMessage.toLowerCase())) {
      throw new Error(details);
    }

    throw new Error(`${fallbackMessage}. ${details}`);
  }
};
