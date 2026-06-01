import type { District } from "@/mocks/mockData";

export interface PaginatedSlice<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

export const clampPageIndex = (page: number, totalPages: number): number =>
  Math.min(Math.max(page, 1), Math.max(1, totalPages));

export const paginateItems = <T>(
  source: readonly T[],
  page: number,
  pageSize: number,
): PaginatedSlice<T> => {
  const totalPages = Math.max(1, Math.ceil(source.length / pageSize));
  const safePage = clampPageIndex(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  return {
    items: source.slice(offset, offset + pageSize),
    page: safePage,
    totalPages,
    totalItems: source.length,
  };
};

export const buildDistrictLookup = (
  districts: readonly District[],
): Map<string, District> =>
  new Map(districts.map((district) => [district.name, district]));

export const filterDistrictsByQuery = (
  districts: readonly District[],
  query: string,
  resolveLabel: (district: District) => string,
): District[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [...districts];

  return districts.filter((district) => {
    const localizedLabel = resolveLabel(district).toLocaleLowerCase();
    const canonicalName = district.name.toLocaleLowerCase();
    return (
      localizedLabel.includes(normalizedQuery) ||
      canonicalName.includes(normalizedQuery)
    );
  });
};

export const resolveDistrictRecord = (
  lookup: Map<string, District>,
  districtName: string,
): District =>
  lookup.get(districtName) ?? {
    id: districtName.toLowerCase().replace(/\s+/g, "-"),
    name: districtName,
  };
