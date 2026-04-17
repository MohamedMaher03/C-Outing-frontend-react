import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PublicProfilePage from "@/features/users/pages/PublicProfilePage";
import { usePublicProfile } from "@/features/users/hooks/usePublicProfile";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "u1" }),
}));

jest.mock("@/features/users/hooks/usePublicProfile", () => ({
  usePublicProfile: jest.fn(),
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  __esModule: true,
  PageLoading: ({ text }: { text?: string }) => <div>{text ?? "loading"}</div>,
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "en-US",
    formatNumber: (value: number) => String(value),
  }),
}));

const mockedUsePublicProfile = usePublicProfile as jest.MockedFunction<
  typeof usePublicProfile
>;

const baseHookState = {
  profile: {
    userId: "u1",
    name: "Maher",
    email: "maher@example.com",
    joinedDate: "2020-01-01T00:00:00.000Z",
    reviewCount: 1,
    totalInteractions: 5,
    age: 24,
    bio: "Bio",
    avatar: "",
    isBanned: false,
  },
  reviews: [
    {
      reviewId: "r1",
      placeId: "p1",
      placeName: "Nile Spot",
      rating: 4,
      comment: "Great",
      date: "2026-04-16T10:00:00.000Z",
    },
  ],
  loading: false,
  isReloading: false,
  error: null,
  reviewsWarning: null,
  isOwnProfile: false,
  reload: jest.fn().mockResolvedValue(undefined),
  clearReviewsWarning: jest.fn(),
};

describe("PublicProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePublicProfile.mockReturnValue(baseHookState as never);
  });

  it("renders loading state while profile is being fetched", () => {
    mockedUsePublicProfile.mockReturnValue({
      ...baseHookState,
      loading: true,
    } as never);

    render(
      <MemoryRouter>
        <PublicProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("users.publicProfile.loading")).toBeInTheDocument();
  });

  it("renders error view and retries profile loading", () => {
    mockedUsePublicProfile.mockReturnValue({
      ...baseHookState,
      profile: null,
      error: "failed",
    } as never);

    render(
      <MemoryRouter>
        <PublicProfilePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "common.retry" }));

    expect(baseHookState.reload).toHaveBeenCalledTimes(1);
  });

  it("renders profile and review content", () => {
    render(
      <MemoryRouter>
        <PublicProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Maher")).toBeInTheDocument();
    expect(screen.getByText("Nile Spot")).toBeInTheDocument();
    expect(screen.getByText("Great")).toBeInTheDocument();
  });
});
