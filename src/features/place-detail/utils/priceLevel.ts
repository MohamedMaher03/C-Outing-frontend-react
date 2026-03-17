import type { PriceLevel } from "../types";

export const PRICE_SYMBOL: Record<PriceLevel, string> = {
  price_cheapest: "$",
  cheap: "$$",
  mid_range: "$$$",
  expensive: "$$$$",
  luxury: "$$$$$",
};
