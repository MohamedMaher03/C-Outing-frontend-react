export const tallyReviewQueueSummary = <
  T extends { status: string },
>(
  reviews: readonly T[],
) =>
  reviews.reduce(
    (summary, review) => ({
      flagged: summary.flagged + (review.status === "flagged" ? 1 : 0),
      pending: summary.pending + (review.status === "pending" ? 1 : 0),
    }),
    { flagged: 0, pending: 0 },
  );

export const tallyReportQueueSummary = <
  T extends { status: string },
>(
  reports: readonly T[],
) =>
  reports.reduce(
    (summary, report) => ({
      open: summary.open + (report.status === "open" ? 1 : 0),
      investigating:
        summary.investigating + (report.status === "investigating" ? 1 : 0),
    }),
    { open: 0, investigating: 0 },
  );

export interface ReportRowActionPendingFlags {
  isPending: boolean;
  isStatusPending: boolean;
  isDeletePending: boolean;
  isWarnPending: boolean;
  isBanPending: boolean;
}

export const deriveReportRowActionPendingFlags = (
  reportId: string,
  pendingReportIdSet: ReadonlySet<string>,
  actionLoading: string | null,
): ReportRowActionPendingFlags => ({
  isPending: pendingReportIdSet.has(reportId),
  isStatusPending: actionLoading?.startsWith(`${reportId}_status_`) ?? false,
  isDeletePending: actionLoading === `${reportId}_delete`,
  isWarnPending: actionLoading === `${reportId}_warn`,
  isBanPending: actionLoading === `${reportId}_ban`,
});

export const PLACE_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f4efe5'/%3E%3Crect x='14' y='18' width='68' height='60' rx='10' fill='%23e5d8bf'/%3E%3Ccircle cx='38' cy='42' r='9' fill='%23967f59'/%3E%3Cpath d='M24 67c4-8 12-12 20-12s16 4 20 12' stroke='%23806a49' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

export const REVIEW_AVATAR_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f4efe5'/%3E%3Ccircle cx='48' cy='36' r='16' fill='%23c8b088'/%3E%3Crect x='22' y='58' width='52' height='24' rx='12' fill='%23967f59'/%3E%3C/svg%3E";

export const assignImageFallbackOnError = (
  event: { currentTarget: HTMLImageElement },
  fallbackSrc: string,
) => {
  event.currentTarget.src = fallbackSrc;
};
