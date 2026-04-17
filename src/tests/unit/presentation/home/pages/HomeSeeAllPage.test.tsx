import { fireEvent, render, screen } from "@testing-library/react";
import HomeSeeAllPage from "@/features/home/pages/HomeSeeAllPage";
import { useHomeSeeAll } from "@/features/home/hooks/useHomeSeeAll";

const mockNavigate = jest.fn();
const mockParams = jest.fn(() => ({ collection: "curated" }));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams(),
}));

jest.mock("@/features/home/hooks/useHomeSeeAll", () => ({
  useHomeSeeAll: jest.fn(),
}));

jest.mock("@/features/home/components/PlaceCard", () => ({
  __esModule: true,
  default: ({
    place,
    onClick,
  }: {
    place: { id: string };
    onClick: (id: string) => void;
  }) => (
    <button type="button" onClick={() => onClick(place.id)}>
      open-{place.id}
    </button>
  ),
}));

jest.mock("@/features/home/components/LocationPermissionBanner", () => ({
  __esModule: true,
  default: () => <div>location-banner</div>,
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  __esModule: true,
  PageLoading: ({ text }: { text?: string }) => <div>{text ?? "loading"}</div>,
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      if (key === "home.seeAll.countOption") {
        return `count-${String(vars?.count ?? "")}`;
      }
      return key;
    },
    formatNumber: (value: number) => String(value),
  }),
}));

const mockedUseHomeSeeAll = useHomeSeeAll as jest.MockedFunction<
  typeof useHomeSeeAll
>;

const baseHookState = {
  safeCollection: "curated" as const,
  places: [
    {
      id: "p1",
      name: "Nile Spot",
      category: "Cafe",
      latitude: 30,
      longitude: 31,
      address: "Maadi",
      rating: 4.5,
      reviewCount: 10,
      image: "img.png",
      priceLevel: "mid_range",
      isOpen: true,
      atmosphereTags: [],
      hasWifi: true,
      isSaved: false,
      matchScore: 0.8,
    },
  ],
  isLoading: false,
  error: null,
  count: 20,
  setCount: jest.fn(),
  retryFetch: jest.fn(),
  userLocation: {
    status: "idle",
    coordinates: null,
    message: null,
    errorCode: null,
    requestLocation: jest.fn(),
  },
  requestUserLocation: jest.fn(),
};

describe("HomeSeeAllPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.mockReturnValue({ collection: "curated" });
    mockedUseHomeSeeAll.mockReturnValue(baseHookState as never);
  });

  it("renders invalid-collection fallback and navigates home", () => {
    mockedUseHomeSeeAll.mockReturnValue({
      ...baseHookState,
      safeCollection: null,
    } as never);

    render(<HomeSeeAllPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "home.seeAll.backHome" }),
    );

    expect(
      screen.getByText("home.seeAll.invalidType.title"),
    ).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("changes count and opens a place from the list", () => {
    render(<HomeSeeAllPage />);

    fireEvent.click(screen.getByRole("button", { name: "count-30" }));
    fireEvent.click(screen.getByRole("button", { name: "open-p1" }));

    expect(baseHookState.setCount).toHaveBeenCalledWith(30);
    expect(mockNavigate).toHaveBeenCalledWith("/venue/p1");
  });

  it("shows loading state when data is pending", () => {
    mockedUseHomeSeeAll.mockReturnValue({
      ...baseHookState,
      isLoading: true,
    } as never);

    render(<HomeSeeAllPage />);

    expect(screen.getByText("home.seeAll.loading")).toBeInTheDocument();
  });
});
