export const countRecordsWhere = <T>(
  records: readonly T[],
  predicate: (record: T) => boolean,
): number => records.filter(predicate).length;

export const partitionStatCards = <T>(cards: readonly T[], primaryCount = 4) => ({
  primary: cards.slice(0, primaryCount),
  secondary: cards.slice(primaryCount),
});
