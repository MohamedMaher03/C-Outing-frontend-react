import { buildHomeImageCandidates } from "@/features/home/utils/imageUrl";

describe("buildHomeImageCandidates", () => {
  it("returns empty list for non-string values", () => {
    expect(buildHomeImageCandidates(undefined)).toEqual([]);
    expect(buildHomeImageCandidates(null)).toEqual([]);
    expect(buildHomeImageCandidates(42)).toEqual([]);
  });

  it("returns only the original URL for non-google sources", () => {
    const image = "https://cdn.example.com/venues/coffee.jpg";

    expect(buildHomeImageCandidates(image)).toEqual([image]);
  });

  it("adds resilient fallbacks for googleusercontent transformed URLs", () => {
    const googleImage =
      "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoa123=w2000-h1500-k-no";

    expect(buildHomeImageCandidates(googleImage)).toEqual([
      googleImage,
      "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoa123=s1200",
      "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoa123",
    ]);
  });

  it("keeps googleusercontent URL as-is when no transform suffix exists", () => {
    const googleImage =
      "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoa123";

    expect(buildHomeImageCandidates(googleImage)).toEqual([googleImage]);
  });
});
