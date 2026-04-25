import {
  mapHomePlacesPayload,
  mapHomeVenueToPlace,
} from "@/features/home/api/homeApi.mapper";

const backendVenueFixture = {
  id: "ffae5327-13b7-4777-b9f6-761a6c71d835",
  name: "Cozy Coffee Shop",
  location: "",
  category: "Cafe",
  district: "Second New Cairo",
  type: null,
  priceRange: "Unknown",
  latitude: 30.043126,
  longitude: 31.496446,
  averageRating: 5,
  reviewCount: 1,
  displayImageUrl:
    "https://lh3.googleusercontent.com/a-/ALV-UjV_pPhMrl5jHbIgKfQTraE-N1WeLue9vvO5tjl4jhKlt1IrOLrS=w2000-h1500-k-no",
  thumbnailUrl:
    "https://lh3.googleusercontent.com/a-/ALV-UjV_pPhMrl5jHbIgKfQTraE-N1WeLue9vvO5tjl4jhKlt1IrOLrS=w2000-h1500-k-no",
  isOpen: false,
  atmosphereTags: [],
  hasWifi: false,
  isSaved: false,
};

describe("homeApi.mapper", () => {
  it("maps backend venue fields into HomePlace", () => {
    const mapped = mapHomeVenueToPlace(backendVenueFixture);

    expect(mapped).toEqual(
      expect.objectContaining({
        id: backendVenueFixture.id,
        name: backendVenueFixture.name,
        category: backendVenueFixture.category,
        address: backendVenueFixture.district,
        latitude: backendVenueFixture.latitude,
        longitude: backendVenueFixture.longitude,
        rating: backendVenueFixture.averageRating,
        reviewCount: backendVenueFixture.reviewCount,
        image: backendVenueFixture.thumbnailUrl,
        priceLevel: undefined,
        isOpen: backendVenueFixture.isOpen,
        atmosphereTags: [],
        hasWifi: backendVenueFixture.hasWifi,
        isSaved: backendVenueFixture.isSaved,
      }),
    );
  });

  it("supports array payloads inside data wrappers", () => {
    const mapped = mapHomePlacesPayload({ data: [backendVenueFixture] });

    expect(mapped).toHaveLength(1);
    expect(mapped[0].id).toBe(backendVenueFixture.id);
  });

  it("drops invalid ids and duplicate venues", () => {
    const mapped = mapHomePlacesPayload({
      items: [
        backendVenueFixture,
        { ...backendVenueFixture },
        { ...backendVenueFixture, id: "" },
      ],
    });

    expect(mapped).toHaveLength(1);
    expect(mapped[0].id).toBe(backendVenueFixture.id);
  });
});
