import {
  normalizeLikeState,
  normalizePaginatedReviews,
  normalizePlaceDetail,
  normalizeReview,
  sanitizeReportPayload,
} from "@/features/place-detail/mappers/placeDetailMapper";
import {
  getCurrentAuthUserId,
  getCurrentAuthUserProfile,
  readAuthUserSnapshot,
} from "@/features/place-detail/utils/authUser";
import {
  getDefaultAvatarDataUrl,
  getDefaultVenueImageDataUrl,
} from "@/features/place-detail/utils/defaultImages";
import {
  formatCountLabel,
  formatShortDate,
} from "@/features/place-detail/utils/formatters";
import { PRICE_LEVEL_META } from "@/features/place-detail/utils/priceLevel";
import { getReviewIdentity } from "@/features/place-detail/utils/reviewIdentity";
import { getOrCreateSessionId } from "@/features/place-detail/utils/sessionManager";

describe("place-detail utilities and mapper", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("builds fallback image data urls", () => {
    expect(
      getDefaultAvatarDataUrl("John").startsWith("data:image/svg+xml;utf8,"),
    ).toBe(true);
    expect(
      getDefaultVenueImageDataUrl("Nile Cafe").startsWith(
        "data:image/svg+xml;utf8,",
      ),
    ).toBe(true);
  });

  it("extracts auth user snapshots safely", () => {
    localStorage.setItem(
      "authUser",
      JSON.stringify({ id: "u1", name: "Name", avatarUrl: "avatar.png" }),
    );

    expect(readAuthUserSnapshot()).toEqual({
      userId: "u1",
      userName: "Name",
      userAvatar: "avatar.png",
    });
    expect(getCurrentAuthUserId()).toBe("u1");
    expect(getCurrentAuthUserProfile()).toEqual({
      userId: "u1",
      userName: "Name",
      userAvatar: "avatar.png",
    });
  });

  it("creates and reuses a stable session id", () => {
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();

    expect(first).toEqual(second);
    expect(first.startsWith("session_")).toBe(true);
  });

  it("formats date and count labels", () => {
    expect(formatShortDate("invalid")).toBe("-");
    expect(formatCountLabel(1, "review")).toContain("review");
    expect(formatCountLabel(2, "review")).toContain("reviews");
    expect(PRICE_LEVEL_META.mid_range.label).toBe("Standard");
  });

  it("builds review identity and normalizes place detail payload", () => {
    expect(
      getReviewIdentity({
        id: "r1",
        venueId: "v1",
        userId: "u1",
        createdAt: "2026-04-01T00:00:00.000Z",
      } as never),
    ).toBe("id:r1");

    const normalized = normalizePlaceDetail({
      data: {
        data: {
          id: "v1",
          name: "Nile Cafe",
          category: "Cafe",
          averageRating: "4.4",
          reviewCount: "12",
          priceRange_Display: "Premium",
          metroStations: [
            {
              Rank: 2,
              station_name: "Sadat",
              Distance: "1.2 km",
              Time: "5 min",
            },
          ],
        },
      },
    });

    expect(normalized.id).toBe("v1");
    expect(normalized.averageRating).toBe(4.4);
    expect(normalized.reviewCount).toBe(12);
    expect(normalized.priceLevel).toBe("expensive");
    expect(normalized.image.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(normalized.metroStations?.[0]?.stationName).toBe("Sadat");
  });

  it("normalizes reviews and paginated review pages", () => {
    const review = normalizeReview({
      venueId: "v1",
      userId: "u1",
      userName: "Reviewer",
      rating: 9,
      comment: "Great",
      createdAt: "2026-04-16T08:00:00.000Z",
    });

    expect(review.id.startsWith("k:v1:u1:")).toBe(true);
    expect(review.rating).toBe(5);

    const page = normalizePaginatedReviews({
      items: [
        {
          id: "r1",
          venueId: "v1",
          userId: "u1",
          userName: "A",
          rating: 4,
          comment: "A",
          createdAt: "2026-04-01T00:00:00.000Z",
        },
        {
          id: "r1",
          venueId: "v1",
          userId: "u1",
          userName: "A",
          rating: 4,
          comment: "A",
          createdAt: "2026-04-01T00:00:00.000Z",
        },
      ],
      page: 2,
      pageSize: 5,
      totalCount: 20,
      totalPages: 4,
      hasPreviousPage: true,
      hasNextPage: true,
    });

    expect(page.items).toHaveLength(1);
    expect(page.pageIndex).toBe(1);
    expect(page.pageSize).toBe(5);
    expect(page.totalPages).toBe(4);
  });

  it("normalizes like state and sanitizes report payloads", () => {
    expect(normalizeLikeState(true)).toBe(true);
    expect(normalizeLikeState({ data: { isLiked: false } })).toBe(false);
    expect(normalizeLikeState({})).toBeNull();

    expect(
      sanitizeReportPayload({ reason: "  Spam content  ", description: "  " }),
    ).toEqual({
      reason: "Spam content",
      description: null,
    });

    expect(() =>
      sanitizeReportPayload({ reason: "bad", description: "x" }),
    ).toThrow("between 5 and 100 characters");
  });
});
