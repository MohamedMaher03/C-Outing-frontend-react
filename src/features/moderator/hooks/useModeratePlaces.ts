import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdminPlace, AdminPlaceStatus } from "@/features/admin/types";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type {
  ModeratePlaceFormData,
  ModeratePlaceFormErrors,
  ModeratorPlaceStatusFilter,
  ModeratePlaceToast,
} from "@/features/moderator/types";
import { isGoogleMapsVenueUrl } from "@/features/admin/utils/placeForm";
import {
  getErrorMessage,
  resolveApiUiErrorState,
  type ApiUiErrorState,
} from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

const EMPTY_FORM: ModeratePlaceFormData = {
  venueUrl: "",
};

interface UseModeratePlacesReturn {
  places: AdminPlace[];
  loading: boolean;
  error: string | null;
  queueErrorState: ApiUiErrorState | null;
  pendingPlaceIds: string[];
  pendingPlaceIdSet: ReadonlySet<string>;

  search: string;
  statusFilter: ModeratorPlaceStatusFilter;
  filteredPlaces: AdminPlace[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  pendingCount: number;
  flaggedCount: number;

  showAddForm: boolean;
  form: ModeratePlaceFormData;
  formErrors: ModeratePlaceFormErrors;
  submittingForm: boolean;

  toasts: ModeratePlaceToast[];

  setSearch: (value: string) => void;
  setStatusFilter: (value: ModeratorPlaceStatusFilter) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  setShowAddForm: (value: boolean | ((prev: boolean) => boolean)) => void;
  setForm: (
    value:
      | ModeratePlaceFormData
      | ((prev: ModeratePlaceFormData) => ModeratePlaceFormData),
  ) => void;

  retry: () => Promise<void>;
  handleApprove: (placeId: string) => Promise<void>;
  handleFlag: (placeId: string) => Promise<void>;
  handleAddPlace: () => Promise<void>;
}

export const useModeratePlaces = (): UseModeratePlacesReturn => {
  const { t } = useI18n();
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueErrorState, setQueueErrorState] =
    useState<ApiUiErrorState | null>(null);
  const [pendingPlaceIds, setPendingPlaceIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ModeratorPlaceStatusFilter>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ModeratePlaceFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<ModeratePlaceFormErrors>({});
  const [submittingForm, setSubmittingForm] = useState(false);
  const [toasts, setToasts] = useState<ModeratePlaceToast[]>([]);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());
  const toastTimersRef = useRef<number[]>([]);
  const searchRef = useRef("");
  const statusFilterRef = useRef(statusFilter);
  const pendingPlaceIdSet = useMemo(
    () => new Set(pendingPlaceIds),
    [pendingPlaceIds],
  );

  const PLACES_PAGE_SIZE = 10;
  const [pageIndex, setPageIndex] = useState(1);
  const pageIndexRef = useRef(pageIndex);
  pageIndexRef.current = pageIndex;
  const [pageSize, setPageSize] = useState(PLACES_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);

  const [deferredSearch, setDeferredSearch] = useState(search);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      setDeferredSearch(search);
      debounceTimerRef.current = null;
    }, 650);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  searchRef.current = deferredSearch;
  statusFilterRef.current = statusFilter;

  const loadPlaces = useCallback(
    async (explicitPage?: number) => {
      setLoading(true);
      setError(null);
      setQueueErrorState(null);
      const targetPage = explicitPage ?? pageIndexRef.current;

      try {
        const placesData = await moderatorService.getPlaces({
          page: targetPage,
          count: PLACES_PAGE_SIZE,
          searchTerm: searchRef.current || undefined,
          status: statusFilterRef.current,
        });

        const [pendingResult, flaggedResult] = await Promise.allSettled([
          moderatorService.getPlaces({
            page: 1,
            count: 1,
            searchTerm: searchRef.current || undefined,
            status: "pending",
          }),
          moderatorService.getPlaces({
            page: 1,
            count: 1,
            searchTerm: searchRef.current || undefined,
            status: "flagged",
          }),
        ]);

        if (!mountedRef.current) return;

        const normalizedTotalPages = Math.max(1, placesData.totalPages);
        const normalizedPage = Math.min(
          Math.max(1, targetPage),
          normalizedTotalPages,
        );

        setPlaces(placesData.items);
        setPageIndex(normalizedPage);
        setPageSize(Math.max(1, placesData.pageSize));
        setTotalCount(Math.max(0, placesData.totalCount));
        setTotalPages(normalizedTotalPages);
        setHasPreviousPage(normalizedPage > 1);
        setHasNextPage(normalizedPage < normalizedTotalPages);
        if (pendingResult.status === "fulfilled") {
          setPendingCount(Math.max(0, pendingResult.value.totalCount));
        }
        if (flaggedResult.status === "fulfilled") {
          setFlaggedCount(Math.max(0, flaggedResult.value.totalCount));
        }
        setQueueErrorState(null);
      } catch (err) {
        if (!mountedRef.current) return;

        const resolvedError = resolveApiUiErrorState(err, {
          forbiddenMessage: t("moderator.places.error.forbiddenMessage"),
          loadFailureMessage: t("moderator.places.error.loadFailureMessage"),
          genericMessage: t("moderator.error.loadPlaces"),
        });

        setQueueErrorState(resolvedError);
        setError(resolvedError.message);
        setPlaces([]);
        setTotalCount(0);
        setTotalPages(1);
        setHasPreviousPage(false);
        setHasNextPage(false);
        setPendingCount(0);
        setFlaggedCount(0);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [t],
  );

  const initialLoadDone = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    void loadPlaces();
    initialLoadDone.current = true;

    return () => {
      mountedRef.current = false;
      toastTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      toastTimersRef.current = [];
    };
  }, [loadPlaces]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    void loadPlaces(1);
  }, [deferredSearch, statusFilter, loadPlaces]);

  const addPendingPlace = useCallback((placeId: string) => {
    setPendingPlaceIds((prev) =>
      prev.includes(placeId) ? prev : [...prev, placeId],
    );
  }, []);

  const removePendingPlace = useCallback((placeId: string) => {
    setPendingPlaceIds((prev) => prev.filter((id) => id !== placeId));
  }, []);

  const showToast = (
    message: string,
    variant: ModeratePlaceToast["variant"] = "success",
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    const timerId = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimersRef.current = toastTimersRef.current.filter(
        (value) => value !== timerId,
      );
    }, 3500);

    toastTimersRef.current.push(timerId);
  };

  const handleStatusChange = useCallback(
    async (
      placeId: string,
      status: AdminPlaceStatus,
      successMessage: string,
    ) => {
      if (inFlightRef.current.has(placeId)) {
        return;
      }

      inFlightRef.current.add(placeId);
      addPendingPlace(placeId);
      setError(null);

      try {
        await moderatorService.updatePlaceStatus(placeId, status);
        if (!mountedRef.current) return;

        void loadPlaces(pageIndexRef.current);

        showToast(successMessage, status === "flagged" ? "warning" : "success");
      } catch (err) {
        if (!mountedRef.current) return;

        const resolvedError = resolveApiUiErrorState(err, {
          forbiddenMessage: t("moderator.places.error.forbiddenMessage"),
          loadFailureMessage: t("moderator.places.error.loadFailureMessage"),
          genericMessage: t("moderator.error.updatePlaceStatus"),
        });

        if (resolvedError.kind === "forbidden") {
          setQueueErrorState(resolvedError);
        }

        const message = getErrorMessage(
          err,
          t("moderator.error.updatePlaceStatus"),
        );
        setError(message);
        showToast(message, "error");
      } finally {
        inFlightRef.current.delete(placeId);
        if (mountedRef.current) {
          removePendingPlace(placeId);
        }
      }
    },
    [addPendingPlace, removePendingPlace, t],
  );

  const validateForm = (): boolean => {
    const errors: ModeratePlaceFormErrors = {};
    const trimmedVenueUrl = form.venueUrl.trim();

    if (!trimmedVenueUrl) {
      errors.venueUrl = t(
        "admin.places.form.error.venueUrlRequired",
        undefined,
        "Google Maps URL is required.",
      );
    } else if (!isGoogleMapsVenueUrl(trimmedVenueUrl)) {
      errors.venueUrl = t(
        "admin.places.form.error.venueUrlInvalid",
        undefined,
        "Please enter a valid Google Maps place URL.",
      );
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApprove = useCallback(
    async (placeId: string) => {
      await handleStatusChange(
        placeId,
        "active",
        t("moderator.places.toast.approved"),
      );
    },
    [handleStatusChange, t],
  );

  const handleFlag = useCallback(
    async (placeId: string) => {
      await handleStatusChange(
        placeId,
        "flagged",
        t("moderator.places.toast.flagged"),
      );
    },
    [handleStatusChange, t],
  );

  const handleAddPlace = async () => {
    if (submittingForm) {
      return;
    }

    if (!validateForm()) {
      setError(t("moderator.error.fixValidation"));
      return;
    }

    setSubmittingForm(true);
    setError(null);

    try {
      await moderatorService.addPlace({
        venueUrl: form.venueUrl.trim(),
      });

      if (!mountedRef.current) return;

      void loadPlaces(pageIndexRef.current);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setShowAddForm(false);
      showToast(
        t(
          "moderator.places.toast.scrapeStarted",
          undefined,
          "Scraping started. The venue will appear after processing.",
        ),
      );
    } catch (err) {
      if (!mountedRef.current) return;

      const resolvedError = resolveApiUiErrorState(err, {
        forbiddenMessage: t("moderator.places.error.forbiddenMessage"),
        loadFailureMessage: t("moderator.places.error.loadFailureMessage"),
        genericMessage: t("moderator.error.addPlace"),
      });

      if (resolvedError.kind === "forbidden") {
        setQueueErrorState(resolvedError);
      }

      const message = getErrorMessage(err, t("moderator.error.addPlace"));
      setError(message);
      showToast(message, "error");
    } finally {
      if (mountedRef.current) {
        setSubmittingForm(false);
      }
    }
  };

  const filteredPlaces = useMemo(() => places, [places]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(1);
  };

  const handleStatusFilterChange = (value: ModeratorPlaceStatusFilter) => {
    setStatusFilter(value);
    setPageIndex(1);
  };

  const goToPreviousPage = () => {
    if (!hasPreviousPage || loading) return;
    const nextPage = Math.max(1, pageIndex - 1);
    setPageIndex(nextPage);
    void loadPlaces(nextPage);
  };

  const goToNextPage = () => {
    if (!hasNextPage || loading) return;
    const nextPage = Math.min(totalPages, pageIndex + 1);
    setPageIndex(nextPage);
    void loadPlaces(nextPage);
  };

  return {
    places,
    loading,
    error,
    queueErrorState,
    pendingPlaceIds,
    pendingPlaceIdSet,
    search,
    statusFilter,
    filteredPlaces,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    pendingCount,
    flaggedCount,
    showAddForm,
    form,
    formErrors,
    submittingForm,
    toasts,
    setSearch: handleSearchChange,
    setStatusFilter: handleStatusFilterChange,
    goToPreviousPage,
    goToNextPage,
    setShowAddForm,
    setForm,
    retry: loadPlaces,
    handleApprove,
    handleFlag,
    handleAddPlace,
  };
};
