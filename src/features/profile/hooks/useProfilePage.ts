import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { POPULAR_DISTRICTS } from "@/mocks/mockData";
import { BUDGET_OPTIONS as SHARED_BUDGET_OPTIONS } from "@/utils/priceLevels";
import type { PriceLevel } from "@/features/admin/types";
import { useProfile } from "@/features/profile/hooks/useProfile";
import {
  filterDistrictsByQuery,
  paginateItems,
} from "@/features/onboarding/utils/districtBrowse";
import { createPreferenceLabelResolvers } from "@/features/onboarding/utils/preferenceLabels";
import { buildOnboardingVibeCopy } from "@/features/onboarding/utils/onboardingPresentation";
import { resolveVibeBand, VIBE_PRESET_SCORES } from "@/features/onboarding/utils/vibeBand";
import {
  preferenceFieldHasIssue,
  scrollToPreferenceSection,
} from "@/features/profile/utils/preferenceValidationChrome";
import { formatPreferenceValidationIssues } from "@/features/onboarding/utils/preferenceValidationI18n";
import {
  buildProfileHeaderView,
  resolveAccountChevronClass,
  resolveValidationSectionRing,
} from "@/features/profile/utils/profilePresentation";
import { localizeAccountRoutes } from "@/features/profile/utils/profileAccountCatalog";
import type { PreferenceValidationField } from "@/features/onboarding/utils/onboardingPreferences";
import { getErrorMessage } from "@/utils/apiError";

const PROFILE_DISTRICT_PAGE_SIZE = 8;

const PROFILE_BUDGET_OPTIONS =
  SHARED_BUDGET_OPTIONS as Array<{ value: PriceLevel; label: string }>;

const VALIDATION_TOAST_DURATION_MS = 6000;

export type ProfileValidationToast = {
  id: number;
  message: string;
};

export const useProfilePage = () => {
  const navigate = useNavigate();
  const { t, formatNumber, direction } = useI18n();
  const profileState = useProfile();

  const [activeTab, setActiveTab] = useState("preferences");
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtPage, setDistrictPage] = useState(1);
  const [validationToast, setValidationToast] =
    useState<ProfileValidationToast | null>(null);
  const validationToastTimerRef = useRef<number | null>(null);

  const labels = useMemo(() => createPreferenceLabelResolvers(t), [t]);
  const accountRoutes = useMemo(() => localizeAccountRoutes(t), [t]);
  const accountChevronClassName = resolveAccountChevronClass(direction);

  const headerView = useMemo(
    () =>
      buildProfileHeaderView(
        profileState.profile,
        formatNumber,
        t("profile.userFallback"),
        t("profile.stat.phoneMissing"),
      ),
    [profileState.profile, formatNumber, t],
  );

  const filteredDistricts = useMemo(
    () =>
      filterDistrictsByQuery(
        POPULAR_DISTRICTS,
        districtSearch,
        labels.district,
      ),
    [districtSearch, labels.district],
  );

  const districtBrowse = useMemo(
    () =>
      paginateItems(
        filteredDistricts,
        districtPage,
        PROFILE_DISTRICT_PAGE_SIZE,
      ),
    [filteredDistricts, districtPage],
  );

  const vibeScore = profileState.vibe[0] ?? 50;
  const vibeBand = resolveVibeBand(vibeScore);
  const vibeCopy = useMemo(
    () => buildOnboardingVibeCopy(t, vibeBand),
    [t, vibeBand],
  );

  const sectionIssueRing = useCallback(
    (field: PreferenceValidationField) =>
      resolveValidationSectionRing(preferenceFieldHasIssue(
        profileState.saveValidationIssues,
        field,
      )),
    [profileState.saveValidationIssues],
  );

  const applyDistrictSearch = useCallback((value: string) => {
    setDistrictSearch(value);
    setDistrictPage(1);
  }, []);

  const shiftDistrictPage = useCallback(
    (delta: number) => {
      setDistrictPage((current) =>
        Math.min(
          districtBrowse.totalPages,
          Math.max(1, current + delta),
        ),
      );
    },
    [districtBrowse.totalPages],
  );

  const applyVibePreset = useCallback(
    (band: keyof typeof VIBE_PRESET_SCORES) => {
      profileState.setVibe([VIBE_PRESET_SCORES[band]]);
    },
    [profileState],
  );

  const showValidationToast = useCallback(
    (message: string) => {
      if (validationToastTimerRef.current != null) {
        window.clearTimeout(validationToastTimerRef.current);
      }

      const id = Date.now();
      setValidationToast({ id, message });

      validationToastTimerRef.current = window.setTimeout(() => {
        setValidationToast((current) =>
          current?.id === id ? null : current,
        );
        validationToastTimerRef.current = null;
      }, VALIDATION_TOAST_DURATION_MS);
    },
    [],
  );

  useEffect(
    () => () => {
      if (validationToastTimerRef.current != null) {
        window.clearTimeout(validationToastTimerRef.current);
      }
    },
    [],
  );

  const persistPreferences = useCallback(async () => {
    try {
      const result = await profileState.savePreferences();

      if (!result.ok) {
        if (result.issues.length === 0) {
          return;
        }

        const messages = formatPreferenceValidationIssues(result.issues, t);
        const toastMessage =
          messages.length > 1
            ? t("profile.preferences.validationToastMultiple", {
                message: messages[0],
                count: messages.length,
              })
            : messages[0];

        showValidationToast(toastMessage);
        scrollToPreferenceSection(result.issues[0].field);
        return;
      }
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        t("profile.error.savePreferencesFallback"),
      );

      showValidationToast(message);
      console.error("[useProfilePage] Failed to persist profile preferences.", {
        message,
        error: error instanceof Error ? error : undefined,
      });
    }
  }, [profileState, showValidationToast, t]);

  const openEditProfile = useCallback(() => navigate("/profile/edit"), [navigate]);
  const openAccountRoute = useCallback(
    (path: string) => navigate(path),
    [navigate],
  );

  const isPreferencesTabActive = activeTab === "preferences";
  const showPreferencesError =
    profileState.saveValidationIssues.length > 0 ||
    (Boolean(profileState.error) && isPreferencesTabActive);

  return {
    t,
    formatNumber,
    direction,
    ...profileState,
    activeTab,
    setActiveTab,
    isPreferencesTabActive,
    showPreferencesError,
    labels,
    accountRoutes,
    accountChevronClassName,
    headerView,
    districtSearch,
    applyDistrictSearch,
    districtBrowse,
    shiftDistrictPage,
    vibeScore,
    vibeBand,
    vibeCopy,
    sectionIssueRing,
    applyVibePreset,
    persistPreferences,
    validationToast,
    dismissValidationToast: () => setValidationToast(null),
    openEditProfile,
    openAccountRoute,
    budgetOptions: PROFILE_BUDGET_OPTIONS,
  };
};
