import { ApiError } from "@/utils/apiError";
import {
  filterPlaces,
  filterReviews,
  filterUsers,
} from "@/features/admin/utils/adminFilters";
import {
  isGoogleMapsVenueUrl,
  toCreatePlaceInput,
  validatePlaceForm,
} from "@/features/admin/utils/placeForm";
import { withAdminServiceError } from "@/features/admin/services/adminServiceError";

describe("admin utilities", () => {
  it("filters users by search and role", () => {
    const users = [
      {
        userId: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: "admin",
        status: "active",
        joinedDate: new Date(),
        lastActive: new Date(),
        reviewCount: 3,
      },
      {
        userId: "u2",
        name: "Bob",
        email: "bob@example.com",
        role: "user",
        status: "active",
        joinedDate: new Date(),
        lastActive: new Date(),
        reviewCount: 1,
      },
    ] as const;

    expect(filterUsers([...users], "ali", "all")).toHaveLength(1);
    expect(filterUsers([...users], "example", "admin")).toHaveLength(1);
    expect(filterUsers([...users], "example", "moderator")).toHaveLength(0);
  });

  it("filters places and reviews by search and status", () => {
    const places = [
      {
        id: "p1",
        name: "Nile Cafe",
        category: "Cafe",
        district: "Maadi",
        rating: 4.4,
        reviewCount: 20,
        status: "active",
        createdAt: new Date(),
        image: "img",
      },
      {
        id: "p2",
        name: "Downtown Bar",
        category: "Bar",
        district: "Downtown",
        rating: 4,
        reviewCount: 10,
        status: "flagged",
        createdAt: new Date(),
        image: "img",
      },
    ] as const;

    const reviews = [
      {
        id: "r1",
        userId: "u1",
        userName: "Alice",
        placeId: "p1",
        placeName: "Nile Cafe",
        rating: 5,
        comment: "Great ambiance",
        status: "published",
        reportCount: 0,
        createdAt: new Date(),
      },
      {
        id: "r2",
        userId: "u2",
        userName: "Bob",
        placeId: "p2",
        placeName: "Downtown Bar",
        rating: 2,
        comment: "Too noisy",
        status: "flagged",
        reportCount: 3,
        createdAt: new Date(),
      },
    ] as const;

    expect(filterPlaces([...places], "downtown", "all")).toHaveLength(1);
    expect(filterPlaces([...places], "", "flagged")).toHaveLength(1);

    expect(filterReviews([...reviews], "alice", "all")).toHaveLength(1);
    expect(filterReviews([...reviews], "", "flagged")).toHaveLength(1);
  });

  it("validates and maps google maps venue urls", () => {
    expect(isGoogleMapsVenueUrl("https://maps.app.goo.gl/abc123")).toBe(true);
    expect(isGoogleMapsVenueUrl("https://www.google.com/maps/place/test")).toBe(
      true,
    );
    expect(isGoogleMapsVenueUrl("https://example.com/place")).toBe(false);

    expect(validatePlaceForm({ venueUrl: "   " }).venueUrl).toContain(
      "required",
    );
    expect(
      validatePlaceForm({ venueUrl: "https://example.com" }).venueUrl,
    ).toContain("valid Google Maps");

    expect(
      toCreatePlaceInput({ venueUrl: "  https://maps.app.goo.gl/abc  " }),
    ).toEqual({
      venueUrl: "https://maps.app.goo.gl/abc",
    });
  });

  it("preserves ApiError and normalizes generic service errors", async () => {
    const apiError = new ApiError("Forbidden", 403);

    await expect(
      withAdminServiceError(async () => {
        throw apiError;
      }, "Fallback message"),
    ).rejects.toBe(apiError);

    await expect(
      withAdminServiceError(async () => {
        throw new Error("network failed");
      }, "Failed to load"),
    ).rejects.toThrow("Failed to load. network failed");

    await expect(
      withAdminServiceError(async () => {
        throw "";
      }, "Failed to load"),
    ).rejects.toThrow("Failed to load");
  });
});
