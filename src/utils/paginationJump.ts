export const parsePageJumpDraft = (draft: string): number | null => {
  const candidate = Number(draft);
  return Number.isFinite(candidate) ? Math.floor(candidate) : null;
};

export const syncPageJumpDraft = (pageIndex: number): string =>
  String(pageIndex);
