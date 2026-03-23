export const withAdminServiceError = async <T>(
  operation: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(fallbackMessage, error);
    throw new Error(fallbackMessage);
  }
};
