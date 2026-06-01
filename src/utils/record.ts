export const omitRecordKey = <T extends Record<string, boolean>>(
  source: T,
  key: string,
): T => {
  const { [key]: _removed, ...rest } = source;
  return rest as T;
};
