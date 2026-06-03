import { AnimatePresence } from "framer-motion";
import { useSessionPage } from "../hooks/useSessionPage";
import { SessionTopBar } from "../components/SessionTopBar";
import { SessionWaitingRoom } from "../components/SessionWaitingRoom";
import { SessionLoadingRecsView } from "../components/SessionLoadingRecsView";
import { SessionRecommendationsView } from "../components/SessionRecommendationsView";
import { SessionIdleView } from "../components/SessionIdleView";
import { SessionEndedView } from "../components/SessionVotePanel";

export default function SessionPage() {
  const {
    t,
    user,
    prefersReducedMotion,
    navigate,
    status,
    session,
    recommendations,
    votes,
    error,
    isHost,
    memberCount,
    isRestoring,
    recommendationCount,
    isSubmittingVote,
    isFinalizingVotes,
    myVoteVenueId,
    winningVenueId,
    hasFinalizedWinner,
    leaveActionLabel,
    capacityPresentation,
    showSessionCodeInTopBar,
    isWaitingPhase,
    exitSessionAndReturnHome,
    returnHomeFromEndedSession,
    openVenueFromRecommendation,
    requestDefaultRecommendations,
    requestRecommendationBatch,
    refreshRecommendations,
    submitVenueVote,
    finalizeSessionVotes,
    waitingRoomCopy,
    recommendationsCopy,
    loadingCopy,
    idleCopy,
    endedCopy,
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
        onBackHome={() => {
          if (status === "ended") returnHomeFromEndedSession();
          else navigate("/");
        }}
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
            votes={votes}
            status={status}
            isHost={isHost}
            recommendationCount={recommendationCount}
            error={error}
            prefersReducedMotion={prefersReducedMotion}
            leaveActionLabel={leaveActionLabel}
            myVoteVenueId={myVoteVenueId}
            winningVenueId={winningVenueId}
            hasFinalizedWinner={hasFinalizedWinner}
            isSubmittingVote={isSubmittingVote}
            isFinalizingVotes={isFinalizingVotes}
            copy={recommendationsCopy}
            onRefresh={refreshRecommendations}
            onExitSession={exitSessionAndReturnHome}
            onRecCountChange={requestRecommendationBatch}
            onOpenVenue={openVenueFromRecommendation}
            onVote={submitVenueVote}
            onFinalizeVotes={finalizeSessionVotes}
          />
        )}

        {status === "ended" && (
          <SessionEndedView
            prefersReducedMotion={prefersReducedMotion}
            copy={endedCopy}
            onBackHome={returnHomeFromEndedSession}
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
