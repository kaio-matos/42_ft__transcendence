import { PlayerCommunication } from "../../../communication/player.mjs";
import { Component } from "../../../components/component.mjs";
import { router } from "../../../index.mjs";
import { ChatService } from "../../../services/chat.mjs";
import { RequestFailedError } from "../../../services/errors.mjs";
import { PlayerService } from "../../../services/player.mjs";
import { TournamentService } from "../../../services/tournament.mjs";
import { session } from "../../../state/session.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Home = () => {
  const page = new Component("div")
    .class("container mx-auto row")
    .styles({ maxHeight: "80vh" });

  page.element.innerHTML = `
    <t-chat class="col-8"></t-chat>
    <div class="d-flex flex-column border border-secondary p-2 rounded col-4">
      <div class="d-flex gap-1 mb-2">
        <t-button to="/auth/profile" class="d-block flex-grow-1" btn-class="w-100">Perfil</t-button>
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

      <div class="border border-secondary p-2 mt-auto rounded">
          <t-button id="find-match-button" class="d-block" btn-class="w-100">Encontrar Partida</t-button>
          <t-errors id="find-match-errors" class="mt-2"></t-errors>
      </div>
    </div>
  `;

  // TODO: If we keep this way if the user is on the profile page he cant be redirected from there
  // TODO: Remove this listener after page change
  PlayerCommunication.Communication.addEventListener(
    PlayerCommunication.Events.TOURNAMENT_BEGIN,
    ({ tournament }) => {
      router.navigate("/auth/game?tournament=" + tournament.id);
    },
  );

  const t_chat = page.element.querySelector("t-chat");

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
        ChatService.getChat({ chat_id: chat.id }).then((chat) => {
          // always get the latest version to avoid bugs
          t_chat.setChat(chat, (newmessage) => chat.messages.push(newmessage));
        });
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
        await TournamentService.createTournament({
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
      await TournamentService.findTournament();
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

  return page;
};
