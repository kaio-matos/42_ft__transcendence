import { PlayerCommunication } from "../../../../communication/player.mjs";
import { Component } from "../../../../components/component.mjs";
import { router } from "../../../../index.mjs";
import { MatchService } from "../../../../services/match.mjs";
import { session } from "../../../../state/session.mjs";

/**
 * @param {Component} page
 */
export function useMatchListeners(page) {
  function removeModalBackdrop() {
    const backdrops = document.querySelectorAll(".modal-backdrop");
    backdrops.forEach((backdrop) => {
      backdrop.parentNode.removeChild(backdrop);
    });
  }

  function closeAllModals() {
    const openModals = document.querySelectorAll(".modal.show");
    openModals.forEach((modalElement) => {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    });
    removeModalBackdrop();
  }

  function getOrCreateModal(
    containerSelector,
    options = { backdrop: "static" }
  ) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      return null;
    }
    return bootstrap.Modal.getOrCreateInstance(container, options);
  }

  function onMatchStart(match) {
    const matchAwaitingModal = getOrCreateModal("#match-awaiting-modal");
    if (matchAwaitingModal) {
      matchAwaitingModal.hide();
    }
    setTimeout(() => {
      router.navigate("/auth/game?match=" + match.id);
    }, 100);
  }

  function onMatchAwaiting() {
    const matchAwaitingModal = getOrCreateModal("#match-awaiting-modal");
    if (matchAwaitingModal) {
      matchAwaitingModal.show();
    }
  }

  function onMatchCancelled() {
    closeAllModals();
    removeModalBackdrop();
  }

  /**
   * @param {import("../../../../services/match.mjs").Match} match
   */
  function onMatchConfirmation(match) {
    const matchConfirmationModal = getOrCreateModal(
      "#match-confirmation-modal"
    );
    if (!matchConfirmationModal) {
      return;
    }

    const container = document.querySelector("#match-confirmation-modal");

    const rejectButton = container.querySelector(
      "#match-confirmation-modal-reject-button"
    );
    const acceptButton = container.querySelector(
      "#match-confirmation-modal-accept-button"
    );

    const playersContainer = container.querySelector(
      "#match-confirmation-modal-players"
    );
    playersContainer.innerHTML = "";

    match.players.forEach((player) => {
      const playerElement = document.createElement("b");
      playerElement.textContent = player.email;
      playersContainer.appendChild(playerElement);
    });

    rejectButton.onclick = async () => {
      rejectButton.disabled = true;
      try {
        await MatchService.rejectMatch();
        matchConfirmationModal.hide();
      } catch (error) {
        console.error("Error rejecting match:", error);
      } finally {
        rejectButton.disabled = false;
      }
    };

    acceptButton.onclick = async () => {
      acceptButton.disabled = true;
      try {
        await MatchService.acceptMatch();
        matchConfirmationModal.hide();
      } catch (error) {
        console.error("Error accepting match:", error);
      } finally {
        acceptButton.disabled = false;
      }
    };

    matchConfirmationModal.show();
  }

  function setupMatchUpdateListener() {
    const matchUpdateListener = ({ match }) => {


      switch (match.status) {
        case "IN_PROGRESS":
          onMatchStart(match);
          break;
        case "AWAITING_CONFIRMATION":
          if (match.confirmation.pending) {
            onMatchConfirmation(match);
          } else if (match.confirmation.accepted) {
            onMatchAwaiting();
          }
          break;
        case "CANCELLED":
          onMatchCancelled();
          break;
        default:
          console.warn("Unknown match status:", match.status);
      }
    };

    PlayerCommunication.Communication.addEventListener(
      PlayerCommunication.Events.PLAYER_NOTIFY_MATCH_UPDATE,
      matchUpdateListener
    );

    return () => {
      PlayerCommunication.Communication.removeEventListener(
        PlayerCommunication.Events.PLAYER_NOTIFY_MATCH_UPDATE,
        matchUpdateListener
      );
    };
  }

  setupMatchUpdateListener();

  // TODO: If we keep this way if the user is on the profile page he cant be redirected from there
  if (session.player.pendencies) {
    if (session.player.pendencies.match_to_play) {
      // TODO: Handle loading and move it to a proper place
      MatchService.getMatch().then(onMatchStart);
    }

    if (session.player.pendencies.match_to_accept) {
      MatchService.getMatch().then(onMatchConfirmation);
    }

    if (session.player.pendencies.match_to_await) {
      onMatchAwaiting();
    }
  }
}
