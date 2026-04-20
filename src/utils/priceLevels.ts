export const PRICE_LEVEL_VALUES = [
  "price_cheapest",
  "cheap",
  "mid_range",
  "expensive",
  "luxury",
] as const; //here i define only aloowed values make it const to prevent modification and to get literal types

export type CanonicalPriceLevel = (typeof PRICE_LEVEL_VALUES)[number];

export interface PriceLevelMeta {
  label: string;
  caption: string;
  symbol: string;
}

export const PRICE_LEVEL_META: Record<CanonicalPriceLevel, PriceLevelMeta> = {
  price_cheapest: {
    label: "Economy",
    caption: "Most affordable",
    symbol: "$",
  },
  cheap: {
    label: "Value",
    caption: "Great value",
    symbol: "$$",
  },
  mid_range: {
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

export const PRICE_LEVEL_OPTIONS: PriceLevelOption[] = PRICE_LEVEL_VALUES.map(
  (value) => ({
    value,
    ...PRICE_LEVEL_META[value],
  }),
);
//here i become have shape like this :
// {
//   value: "cheap",
//   label: "Value",
//   caption: "Great value",
//   symbol: "$$"
// }

export const BUDGET_OPTIONS: Array<{
  value: CanonicalPriceLevel;
  label: string;
}> = PRICE_LEVEL_OPTIONS.map((option) => ({
  value: option.value,
  label: `${option.label} (${option.symbol})`,
}));
/*'
This code can separte 
in ui use label ->Value ($$) or Luxury ($$$$$)
but system-> will only get value like cheap or luxury when user select an option
*/
