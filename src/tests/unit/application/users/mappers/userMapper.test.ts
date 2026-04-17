import {
  buildFallbackPublicProfileFromReviews,
  mapProfileDtoToPublicProfile,
  mapReviewDtoToActivity,
  mapReviewsPageToActivity,
} from "@/features/users/mappers/userMapper";

describe("users mapper", () => {
  it("maps profile dto to public profile with safe fallbacks", () => {
    const profile = mapProfileDtoToPublicProfile(
      {
        id: "99",
        name: "",
        email: " user@example.com ",
        createdAt: "2026-04-10T10:00:00.000Z",
      },
      5,
    );

    expect(profile.userId).toBe("99");
    expect(profile.name).toBe("Outing User");
    expect(profile.email).toBe("user@example.com");
    expect(profile.reviewCount).toBe(5);
    expect(profile.joinedDate).toBe("2026-04-10T10:00:00.000Z");
  });

  it("maps review dto to activity and clamps rating", () => {
    const activity = mapReviewDtoToActivity({
      id: "r1",
      venueId: "v1",
      venueName: "",
      userId: "u1",
      userName: "User",
      comment: "",
      rating: 99,
      createdAt: "invalid",
    } as never);

    expect(activity.reviewId).toBe("r1");
    expect(activity.placeName).toBe("Unknown place");
    expect(activity.rating).toBe(5);
    expect(activity.comment).toBe("No comment provided.");
    expect(activity.date).toBe(new Date(0).toISOString());
  });

  it("maps paginated reviews and builds fallback profile from reviews", () => {
    const page = {
      items: [
        {
          id: "r1",
          venueId: "v1",
          venueName: "Venue",
          userId: "u1",
          userName: "Reviewer",
          comment: "Great",
          rating: 4,
          createdAt: "2026-04-10T10:00:00.000Z",
        },
      ],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    } as const;

    expect(mapReviewsPageToActivity(page as never)).toHaveLength(1);

    const fallback = buildFallbackPublicProfileFromReviews("u1", page as never);
    expect(fallback.name).toBe("Reviewer");
    expect(fallback.reviewCount).toBe(1);
  });
});
