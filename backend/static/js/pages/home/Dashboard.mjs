import { Component } from "../../components/component.mjs";
import { PlayerService } from "../../services/player.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Dashboard = () => {
  const page = new Component("div").class("container mx-auto row");

  page.element.innerHTML = `
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
              }).addEventListener("click", () => {
                console.log("Challenge Player ", player);
              }),
            ]),
          ]).element,
      ),
    );
  });

  return page;
};
