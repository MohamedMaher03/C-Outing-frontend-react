import { AnimatePresence } from "framer-motion";
import { useSessionPage } from "../hooks/useSessionPage";
import { SessionTopBar } from "../components/SessionTopBar";
import { SessionWaitingRoom } from "../components/SessionWaitingRoom";
import { SessionLoadingRecsView } from "../components/SessionLoadingRecsView";
import { SessionRecommendationsView } from "../components/SessionRecommendationsView";
import { SessionIdleView } from "../components/SessionIdleView";

export default function SessionPage() {
  const {
    t,
    user,
    prefersReducedMotion,
    navigate,
    status,
    session,
    recommendations,
    error,
    isHost,
    memberCount,
    isRestoring,
    recommendationCount,
    leaveActionLabel,
    capacityPresentation,
    showSessionCodeInTopBar,
    isWaitingPhase,
    exitSessionAndReturnHome,
    openVenueFromRecommendation,
    requestDefaultRecommendations,
    requestRecommendationBatch,
    refreshRecommendations,
    waitingRoomCopy,
    recommendationsCopy,
    loadingCopy,
    idleCopy,
  } = useSessionPage();

  const loadingSubtitle = recommendations
    ? loadingCopy.subtitleCount
    : loadingCopy.subtitle;

  return (
    <div className="min-h-screen bg-background">
      <SessionTopBar
        title={t("session.page.topbar.title")}
        backHomeAria={t("session.page.backHomeAria")}
        sessionCode={
          showSessionCodeInTopBar ? session?.code : undefined
        }
        onBackHome={() => navigate("/")}
      />

      <AnimatePresence mode="wait">
        {isWaitingPhase && (
          <SessionWaitingRoom
            status={status}
            session={session}
            error={error}
            isHost={isHost}
            memberCount={memberCount}
            currentUserId={user?.userId}
            prefersReducedMotion={prefersReducedMotion}
            leaveActionLabel={leaveActionLabel}
            capacityPresentation={capacityPresentation}
            copy={waitingRoomCopy}
            onRequestDefaultRecommendations={requestDefaultRecommendations}
            onExitSession={exitSessionAndReturnHome}
          />
        )}

        {status === "loading-recs" && (
          <SessionLoadingRecsView
            prefersReducedMotion={prefersReducedMotion}
            title={loadingCopy.title}
            subtitle={loadingSubtitle}
          />
        )}

        {status === "ready" && (
          <SessionRecommendationsView
            session={session}
            recommendations={recommendations}
            status={status}
            isHost={isHost}
            recommendationCount={recommendationCount}
            error={error}
            prefersReducedMotion={prefersReducedMotion}
            leaveActionLabel={leaveActionLabel}
            copy={recommendationsCopy}
            onRefresh={refreshRecommendations}
            onExitSession={exitSessionAndReturnHome}
            onRecCountChange={requestRecommendationBatch}
            onOpenVenue={openVenueFromRecommendation}
          />
        )}

        {status === "idle" &&
          (isRestoring ? (
            <SessionLoadingRecsView
              prefersReducedMotion={prefersReducedMotion}
              title={loadingCopy.title}
              subtitle={loadingSubtitle}
            />
          ) : (
            <SessionIdleView
              prefersReducedMotion={prefersReducedMotion}
              title={idleCopy.title}
              subtitle={error ?? idleCopy.subtitle}
              backLabel={idleCopy.back}
              onBackHome={() => navigate("/")}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}
