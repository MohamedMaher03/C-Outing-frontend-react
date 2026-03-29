import type { PriceLevel } from "../types";
import { PRICE_LEVEL_META as SHARED_PRICE_LEVEL_META } from "@/utils/priceLevels";

export const PRICE_LEVEL_META: Record<
  PriceLevel,
  { label: string; symbol: string }
> = SHARED_PRICE_LEVEL_META as Record<
  PriceLevel,
  { label: string; symbol: string }
>;
