import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useHomeSeeAll } from "@/features/home/hooks/useHomeSeeAll";
import {
  resetViewportScroll,
  resolveSeeAllCollectionHeader,
  SEE_ALL_COUNT_STEPS,
} from "@/features/home/utils/homeSeeAllPresentation";

export const useHomeSeeAllPage = () => {
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const { collection, moodId } = useParams<{
    collection?: string;
    moodId?: string;
  }>();

  const resolvedCollection = collection ?? (moodId ? "mood" : undefined);

  const seeAllData = useHomeSeeAll({
    collection: resolvedCollection,
    moodId,
  });

  const collectionHeader = useMemo(
    () =>
      seeAllData.safeCollection
        ? resolveSeeAllCollectionHeader(
            seeAllData.safeCollection,
            t,
            moodId,
          )
        : null,
    [seeAllData.safeCollection, t, moodId],
  );

  useEffect(() => {
    resetViewportScroll();
  }, [collection, moodId]);

  const navigateHome = () => navigate("/");

  const openVenueDetail = (venueId: string) => navigate(`/venue/${venueId}`);

  const isSavePendingFor = (venueId: string) =>
    Boolean(seeAllData.savePendingMap[venueId]);

  return {
    t,
    formatNumber,
    navigateHome,
    openVenueDetail,
    isSavePendingFor,
    countSteps: SEE_ALL_COUNT_STEPS,
    collectionHeader,
    ...seeAllData,
  };
};
