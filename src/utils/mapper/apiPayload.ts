import { isObjectRecord } from "@/utils/typeGuards";

export interface ApiSuccessEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

const DEFAULT_COLLECTION_KEYS = [
  "items",
  "results",
  "venues",
  "data",
] as const;

export const unwrapNestedDataPayload = (
  raw: unknown,
  maxDepth = 3,
): unknown => {
  let current: unknown = raw;
  let depth = 0;

  while (
    depth < maxDepth &&
    isObjectRecord(current) &&
    Object.prototype.hasOwnProperty.call(current, "data")
  ) {
    const next = current.data;
    if (next === undefined || next === null) break;
    current = next;
    depth += 1;
  }

  return current;
};

export const unwrapSuccessEnvelope = <T>(payload: ApiSuccessEnvelope<T> | T): T => {
  if (
    isObjectRecord(payload) &&
    "data" in payload &&
    "success" in payload
  ) {
    return (payload as unknown as ApiSuccessEnvelope<T>).data;
  }
  return payload as T;
};

export const extractPayloadCollection = (
  raw: unknown,
  collectionKeys: readonly string[] = DEFAULT_COLLECTION_KEYS,
): unknown[] => {
  const payload = unwrapNestedDataPayload(raw, 2);
  if (Array.isArray(payload)) return payload;
  if (!isObjectRecord(payload)) return [];

  return collectionKeys.reduce<unknown[]>(
    (collection, key) =>
      collection.length > 0
        ? collection
        : Array.isArray(payload[key])
          ? (payload[key] as unknown[])
          : collection,
    [],
  );
};

export const extractEnvelopeArray = <T>(data: T[] | { items: T[] }): T[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as { items: T[] })?.items)) {
    return (data as { items: T[] }).items;
  }
  return [];
};
