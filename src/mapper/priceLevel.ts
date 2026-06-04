import {
  PRICE_LEVEL_VALUES,
  type CanonicalPriceLevel,
} from "@/utils/priceLevels";
import { coerceFiniteNumber, coerceTrimmedString } from "./coercion";

const CANONICAL_PRICE_LEVEL_SET = new Set<CanonicalPriceLevel>(PRICE_LEVEL_VALUES);

const NUMERIC_PRICE_THRESHOLDS: Array<[number, CanonicalPriceLevel]> = [
  [1, "cheapest"],
  [2, "cheap"],
  [3, "midrange"],
  [4, "expensive"],
  [Number.POSITIVE_INFINITY, "luxury"],
];

export const resolvePriceLevelFromNumeric = (
  value: number,
): CanonicalPriceLevel | undefined => {
  if (!Number.isFinite(value)) return undefined;
  return NUMERIC_PRICE_THRESHOLDS.find(([threshold]) => value <= threshold)?.[1];
};

const COLLAPSED_PRICE_ALIASES: Record<string, CanonicalPriceLevel> = {
  pricecheapest: "cheapest",
  cheapest: "cheapest",
  free: "cheapest",
  verycheap: "cheapest",
  cheap: "cheap",
  budget: "cheap",
  value: "cheap",
  low: "cheap",
  midrange: "midrange",
  medium: "midrange",
  moderate: "midrange",
  standard: "midrange",
  expensive: "expensive",
  premium: "expensive",
  high: "expensive",
  luxury: "luxury",
  highend: "luxury",
  vip: "luxury",
};

const EMPTY_PRICE_LABELS = new Set(["", "unknown", "n/a", "na"]);

export const resolvePriceLevelFromLabel = (
  value: string,
): CanonicalPriceLevel | undefined => {
  const normalized = value.trim().toLowerCase();
  if (EMPTY_PRICE_LABELS.has(normalized)) return undefined;

  const underscored = normalized.replace(/[\s-]+/g, "_");
  if (CANONICAL_PRICE_LEVEL_SET.has(underscored as CanonicalPriceLevel)) {
    return underscored as CanonicalPriceLevel;
  }

  const collapsed = normalized.replace(/[\s_-]+/g, "");
  return COLLAPSED_PRICE_ALIASES[collapsed];
};

export const resolveCanonicalPriceLevel = (
  ...values: unknown[]
): CanonicalPriceLevel | undefined => {
  for (const value of values) {
    const numericPrice = coerceFiniteNumber(value);
    if (numericPrice !== undefined) {
      const fromNumeric = resolvePriceLevelFromNumeric(numericPrice);
      if (fromNumeric) return fromNumeric;
    }

    const label = coerceTrimmedString(value);
    if (label) {
      const fromLabel = resolvePriceLevelFromLabel(label);
      if (fromLabel) return fromLabel;
    }
  }
  return undefined;
};

export const resolveExactCanonicalPriceLevel = (
  value: unknown,
): CanonicalPriceLevel | undefined => {
  const label = coerceTrimmedString(value)?.toLowerCase();
  if (!label || !CANONICAL_PRICE_LEVEL_SET.has(label as CanonicalPriceLevel)) {
    return undefined;
  }
  return label as CanonicalPriceLevel;
};

export const resolvePriceLevelFromBooleanFlags = (
  flags: Record<string, unknown>,
): CanonicalPriceLevel | undefined => {
  if (flags.priceLuxury === true) return "luxury";
  if (flags.priceExpensive === true) return "expensive";
  if (flags.priceMidRange === true) return "midrange";
  if (flags.priceCheap === true) return "cheap";
  if (flags.priceCheapest === true) return "cheapest";
  return undefined;
};

export const resolveVenuePriceLevel = (
  data: Record<string, unknown>,
): CanonicalPriceLevel | undefined =>
  resolveCanonicalPriceLevel(
    data.priceRange_Display,
    data.priceRangeDisplay,
    data.priceRange,
    data.priceLevel,
  ) ?? resolvePriceLevelFromBooleanFlags(data);
