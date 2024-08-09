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
      <t-button to="/auth/profile" class="d-block mb-2" btn-class="w-100">Perfil</t-button>

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

  ChatService.getChats().then((chats) => {
    page.element.querySelector("#loading-players").setLoading(false);
    const container = page.element.querySelector("#players-list");
    const private_chats = chats.filter((chat) => chat.is_private);

    private_chats.forEach((chat) => {
      const friend = chat.players.filter(
        (player) => player.id !== session.player.id,
      )[0];

      container.append(
        new Component("li", { textContent: friend.name })
          .class(
            "d-flex flex-column list-group-item justify-content-md-between",
          )
          .children([
            new Component("div").class("d-flex flex-wrap gap-2").children([
              new Component("t-button", {
                textContent: "Perfil",
              }).addEventListener("click", () => {
                router.navigate("/auth/player/profile?player=" + friend.id);
              }),

              new Component("t-button", {
                textContent: "Conversar",
              })
                .attributes({ disabled: chat.is_blocked })
                .addEventListener("click", async () => {
                  t_chat.t_loading.setLoading(true);
                  ChatService.getChat({ chat_id: chat.id }).then((chat) => {
                    // always get the latest version to avoid bugs
                    t_chat.setChat(chat, (newmessage) =>
                      chat.messages.push(newmessage),
                    );
                  });
                }),

              new Component("t-button", {
                textContent: chat.is_blocked ? "Desbloquear" : "Bloquear",
              })
                .attributes({ theme: "danger" })
                .addEventListener("click", async (event) => {
                  event.target.setLoading(true);
                  let btn_text = "Bloquear";
                  if (chat.is_blocked) {
                    chat = await ChatService.unblockChat({ chat_id: chat.id });
                  } else {
                    chat = await ChatService.blockChat({ chat_id: chat.id });
                    btn_text = "Desbloquear";
                  }

                  // then update player
                  session.player = await PlayerService.getPlayer({
                    player_id: session.player.id,
                  });

                  event.target.setLoading(false);
                  event.target.textContent = btn_text;
                }),

              new Component("t-button", {
                textContent: "Desafiar",
              }).addEventListener("click", async (event) => {
                event.currentTarget.setLoading(true);
                await TournamentService.createTournament({
                  challenged_player_id: friend.id,
                });
                event.currentTarget.setLoading(true);
              }),
            ]),
          ]).element,
      );
    });
  });

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

  return page;
};
