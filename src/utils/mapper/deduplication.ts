export const dedupeByKey = <TItem>(
  items: TItem[] | null | undefined,
  keySelector: (item: TItem) => string | undefined,
): TItem[] => {
  if (!Array.isArray(items)) return [];

  const seenKeys = new Set<string>();

  return items.reduce<TItem[]>((uniqueItems, item) => {
    const key = keySelector(item)?.trim();
    if (!key || seenKeys.has(key)) return uniqueItems;
    seenKeys.add(key);
    uniqueItems.push(item);
    return uniqueItems;
  }, []);
};

export const mapPayloadCollection = <TDomain>(
  collection: unknown[],
  itemMapper: (raw: unknown) => TDomain | null,
  keySelector: (item: TDomain) => string,
): TDomain[] =>
  dedupeByKey(
    collection.flatMap((raw) => {
      const mapped = itemMapper(raw);
      return mapped ? [mapped] : [];
    }),
    keySelector,
  );
