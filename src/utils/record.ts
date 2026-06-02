export const omitRecordKey = <
  TRecord extends Record<PropertyKey, TValue>,
  TValue,
  TExcludedKey extends keyof TRecord,
>(
  sourceRecord: TRecord,
  excludedKey: TExcludedKey,
): Omit<TRecord, TExcludedKey> => {
  const { [excludedKey]: _discarded, ...retainedRecord } = sourceRecord;
  return retainedRecord;
};
