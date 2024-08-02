import { PlayerCommunication } from "../../../communication/player.mjs";
import { Component } from "../../../components/component.mjs";
import { router } from "../../../index.mjs";
import { RequestFailedError } from "../../../services/errors.mjs";
import { PlayerService } from "../../../services/player.mjs";
import { TournamentService } from "../../../services/tournament.mjs";
import { session } from "../../../state/session.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Home = () => {
  const page = new Component("div").class("container mx-auto row");

  page.element.innerHTML = `
    <t-button to="/auth/profile">Perfil</t-button>

    <div class="border border-secondary p-2 rounded col-8">
      <p>Chat</p>

      <t-loading id="loading-chat" loading="true">
        <div id="chat" class="border border-secondary p-2 rounded overflow-y-auto mb-3" style="height: 70vh;">
        </div>

        <t-input label="Mensagem" class="mt-3" ></t-input>
      </t-loading>
    </div>
    <div class="border border-secondary p-2 rounded col-4">
      <div class="border border-secondary p-2 rounded mb-3">
        <strong class="mb-2 d-block">Adicionar jogador como amigo</strong>

        <form id="add-friend-form" class="d-flex gap-1">
          <t-input label="Email" class="col-8"></t-input>

          <t-button class="col-4">Adicionar</t-button>
        </form>
      </div>

      <div class="border border-secondary p-2 rounded">
        <strong class="mb-2 d-block">Amigos</strong>
        <t-loading id="loading-players" loading="true">
          <ul id="players-list" class="list-group">
          </ul>
        </t-loading>
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

  PlayerService.getChatWith().then((conversation) => {
    page.element.querySelector("#loading-chat").setLoading(false);
    const container = page.element.querySelector("#chat");

    conversation.chat.forEach((message) =>
      container.append(
        new Component("span", { textContent: message }).class("d-block")
          .element,
      ),
    );
  });

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

  PlayerService.getFriends().then((friends) => {
    page.element.querySelector("#loading-players").setLoading(false);
    const container = page.element.querySelector("#players-list");

    friends.map((friend) =>
      container.append(
        new Component("li", { textContent: friend.name })
          .class(
            "d-flex flex-column list-group-item justify-content-md-between",
          )
          .children([
            new Component("div").class("d-flex gap-2").children([
              new Component("t-button", {
                textContent: "Perfil",
              }).addEventListener("click", () => {
                router.navigate("/auth/player/profile?player=" + friend.id);
              }),

              new Component("t-button", {
                textContent: "Conversar",
              }).addEventListener("click", () => {}),

              new Component("t-button", {
                textContent: "Desafiar",
              }).addEventListener("click", async () => {
                // TODO: Handle loading
                await TournamentService.createTournament({
                  challenged_player_id: friend.id,
                });
              }),
            ]),
          ]).element,
      ),
    );
  });

  return page;
};
