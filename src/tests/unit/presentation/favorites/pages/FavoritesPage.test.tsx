import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import FavoritesPage from "@/features/favorites/pages/FavoritesPage";
import { useFavorites } from "@/features/favorites/hooks/useFavorites";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/features/favorites/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
}));

jest.mock("@/features/home/hooks/useUserLocation", () => ({
  useUserLocation: () => ({
    status: "idle",
    coordinates: null,
    message: null,
    errorCode: null,
    requestLocation: jest.fn(),
  }),
}));

jest.mock("@/features/home/components/PlaceCard", () => ({
  __esModule: true,
  default: ({
    place,
    onClick,
    onToggleSave,
  }: {
    place: { id: string };
    onClick?: (id: string) => void;
    onToggleSave?: (id: string) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onClick?.(place.id)}>
        open-{place.id}
      </button>
      <button type="button" onClick={() => onToggleSave?.(place.id)}>
        save-{place.id}
      </button>
    </div>
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

jest.mock("framer-motion", () => ({
  useReducedMotion: () => false,
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    formatNumber: (value: number) => String(value),
  }),
}));

const mockedUseFavorites = useFavorites as jest.MockedFunction<typeof useFavorites>;

const baseHookState = {
  favorites: [
    {
      venue: {
        id: "v1",
        name: "Nile Spot",
      },
      createdAt: "2026-04-16T10:00:00.000Z",
    },
  ],
  loading: false,
  error: null,
  pageIndex: 0,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
  savePendingMap: {},
  actionError: null,
  toggleSave: jest.fn().mockResolvedValue(undefined),
  refreshFavorites: jest.fn().mockResolvedValue(undefined),
  clearActionError: jest.fn(),
};

describe("FavoritesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseFavorites.mockReturnValue(baseHookState as never);
  });

  it("renders loading state when first fetch is in progress", () => {
    mockedUseFavorites.mockReturnValue({
      ...baseHookState,
      loading: true,
      favorites: [],
    } as never);

    render(<FavoritesPage />);

    expect(screen.getByText("favorites.loading.title")).toBeInTheDocument();
  });

  it("retries list fetch on error", async () => {
    mockedUseFavorites.mockReturnValue({
      ...baseHookState,
      favorites: [],
      error: "failed to load",
    } as never);

    render(<FavoritesPage />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "common.retry" }));
    });

    await waitFor(() => {
      expect(baseHookState.refreshFavorites).toHaveBeenCalledWith({
        showLoader: false,
        showPageError: true,
      });
    });
  });

  it("opens a venue and toggles save from card actions", () => {
    render(<FavoritesPage />);

    fireEvent.click(screen.getByRole("button", { name: "open-v1" }));
    fireEvent.click(screen.getByRole("button", { name: "save-v1" }));

    expect(mockNavigate).toHaveBeenCalledWith("/venue/v1");
    expect(baseHookState.toggleSave).toHaveBeenCalledWith("v1");
  });
});
