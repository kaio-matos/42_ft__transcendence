import { PlayerCommunication } from "../../../../communication/player.mjs";
import { Component } from "../../../../components/component.mjs";
import { router } from "../../../../index.mjs";
import { MatchService } from "../../../../services/match.mjs";
import { session } from "../../../../state/session.mjs";

/**
 * @param {Component} page
 */
export function useMatchListeners(page) {
  function getModal(container) {
    return bootstrap.Modal.getOrCreateInstance(container, {
      backdrop: "static",
    });
  }

  function onMatchStart(match) {
    const container = page.element.querySelector("#match-awaiting-modal");
    const match_awaiting_modal = getModal(container);
    match_awaiting_modal.hide(); // hide awaiting modal
    router.navigate("/auth/game?match=" + match.id);
  }

  function onMatchAwaiting() {
    const container = page.element.querySelector("#match-awaiting-modal");
    const match_awaiting_modal = getModal(container);
    match_awaiting_modal.show();
  }

  function onMatchCancelled() {
    getModal(page.element.querySelector("#match-awaiting-modal")).hide();
    getModal(page.element.querySelector("#match-confirmation-modal"), {
      backdrop: "static",
    }).hide();
  }

  function onMatchConfirmation(match) {
    const container = page.element.querySelector("#match-confirmation-modal");
    const match_confirmation_modal = getModal(container);

    const reject = container.querySelector(
      "#match-confirmation-modal-reject-button",
    );
    const accept = container.querySelector(
      "#match-confirmation-modal-accept-button",
    );

    reject.button.addEventListener("click", async () => {
      reject.setLoading(true);
      await MatchService.rejectMatch();
      reject.setLoading(false);
      match_confirmation_modal.hide();
    });
    accept.button.addEventListener("click", async () => {
      accept.setLoading(true);
      await MatchService.acceptMatch();
      accept.setLoading(false);
      match_confirmation_modal.hide();
    });

    match_confirmation_modal.show();
  }

  // TODO: Remove this listener after page change
  PlayerCommunication.Communication.addEventListener(
    PlayerCommunication.Events.PLAYER_NOTIFY_MATCH_UPDATE,
    ({ match }) => {
      if (match.status === "IN_PROGRESS") {
        onMatchStart(match);
        return;
      }
      if (
        match.status === "AWAITING_CONFIRMATION" &&
        match.confirmation.pending
      ) {
        onMatchConfirmation(match);
        return;
      }
      if (
        match.status === "AWAITING_CONFIRMATION" &&
        match.confirmation.accepted
      ) {
        onMatchAwaiting();
        return;
      }
      if (match.status === "CANCELLED") {
        onMatchCancelled();
      }
    },
  );

  // TODO: If we keep this way if the user is on the profile page he cant be redirected from there
  if (session.player.pendencies) {
    if (session.player.pendencies.match_to_play) {
      // TODO: Handle loading and move it to a proper place
      MatchService.getMatch().then(onMatchStart);
    }

    if (session.player.pendencies.match_to_accept) {
      MatchService.getMatch().then(onMatchConfirmation);
    }
  }
}
