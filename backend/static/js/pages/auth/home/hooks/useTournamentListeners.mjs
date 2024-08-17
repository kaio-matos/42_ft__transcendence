import { PlayerCommunication } from "../../../../communication/player.mjs";
import { Component } from "../../../../components/component.mjs";
import { TournamentService } from "../../../../services/tournament.mjs";
import { session } from "../../../../state/session.mjs";

/**
 * @param {Component} page
 */
export function useTournamentListeners(page) {
  function onTournamentConfirmation() {
    const container = page.element.querySelector(
      "#tournament-confirmation-modal",
    );
    const tournament_confirmation_modal = bootstrap.Modal.getOrCreateInstance(
      container,
      { backdrop: "static" },
    );

    const reject = container.querySelector(
      "#tournament-confirmation-modal-reject-button",
    );
    const accept = container.querySelector(
      "#tournament-confirmation-modal-accept-button",
    );

    reject.button.addEventListener("click", async () => {
      reject.setLoading(true);
      await TournamentService.rejectTournament();
      reject.setLoading(false);
      tournament_confirmation_modal.hide();
    });
    accept.button.addEventListener("click", async () => {
      accept.setLoading(true);
      await TournamentService.acceptTournament();
      accept.setLoading(false);
      tournament_confirmation_modal.hide();
    });

    tournament_confirmation_modal.show();
  }

  function onTournamentAwaiting() {
    const container = page.element.querySelector("#tournament-awaiting-modal");
    const tournament_awaiting_modal = bootstrap.Modal.getOrCreateInstance(
      container,
      { backdrop: "static" },
    );
    tournament_awaiting_modal.show();
  }

  function closeTournamentModals() {
    const tournament_awaiting_modal = bootstrap.Modal.getOrCreateInstance(
      page.element.querySelector("#tournament-awaiting-modal"),
      { backdrop: "static" },
    );
    tournament_awaiting_modal.hide();

    const tournament_confirmation_modal = bootstrap.Modal.getOrCreateInstance(
      page.element.querySelector("#tournament-confirmation-modal"),
      { backdrop: "static" },
    );
    tournament_confirmation_modal.hide();
  }

  // TODO: Remove this listener after page change
  PlayerCommunication.Communication.addEventListener(
    PlayerCommunication.Events.PLAYER_NOTIFY_TOURNAMENT_UPDATE,
    ({ tournament }) => {
      if (tournament.status === "IN_PROGRESS") {
        closeTournamentModals();
        return;
      }
      if (
        tournament.status === "AWAITING_CONFIRMATION" &&
        tournament.confirmation.pending
      ) {
        onTournamentConfirmation(tournament);
        return;
      }
      if (
        tournament.status === "AWAITING_CONFIRMATION" &&
        tournament.confirmation.accepted
      ) {
        onTournamentAwaiting();
        return;
      }
      if (tournament.status === "CANCELLED") {
        closeTournamentModals();
      }
    },
  );

  // TODO: If we keep this way if the user is on the profile page he cant be redirected from there
  if (session.player.pendencies) {
    if (session.player.pendencies.tournament_to_accept) {
      TournamentService.getTournament().then(onTournamentConfirmation);
    }
  }
}
