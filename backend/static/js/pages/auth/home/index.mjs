import { PlayerCommunication } from "../../../communication/player.mjs";
import { Component } from "../../../components/component.mjs";
import { router } from "../../../index.mjs";
import { PlayerService } from "../../../services/player.mjs";
import { TournamentService } from "../../../services/tournament.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Home = () => {
  const page = new Component("div").class("container mx-auto row");

  page.element.innerHTML = `
    <t-button to="/auth/profile">Profile</t-button>

    <div class="border border-secondary p-2 rounded col-8">
      <p>Chat Title</p>

      <t-loading id="loading-chat" loading="true">
        <div id="chat" class="border border-secondary p-2 rounded overflow-y-auto mb-3" style="height: 70vh;">
        </div>

        <t-input label="Message" class="mt-3" ></t-input>
      </t-loading>
    </div>
    <div class="border border-secondary p-2 rounded col-4">
      <p>Online Players</p>
      <t-loading id="loading-players" loading="true">
        <ul id="players-list" class="list-group">
        </ul>
      </t-loading>
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
  PlayerService.getPlayers().then((players) => {
    page.element.querySelector("#loading-players").setLoading(false);
    const container = page.element.querySelector("#players-list");

    players.map((player) =>
      container.append(
        new Component("li", { textContent: player.name })
          .class(
            "d-flex flex-column list-group-item justify-content-md-between",
          )
          .children([
            new Component("div").class("d-flex gap-2").children([
              new Component("t-button", {
                textContent: "Chat",
              }).addEventListener("click", () => {
                console.log("Chat with Player", player);
              }),
              new Component("t-button", {
                textContent: "Challenge",
              }).addEventListener("click", async () => {
                // TODO: Handle loading
                console.log("Challenging Player ", player);
                await TournamentService.createTournament({
                  challenged_player_id: player.id,
                });
              }),
            ]),
          ]).element,
      ),
    );
  });

  return page;
};
