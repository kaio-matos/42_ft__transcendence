import { PlayerCommunication } from "../../../communication/player.mjs";
import { Component } from "../../../components/component.mjs";
import { router } from "../../../index.mjs";
import { ChatService } from "../../../services/chat.mjs";
import {
  RequestFailedError,
  UnprocessableEntityError,
} from "../../../services/errors.mjs";
import { PlayerService } from "../../../services/player.mjs";
import { MatchService } from "../../../services/match.mjs";
import { session } from "../../../state/session.mjs";
import { TournamentService } from "../../../services/tournament.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Home = () => {
  const page = new Component("div")
    .class("container mx-auto row")
    .styles({ maxHeight: "80vh" });

  page.element.innerHTML = `
    <t-chat class="col-8"></t-chat>
    <div class="d-flex flex-column border border-secondary p-2 rounded col-4">
      <div class="d-flex gap-1 mb-2">
        <t-button to="/auth/profile" class="d-block flex-grow-1" btn-class="w-100">${session.player.email}</t-button>
        <t-button id="logout-button" class="d-block" theme="danger">Logout</t-button>
      </div>

      <div class="border border-secondary p-2 rounded">
        <strong class="mb-2 d-block">Adicionar jogador como amigo</strong>

        <form id="add-friend-form" class="d-flex gap-1">
          <t-input label="Email" class="col-8"></t-input>

          <t-button class="d-block col-4" btn-class="w-100 h-100">Adicionar</t-button>
        </form>
      </div>

      <div class="border border-secondary p-2 my-3 rounded overflow-y-auto" style="height: 50vh">
        <strong class="mb-2 d-block">Amigos</strong>
        <t-loading id="loading-players" loading="true">
          <ul id="players-list" class="list-group">
            Nenhum amigo encontrado
          </ul>
        </t-loading>
      </div>

      <div id="tournament-create-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Criar Torneio</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <t-input label="Nome"></t-input>
              <t-multiple-select class="mt-2"></t-multiple-select>
            </div>
            <div class="modal-footer">
              <t-button data-bs-dismiss="modal" theme="secondary">Fechar</t-button>
              <t-button id="tournament-create-modal-create-button">Criar</t-button>
            </div>
          </div>
        </div>
      </div>

      <div id="match-confirmation-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Partida</h5>
            </div>
            <div class="modal-body">
              <p>Você aceita a partida?</p>
            </div>
            <div class="modal-footer">
              <t-button id="match-confirmation-modal-reject-button" theme="danger">Rejeitar</t-button>
              <t-button id="match-confirmation-modal-accept-button">Aceitar</t-button>
            </div>
          </div>
        </div>
      </div>

      <div id="match-awaiting-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Partida</h5>
            </div>
            <div class="modal-body">
              <p>Por favor aguarde pela confirmação dos outros participantes</p>
              <p>Você será redirecionado automaticamente assim que todos os participantes aceitarem</p>
            </div>
          </div>
        </div>
      </div>

      <div id="tournament-confirmation-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Torneio</h5>
            </div>
            <div class="modal-body">
              <p>Você aceita o torneio?</p>

            </div>
            <div class="modal-footer">
              <t-button id="tournament-confirmation-modal-reject-button" theme="danger">Rejeitar</t-button>
              <t-button id="tournament-confirmation-modal-accept-button">Aceitar</t-button>
            </div>
          </div>
        </div>
      </div>

      <div id="tournament-awaiting-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Torneio</h5>
            </div>
            <div class="modal-body">
              <p>Por favor aguarde pela confirmação dos outros participantes</p>
              <p>Você será redirecionado automaticamente assim que todos os participantes aceitarem</p>
            </div>
          </div>
        </div>
      </div>


      <div class="border border-secondary p-2 mt-auto rounded">
        <t-button id="tournament-create-open-modal-button" class="d-block" btn-class="w-100">Criar Torneio</t-button>
      </div>


      <div class="border border-secondary p-2 mt-auto rounded">
        <t-button id="find-match-button" class="d-block" btn-class="w-100">Encontrar Partida</t-button>
        <t-errors id="find-match-errors" class="mt-2"></t-errors>
      </div>
    </div>
  `;

  const t_chat = page.element.querySelector("t-chat");

  const t_button_tournament_open_modal = page.element.querySelector(
    "#tournament-create-open-modal-button",
  );
  const t_button_tournament_create_modal_create = page.element.querySelector(
    "#tournament-create-modal-create-button",
  );
  t_button_tournament_open_modal.button.addEventListener("click", async () => {
    const container = page.element.querySelector("#tournament-create-modal");
    const t_multiple_select = container.querySelector("t-multiple-select");
    const t_input = container.querySelector("t-input");
    const modal = bootstrap.Modal.getOrCreateInstance(container);

    t_input.value = "";
    t_multiple_select.clearOptions();

    modal.show();

    const players = await PlayerService.getPlayers();
    const options = players.map((p) => ({ label: p.name, value: p.id }));

    t_multiple_select.addOptions(options);
  });

  t_button_tournament_create_modal_create.button.addEventListener(
    "click",
    async () => {
      t_button_tournament_create_modal_create.setLoading(true);
      const container = page.element.querySelector("#tournament-create-modal");
      const t_multiple_select = container.querySelector("t-multiple-select");
      const t_input = container.querySelector("t-input");
      const modal = bootstrap.Modal.getOrCreateInstance(container);

      t_input.clearErrors();
      t_multiple_select.errors.element.clearErrors();

      try {
        await TournamentService.createTournament({
          name: t_input.value,
          players_id: t_multiple_select.getSelectedOptions(),
        });
        modal.hide();
      } catch (error) {
        if (error instanceof UnprocessableEntityError) {
          t_input.addErrors(error.data?.error?.name);
          t_multiple_select.errors.element.addErrors(
            error.data?.error?.players_id,
          );
        }
      } finally {
        t_button_tournament_create_modal_create.setLoading(false);
      }
    },
  );

  const form_add_friend = page.element.querySelector("#add-friend-form");
  const form_add_friend_t_input_email =
    form_add_friend.querySelector("t-input");

  let form_add_friend_email = "";
  form_add_friend_t_input_email.input.addEventListener("change", (e) => {
    form_add_friend_email = e.target.value;
  });

  form_add_friend.addEventListener("submit", async (event) => {
    event.preventDefault();
    form_add_friend_t_input_email.clearErrors();
    const form_add_friend_t_input_button =
      form_add_friend.querySelector("t-button");

    try {
      form_add_friend_t_input_button.setLoading(true);
      const player = await PlayerService.addFriend({
        email: form_add_friend_email,
      });
      session.player = player;
      await updateFriendsList();
      form_add_friend_t_input_email.value = "";
    } catch (error) {
      if (error instanceof RequestFailedError) {
        form_add_friend_t_input_email.addErrors(error.data?.error?.email);
      }
    } finally {
      form_add_friend_t_input_button.setLoading(false);
    }
  });

  async function updateFriendsList() {
    page.element.querySelector("#loading-players").setLoading(true);
    const chats = await ChatService.getChats();
    page.element.querySelector("#loading-players").setLoading(false);
    const container = page.element.querySelector("#players-list");
    const private_chats = chats.filter((chat) => chat.is_private);

    container.innerHTML = "";

    private_chats.forEach((chat) => {
      const friend = chat.players.filter(
        (player) => player.id !== session.player.id,
      )[0];

      const li = new Component("li").class(
        "d-flex flex-column list-group-item justify-content-md-between",
      );

      li.element.innerHTML = `
        <span></span>
        <div class="d-flex flex-wrap gap-2">
          <t-button id="profile-button">Perfil</t-button>
          <t-button id="chat-button" disabled="${chat.is_blocked}">Conversar</t-button>
          <t-button id="toggle-block-button" theme="danger">${chat.is_blocked ? "Desbloquear" : "Bloquear"}</t-button>
          <t-button id="challenge-button">Desafiar</t-button>
        </div>
      `;

      li.element.querySelector("span").textContent =
        `${friend.name} ${friend.activity_status}`;
      const t_button_profile = li.element.querySelector("#profile-button");
      const t_button_chat = li.element.querySelector("#chat-button");
      const t_button_toggle_block = li.element.querySelector(
        "#toggle-block-button",
      );
      const t_button_challenge = li.element.querySelector("#challenge-button");

      t_button_profile.button.addEventListener("click", () => {
        router.navigate("/auth/player/profile?player=" + friend.id);
      });

      t_button_chat.button.addEventListener("click", async () => {
        t_chat.t_loading.setLoading(true);
        const updatedChat = await ChatService.getChat({ chat_id: chat.id });
        // always get the latest version to avoid bugs
        t_chat.setChat(updatedChat, (newmessage) =>
          updatedChat.messages.push(newmessage),
        );
      });

      t_button_toggle_block.button.addEventListener("click", async (event) => {
        t_button_toggle_block.setLoading(true);
        let btn_text = "Bloquear";
        if (chat.is_blocked) {
          chat = await ChatService.unblockChat({ chat_id: chat.id });
          t_button_chat.setDisabled(false);
        } else {
          chat = await ChatService.blockChat({ chat_id: chat.id });
          t_button_chat.setDisabled(true);
          btn_text = "Desbloquear";
        }

        // then update player
        session.player = await PlayerService.getPlayer({
          player_id: session.player.id,
        });

        t_button_toggle_block.setLoading(false);
        t_button_toggle_block.textContent = btn_text;
      });

      t_button_challenge.button.addEventListener("click", async (event) => {
        t_button_challenge.setLoading(true);
        await MatchService.createMatch({
          challenged_player_id: friend.id,
        });
        t_button_challenge.setLoading(true);
      });

      container.append(li.element);
    });
  }

  updateFriendsList();

  PlayerCommunication.Communication.addEventListener(
    PlayerCommunication.Events.FRIEND_ACTIVITY_STATUS,
    updateFriendsList,
  );

  const t_button_find_match = page.element.querySelector("#find-match-button");
  const t_errors_find_match = page.element.querySelector("#find-match-errors");

  t_button_find_match.addEventListener("click", async () => {
    t_errors_find_match.clearErrors();
    try {
      t_button_find_match.setLoading(true);
      await MatchService.findMatch();
    } catch (error) {
      if (error instanceof RequestFailedError) {
        t_errors_find_match.addErrors(error.data?.message);
      }
    } finally {
      t_button_find_match.setLoading(false);
    }
  });

  const t_logout_button = page.element.querySelector("#logout-button");

  t_logout_button.button.addEventListener("click", async () => {
    try {
      t_logout_button.setLoading(true);
      await PlayerService.logout();
    } catch {
    } finally {
      t_logout_button.setLoading(false);
      session.player = undefined;
      router.navigate("/login");
    }
  });

  function onMatchStart(match) {
    const container = page.element.querySelector("#match-awaiting-modal");
    const match_awaiting_modal = bootstrap.Modal.getOrCreateInstance(
      container,
      { backdrop: "static" },
    );
    match_awaiting_modal.hide(); // hide awaiting modal
    router.navigate("/auth/game?match=" + match.id);
  }

  function onMatchAwaiting() {
    const container = page.element.querySelector("#match-awaiting-modal");
    const match_awaiting_modal = bootstrap.Modal.getOrCreateInstance(
      container,
      { backdrop: "static" },
    );
    match_awaiting_modal.show();
  }

  function onMatchCancelled() {
    const match_awaiting_modal = bootstrap.Modal.getOrCreateInstance(
      page.element.querySelector("#match-awaiting-modal"),
      { backdrop: "static" },
    );
    match_awaiting_modal.hide();

    const match_confirmation_modal = bootstrap.Modal.getOrCreateInstance(
      page.element.querySelector("#match-confirmation-modal"),
      { backdrop: "static" },
    );
    match_confirmation_modal.hide();
  }

  function onMatchConfirmation(match) {
    const container = page.element.querySelector("#match-confirmation-modal");
    const match_confirmation_modal = bootstrap.Modal.getOrCreateInstance(
      container,
      { backdrop: "static" },
    );

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

  // TODO: If we keep this way if the user is on the profile page he cant be redirected from there
  if (session.player.pendencies) {
    if (session.player.pendencies.tournament_to_accept) {
      TournamentService.getTournament().then(onTournamentConfirmation);
    }

    if (session.player.pendencies.match_to_play) {
      // TODO: Handle loading and move it to a proper place
      MatchService.getMatch().then(onMatchStart);
    }

    if (session.player.pendencies.match_to_accept) {
      MatchService.getMatch().then(onMatchConfirmation);
    }
  }

  // TODO: Remove this listener after page change
  PlayerCommunication.Communication.addEventListener(
    PlayerCommunication.Events.PLAYER_NOTIFY_MATCH_UPDATE,
    ({ match }) => {
      if (match.status === "IN_PROGRESS") {
        onMatchStart(match);
        return;
      }
      if (match.status === "AWAITING" && match.confirmation.pending) {
        onMatchConfirmation(match);
        return;
      }
      if (match.status === "AWAITING" && match.confirmation.accepted) {
        onMatchAwaiting();
        return;
      }
      if (match.status === "CANCELLED") {
        onMatchCancelled();
      }
    },
  );

  // TODO: Remove this listener after page change
  PlayerCommunication.Communication.addEventListener(
    PlayerCommunication.Events.PLAYER_NOTIFY_TOURNAMENT_UPDATE,
    ({ tournament }) => {
      if (tournament.status === "IN_PROGRESS") {
        closeTournamentModals();
        return;
      }
      if (tournament.status === "AWAITING" && tournament.confirmation.pending) {
        onTournamentConfirmation(tournament);
        return;
      }
      if (
        tournament.status === "AWAITING" &&
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

  return page;
};
