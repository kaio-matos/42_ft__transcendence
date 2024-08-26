import { PlayerCommunication } from "../../../../communication/player.mjs";
import { Component } from "../../../../components/component.mjs";
import { TournamentService } from "../../../../services/tournament.mjs";
import { session } from "../../../../state/session.mjs";

/**
 * @param {Component} page
 */
export function useTournamentListeners(page) {
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

  function onTournamentAwaiting() {
    const tournamentAwaitingModal = getOrCreateModal(
      "#tournament-awaiting-modal"
    );
    if (tournamentAwaitingModal) {
      tournamentAwaitingModal.show();
    }
  }

  function closeTournamentModals() {
    // closeAllModals();
    removeModalBackdrop();
    const tournament_awaiting_modal = getOrCreateModal(
      "#tournament-awaiting-modal"
    );
    tournament_awaiting_modal.hide();

    const tournament_confirmation_modal = getOrCreateModal(
      "#tournament-confirmation-modal"
    );
    tournament_confirmation_modal.hide();
  }

  /**
   * @param {import("../../../../services/tournament.mjs").Tournament} tournament
   */
  function onTournamentConfirmation(tournament) {
    const tournament_awaiting_modal = getOrCreateModal(
      "#tournament-confirmation-modal"
    );
    if (!tournament_awaiting_modal) {
      return;
    }

    const container = page.element.querySelector(
      "#tournament-confirmation-modal"
    );

    const reject = container.querySelector(
      "#tournament-confirmation-modal-reject-button"
    );
    const accept = container.querySelector(
      "#tournament-confirmation-modal-accept-button"
    );

    const players_container = new Component(
      container.querySelector("#tournament-confirmation-modal-players")
    ).class("d-flex gap-2 flex-wrap");

    players_container.clear();
    players_container.children(
      tournament.players.map(
        (p) => new Component("b", { textContent: p.email })
      )
    );

    reject.button.element.onclick = async () => {
      reject.setLoading(true);
      await TournamentService.rejectTournament();
      reject.setLoading(false);
      tournament_awaiting_modal.hide();
    };
    accept.button.element.onclick = async () => {
      accept.setLoading(true);
      await TournamentService.acceptTournament();
      accept.setLoading(false);
      tournament_awaiting_modal.hide();
    };

    tournament_awaiting_modal.show();
  }

  function setupMatchUpdateListener() {
    console.log("setupMatchUpdateListener");
    const matchUpdateListener = ({ tournament }) => {
      console.log(tournament);
      switch (tournament.status) {
        case "IN_PROGRESS":
          closeTournamentModals();
          break;
        case "AWAITING_CONFIRMATION":
          if (tournament.confirmation.pending) {
            onTournamentConfirmation(tournament);
          } else if (tournament.confirmation.accepted) {
            onTournamentAwaiting();
          }
          break;
        case "CANCELLED":
          closeTournamentModals();
          break;
      }
    };

    PlayerCommunication.Communication.addEventListener(
      PlayerCommunication.Events.PLAYER_NOTIFY_TOURNAMENT_UPDATE,
      matchUpdateListener
    );

    return () => {
      PlayerCommunication.Communication.removeEventListener(
        PlayerCommunication.Events.PLAYER_NOTIFY_TOURNAMENT_UPDATE,
        matchUpdateListener
      );
    };
  }
  setupMatchUpdateListener();

  // TODO: If we keep this way if the user is on the profile page he cant be redirected from there
  if (session.player.pendencies) {
    if (session.player.pendencies.tournament_to_accept) {
      TournamentService.getTournament().then(onTournamentConfirmation);
    }
    if (session.player.pendencies.tournament_to_await) {
      onTournamentAwaiting();
    }
  }
}
