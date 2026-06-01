export interface LocalizedFilterChip<V extends string = string> {
  value: V;
  label: string;
}

export const localizeAdminStatusFilters = <V extends string>(
  options: readonly LocalizedFilterChip<V>[],
  translate: (key: string, values?: Record<string, string | number>, fallback?: string) => string,
): LocalizedFilterChip<V>[] =>
  options.map((option) => ({
    ...option,
    label:
      option.value === "all"
        ? translate("admin.filter.all")
        : translate(`admin.status.${option.value}`),
  }));

export const localizeModeratorReportFilters = <V extends string>(
  options: readonly LocalizedFilterChip<V>[],
  translate: (key: string, values?: Record<string, string | number>, fallback?: string) => string,
): LocalizedFilterChip<V>[] =>
  options.map((option) => ({
    ...option,
    label:
      option.value === "all"
        ? translate("admin.filter.all")
        : translate(`moderator.report.status.${option.value}`),
  }));
