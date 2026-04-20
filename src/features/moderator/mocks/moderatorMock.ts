import type {
  ModeratorStats,
  ReportedContent,
  ModerationAction,
} from "../types";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const MOCK_MODERATOR_STATS: ModeratorStats = {
  pendingReviews: 12,
  flaggedPlaces: 3,
  openReports: 7,
  resolvedToday: 4,
  resolvedThisWeek: 18,
  totalModerated: 342,
};

export const MOCK_REPORTED_CONTENT: ReportedContent[] = [
  {
    id: "rpt1",
    type: "review",
    reportedItemId: "r3",
    reportedItemName: "Review on Cairo Jazz Club",
    reporterName: "Ahmed Khalil",
    reporterId: 1,
    reason: "Inappropriate content",
    description:
      "This review contains offensive language and personal attacks against staff.",
    reviewContent:
      "This place is terrible. Contains inappropriate content... [flagged for review]",
    reviewAuthorName: "Mohamed Nasser",
    status: "open",
    priority: "high",
    createdAt: new Date("2026-03-02T14:20:00"),
  },
  {
    id: "rpt2",
    type: "review",
    reportedItemId: "r5",
    reportedItemName: "Review on Nile Felucca Experience",
    reporterName: "Sara Mohamed",
    reporterId: 2,
    reason: "Spam",
    description:
      "Contains external links and promotional content not related to the venue.",
    reviewContent: "Spam review with links to external sites...",
    reviewAuthorName: "Nour Samir",
    status: "open",
    priority: "medium",
    createdAt: new Date("2026-03-03T09:00:00"),
  },
  {
    id: "rpt3",
    type: "place",
    reportedItemId: "4",
    reportedItemName: "Suspicious Place XYZ",
    reporterName: "Layla Ibrahim",
    reporterId: 6,
    reason: "Fake listing",
    description:
      "This place doesn't exist at the listed address. I went there and found nothing.",
    status: "investigating",
    priority: "high",
    createdAt: new Date("2026-02-28T16:45:00"),
  },
  {
    id: "rpt4",
    type: "user",
    reportedItemId: "5",
    reportedItemName: "Mohamed Nasser",
    reporterName: "Youssef Adel",
    reporterId: 7,
    reason: "Harassment",
    description:
      "This user has been leaving harassing comments on multiple reviews.",
    status: "open",
    priority: "high",
    createdAt: new Date("2026-03-01T11:30:00"),
  },
  {
    id: "rpt5",
    type: "review",
    reportedItemId: "r2",
    reportedItemName: "Review on Zooba",
    reporterName: "Fatima Ali",
    reporterId: 4,
    reason: "Misleading information",
    description:
      "The prices mentioned in this review are completely wrong and misleading.",
    reviewContent:
      "Great food but the wait times can be long on weekends. The hawawshi is a must-try!",
    reviewAuthorName: "Fatima Ali",
    status: "resolved",
    priority: "low",
    createdAt: new Date("2026-02-25T08:15:00"),
    resolvedAt: new Date("2026-02-26T10:30:00"),
  },
  {
    id: "rpt6",
    type: "place",
    reportedItemId: "6",
    reportedItemName: "Removed Old Venue",
    reporterName: "Nour Samir",
    reporterId: 8,
    reason: "Permanently closed",
    description: "This venue has been permanently closed for over 6 months.",
    status: "dismissed",
    priority: "low",
    createdAt: new Date("2026-02-20T14:00:00"),
    resolvedAt: new Date("2026-02-21T09:00:00"),
  },
  {
    id: "rpt7",
    type: "review",
    reportedItemId: "r1",
    reportedItemName: "Review on Nile Felucca Experience",
    reporterName: "Ahmed Khalil",
    reporterId: 1,
    reason: "Copyright violation",
    description:
      "This review copies text from a travel blog without attribution.",
    reviewContent:
      "Absolutely magical experience! The sunset from the felucca was breathtaking. Highly recommend for couples.",
    reviewAuthorName: "Ahmed Khalil",
    status: "investigating",
    priority: "medium",
    createdAt: new Date("2026-03-02T20:00:00"),
  },
];

export const MOCK_MODERATION_ACTIONS: ModerationAction[] = [
  {
    id: "ma1",
    action: "removed",
    moderatorName: "Sara Mohamed",
    itemType: "review",
    itemName: "Spam review on Zooba",
    timestamp: new Date("2026-03-03T10:00:00"),
  },
  {
    id: "ma2",
    action: "approved",
    moderatorName: "Sara Mohamed",
    itemType: "review",
    itemName: "Review on Al-Azhar Park",
    timestamp: new Date("2026-03-02T18:30:00"),
  },
  {
    id: "ma3",
    action: "warned",
    moderatorName: "Youssef Adel",
    itemType: "user",
    itemName: "Mohamed Nasser",
    timestamp: new Date("2026-03-02T15:00:00"),
    note: "First warning for inappropriate content",
  },
  {
    id: "ma4",
    action: "escalated",
    moderatorName: "Youssef Adel",
    itemType: "place",
    itemName: "Suspicious Place XYZ",
    timestamp: new Date("2026-03-01T09:00:00"),
    note: "Needs admin review",
  },
  {
    id: "ma5",
    action: "approved",
    moderatorName: "Sara Mohamed",
    itemType: "place",
    itemName: "New Café in Maadi",
    timestamp: new Date("2026-02-28T14:00:00"),
  },
];

export const moderatorMock = {
  async getStats(): Promise<ModeratorStats> {
    await delay(500);
    return { ...MOCK_MODERATOR_STATS };
  },

  async getReportedContent(): Promise<ReportedContent[]> {
    await delay(600);
    return [...MOCK_REPORTED_CONTENT];
  },

  async updateReportStatus(
    reportId: string,
    status: ReportedContent["status"],
  ): Promise<void> {
    await delay(400);
    const report = MOCK_REPORTED_CONTENT.find((r) => r.id === reportId);
    if (report) {
      report.status = status;
      if (status === "resolved" || status === "dismissed") {
        report.resolvedAt = new Date();
      }
    }
  },

  async getRecentActions(): Promise<ModerationAction[]> {
    await delay(400);
    return [...MOCK_MODERATION_ACTIONS];
  },

  async deleteReview(reportId: string): Promise<void> {
    await delay(500);
    const report = MOCK_REPORTED_CONTENT.find((r) => r.id === reportId);
    if (report) {
      report.status = "resolved";
      report.resolvedAt = new Date();
    }
  },

  async warnUser(reportId: string): Promise<void> {
    await delay(400);
    const report = MOCK_REPORTED_CONTENT.find((r) => r.id === reportId);
    if (report) {
      report.status = "resolved";
      report.resolvedAt = new Date();
    }
  },

  async banUser(reportId: string): Promise<void> {
    await delay(500);
    const report = MOCK_REPORTED_CONTENT.find((r) => r.id === reportId);
    if (report) {
      report.status = "resolved";
      report.resolvedAt = new Date();
    }
  },
};
