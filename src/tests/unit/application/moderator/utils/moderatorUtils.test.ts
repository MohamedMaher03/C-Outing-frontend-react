import { ApiError } from "@/utils/apiError";
import {
  filterModerationPlaces,
  filterModerationReviews,
  filterReportedContent,
} from "@/features/moderator/utils/moderatorFilters";
import {
  formatCount,
  formatDateTime,
  formatLongDate,
  formatRelativeTime,
  formatShortDate,
  pluralize,
} from "@/features/moderator/utils/formatters";
import { withModeratorServiceError } from "@/features/moderator/services/moderatorServiceError";

describe("moderator utilities", () => {
  it("filters moderation places, reviews, and reports", () => {
    const places = [
      {
        id: "p1",
        name: "Nile Spot",
        category: "Cafe",
        district: "Maadi",
        rating: 4.2,
        reviewCount: 10,
        status: "active",
        createdAt: new Date(),
        image: "img",
      },
      {
        id: "p2",
        name: "Flagged Place",
        category: "Restaurant",
        district: "Downtown",
        rating: 3.2,
        reviewCount: 7,
        status: "flagged",
        createdAt: new Date(),
        image: "img",
      },
    ] as const;

    const reviews = [
      {
        id: "r1",
        userId: "u1",
        userName: "Reviewer",
        placeId: "p1",
        placeName: "Nile Spot",
        rating: 4,
        comment: "Good",
        status: "published",
        reportCount: 0,
        createdAt: new Date(),
      },
      {
        id: "r2",
        userId: "u2",
        userName: "Other",
        placeId: "p2",
        placeName: "Flagged Place",
        rating: 1,
        comment: "Spam",
        status: "flagged",
        reportCount: 2,
        createdAt: new Date(),
      },
    ] as const;

    const reports = [
      {
        id: "rp1",
        type: "review",
        reportedItemId: "r2",
        reportedItemName: "Spam review",
        reporterName: "User A",
        reporterId: 1,
        reason: "Spam",
        description: "Contains links",
        status: "open",
        priority: "high",
        createdAt: new Date(),
      },
      {
        id: "rp2",
        type: "place",
        reportedItemId: "p2",
        reportedItemName: "Wrong location",
        reporterName: "User B",
        reporterId: 2,
        reason: "Inaccurate",
        description: "Wrong pin",
        status: "resolved",
        priority: "low",
        createdAt: new Date(),
      },
    ] as const;

    expect(filterModerationPlaces([...places], "nile", "all")).toHaveLength(1);
    expect(filterModerationPlaces([...places], "", "flagged")).toHaveLength(1);

    expect(
      filterModerationReviews([...reviews], "reviewer", "all"),
    ).toHaveLength(1);
    expect(filterModerationReviews([...reviews], "", "flagged")).toHaveLength(
      1,
    );

    expect(
      filterReportedContent([...reports], "spam", "all", "all"),
    ).toHaveLength(1);
    expect(
      filterReportedContent([...reports], "", "resolved", "place"),
    ).toHaveLength(1);
  });

  it("formats counts, dates, relative times, and plural labels", () => {
    const nowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2026-04-16T12:00:00.000Z").getTime());

    expect(formatCount(1234, "en-US")).toBe("1,234");
    expect(formatShortDate("invalid")).toBe("-");
    expect(formatLongDate("invalid")).toBe("-");
    expect(formatDateTime("invalid")).toBe("-");

    const oneHourAgo = new Date("2026-04-16T11:00:00.000Z");
    expect(formatRelativeTime(oneHourAgo).toLowerCase()).toContain("hour");

    expect(pluralize(1, "review")).toBe("review");
    expect(pluralize(2, "review")).toBe("reviews");

    nowSpy.mockRestore();
  });

  it("preserves ApiError and wraps unknown service errors", async () => {
    const apiError = new ApiError("Forbidden", 403);

    await expect(
      withModeratorServiceError(async () => {
        throw apiError;
      }, "Fallback"),
    ).rejects.toBe(apiError);

    await expect(
      withModeratorServiceError(async () => {
        throw new Error("backend unavailable");
      }, "Failed moderation action"),
    ).rejects.toThrow("Failed moderation action. backend unavailable");
  });
});
