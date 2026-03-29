export const PRICE_LEVEL_VALUES = [
  "price_cheapest",
  "cheap",
  "mid_range",
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
  price_cheapest: {
    label: "Very Budget",
    caption: "Lowest spend",
    symbol: "$",
  },
  cheap: {
    label: "Budget",
    caption: "Wallet-friendly",
    symbol: "$$",
  },
  mid_range: {
    label: "Mid-range",
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

export const PRICE_LEVEL_OPTIONS: PriceLevelOption[] = PRICE_LEVEL_VALUES.map(
  (value) => ({
    value,
    ...PRICE_LEVEL_META[value],
  }),
);

export const BUDGET_OPTIONS: Array<{
  value: CanonicalPriceLevel;
  label: string;
}> = PRICE_LEVEL_OPTIONS.map((option) => ({
  value: option.value,
  label: `${option.label} (${option.symbol})`,
}));
