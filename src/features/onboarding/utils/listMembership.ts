export const flipListMembership = <T extends string>(
  current: readonly T[],
  candidate: T,
): T[] =>
  current.includes(candidate)
    ? current.filter((entry) => entry !== candidate)
    : [...current, candidate];

export const toSelectionSet = <T extends string>(
  values: readonly T[],
): Set<T> => new Set(values);

export const remainingSelectionQuota = (
  selectedCount: number,
  minimumRequired: number,
): number => Math.max(0, minimumRequired - selectedCount);
