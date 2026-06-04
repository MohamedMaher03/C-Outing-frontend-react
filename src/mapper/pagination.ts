import type { PaginatedResponse } from "@/types";
import {
  coerceBoolean,
  coerceFiniteNumberWithFallback,
  coerceNonNegativeInteger,
} from "./coercion";

export interface AdminPaginatedDto<TItem> {
  items: TItem[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminPaginationOptions {
  defaultPageSize?: number;
  zeroBasedPageIndex?: boolean;
}

export const mapAdminPaginatedResponse = <TSource, TDomain>(
  page: AdminPaginatedDto<TSource>,
  itemMapper: (item: TSource) => TDomain,
  options: AdminPaginationOptions = {},
): PaginatedResponse<TDomain> => {
  const defaultPageSize = options.defaultPageSize ?? 10;
  const mappedItems = page.items.map(itemMapper);
  const pageSize = Math.max(
    1,
    Math.trunc(coerceFiniteNumberWithFallback(page.pageSize, defaultPageSize)),
  );
  const rawPageIndex = Math.trunc(
    coerceFiniteNumberWithFallback(page.pageIndex, options.zeroBasedPageIndex ? 0 : 1),
  );
  const pageIndex = options.zeroBasedPageIndex ? rawPageIndex + 1 : rawPageIndex;
  const totalCount = Math.max(
    0,
    Math.trunc(coerceFiniteNumberWithFallback(page.totalCount, mappedItems.length)),
  );
  const fallbackTotalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const totalPages = Math.max(
    1,
    Math.trunc(coerceFiniteNumberWithFallback(page.totalPages, fallbackTotalPages)),
  );

  return {
    items: mappedItems,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage:
      typeof page.hasPreviousPage === "boolean"
        ? page.hasPreviousPage
        : pageIndex > 1,
    hasNextPage:
      typeof page.hasNextPage === "boolean"
        ? page.hasNextPage
        : pageIndex < totalPages,
  };
};

export interface LoosePaginatedPayload {
  pageIndex?: unknown;
  pageSize?: unknown;
  totalCount?: unknown;
  totalPages?: unknown;
  hasPreviousPage?: unknown;
  hasNextPage?: unknown;
}

export const mapLoosePaginatedPayload = <TDomain>(
  payload: LoosePaginatedPayload,
  items: TDomain[],
): PaginatedResponse<TDomain> => {
  const pageIndex = Math.max(
    1,
    Math.trunc(coerceFiniteNumberWithFallback(payload.pageIndex, 1)),
  );
  const pageSize = Math.max(
    1,
    Math.trunc(coerceFiniteNumberWithFallback(payload.pageSize, items.length || 1)),
  );
  const totalCount = Math.max(
    0,
    Math.trunc(coerceFiniteNumberWithFallback(payload.totalCount, items.length)),
  );
  const totalPages = Math.max(
    1,
    Math.trunc(coerceFiniteNumberWithFallback(payload.totalPages, 1)),
  );
  const hasPreviousPage =
    coerceBoolean(payload.hasPreviousPage) ?? pageIndex > 1;
  const hasNextPage = coerceBoolean(payload.hasNextPage) ?? pageIndex < totalPages;

  return {
    items,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };
};

export const normalizeUnreadCount = (value: unknown): number =>
  coerceNonNegativeInteger(value, 0);
