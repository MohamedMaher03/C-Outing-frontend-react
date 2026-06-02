export const PRICE_LEVEL_VALUES = [
  "cheapest",
  "cheap",
  "midrange",
  "expensive",
  "luxury",
] as const;

export type CanonicalPriceLevel = (typeof PRICE_LEVEL_VALUES)[number];

export interface PriceLevelMeta {
  label: string;
  caption: string;
  symbol: string;
}

export const PRICE_LEVEL_META: Record<CanonicalPriceLevel, PriceLevelMeta> = {
  cheapest: {
    label: "Economy",
    caption: "Most affordable",
    symbol: "$",
  },
  cheap: {
    label: "Value",
    caption: "Great value",
    symbol: "$$",
  },
  midrange: {
    label: "Standard",
    caption: "Balanced spend",
    symbol: "$$$",
  },
  expensive: {
    label: "Premium",
    caption: "Upscale picks",
    symbol: "$$$$",
  },
  luxury: {
    label: "Luxury",
    caption: "High-end experiences",
    symbol: "$$$$$",
  },
};

export interface PriceLevelOption<
  T extends CanonicalPriceLevel = CanonicalPriceLevel,
> extends PriceLevelMeta {
  value: T;
}

export const PRICE_LEVEL_OPTIONS: ReadonlyArray<PriceLevelOption> =
  PRICE_LEVEL_VALUES.map((priceLevel) => ({
    value: priceLevel,
    ...PRICE_LEVEL_META[priceLevel],
  }));

export type PriceLevelOptionTransformer<TResult> = (
  optionPayload: PriceLevelOption,
) => TResult;

export const projectPriceLevelOptions = <TResult>(
  transformer: PriceLevelOptionTransformer<TResult>,
): ReadonlyArray<TResult> =>
  typeof transformer === "function"
    ? PRICE_LEVEL_OPTIONS.map((optionPayload) => transformer(optionPayload))
    : [];

export const toCanonicalPriceLevel = (
  candidate: unknown,
): CanonicalPriceLevel | null => {
  const normalizedCandidate =
    typeof candidate === "string" ? candidate.trim().toLowerCase() : "";

  return (
    PRICE_LEVEL_VALUES.find((priceLevel) => priceLevel === normalizedCandidate) ??
    null
  );
};

export const BUDGET_OPTIONS = projectPriceLevelOptions(
  ({ value, label, symbol }) => ({
    value,
    label: `${label} (${symbol})`,
  }),
);
