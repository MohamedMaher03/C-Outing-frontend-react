import { fireEvent, render, screen } from "@testing-library/react";
import PlaceDetailPage from "@/features/place-detail/pages/PlaceDetailPage";
import { usePlaceDetail } from "@/features/place-detail/hooks/usePlaceDetail";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "p1" }),
}));

jest.mock("@/features/place-detail/placeDetailTypography.css", () => ({}));

jest.mock("@/features/place-detail/hooks/usePlaceDetail", () => ({
  usePlaceDetail: jest.fn(),
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    formatNumber: (value: number) => String(value),
  }),
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ text }: { text?: string }) => <div>{text ?? "loading"}</div>,
}));

const mockedUsePlaceDetail = usePlaceDetail as jest.MockedFunction<
  typeof usePlaceDetail
>;

const baseHookState = {
  place: null,
  loading: false,
  error: null,
  isFavorite: false,
  savingFavorite: false,
  isLiked: false,
  savingLike: false,
  currentUserId: "u1",
  canOpenInMaps: false,
  notification: { show: false, type: null, action: "added" },
  reviews: [],
  reviewsPagination: {
    pageIndex: 0,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
  },
  loadingMoreReviews: false,
  socialReviews: [],
  socialReviewsPagination: {
    pageIndex: 0,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
  },
  loadingMoreSocialReviews: false,
  myReview: null,
  myReviewLoading: false,
  reviewsLoading: false,
  socialReviewsLoading: false,
  socialReviewsLoaded: false,
  reviewsError: null,
  socialReviewsError: null,
  submittingReview: false,
  deletingReview: false,
  reportingReview: false,
  reviewSubmitted: false,
  reviewActionError: null,
  toggleFavorite: jest.fn().mockResolvedValue(undefined),
  toggleLike: jest.fn().mockResolvedValue(undefined),
  isReviewReported: jest.fn().mockReturnValue(false),
  openInMaps: jest.fn(),
  goBack: jest.fn(),
  handleSubmitReview: jest.fn().mockResolvedValue(undefined),
  handleDeleteMyReview: jest.fn().mockResolvedValue(undefined),
  handleReportReview: jest.fn().mockResolvedValue(undefined),
  loadMoreReviews: jest.fn().mockResolvedValue(undefined),
  loadMoreSocialReviews: jest.fn().mockResolvedValue(undefined),
  trackInteraction: jest.fn().mockResolvedValue(undefined),
  refreshPlaceData: jest.fn().mockResolvedValue(undefined),
  retryReviewsLoad: jest.fn().mockResolvedValue(undefined),
  retrySocialReviewsLoad: jest.fn().mockResolvedValue(undefined),
  ensureSocialReviewsLoaded: jest.fn().mockResolvedValue(undefined),
};

describe("PlaceDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePlaceDetail.mockReturnValue(baseHookState as never);
  });

  it("renders loading state", () => {
    mockedUsePlaceDetail.mockReturnValue({
      ...baseHookState,
      loading: true,
    } as never);

    render(<PlaceDetailPage />);

    expect(screen.getByText("placeDetail.loading")).toBeInTheDocument();
  });

  it("renders error state and retries page refresh", () => {
    mockedUsePlaceDetail.mockReturnValue({
      ...baseHookState,
      error: "failed",
      place: null,
    } as never);

    render(<PlaceDetailPage />);

    fireEvent.click(screen.getByRole("button", { name: "common.retry" }));

    expect(baseHookState.refreshPlaceData).toHaveBeenCalledTimes(1);
  });
});
