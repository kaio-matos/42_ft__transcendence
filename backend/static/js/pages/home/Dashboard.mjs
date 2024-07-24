import { Button } from "../../components/Button.mjs";
import { Component } from "../../components/component.mjs";
import { Input } from "../../components/Input.mjs";
import { List } from "../../components/List.mjs";
import { Loading } from "../../components/Loading.mjs";
import { PlayerService } from "../../services/player.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Dashboard = () => {
  const page = new Component("div").class("container mx-auto row p-5");

  page.children([
    new Loading(PlayerService.getChatWith(), (conversation) =>
      new Component("div")
        .class("border border-secondary p-2 rounded")
        .children([
          new Component("div")
            .class("border border-secondary p-2 rounded overflow-auto")
            .styles({ height: "70vh" })
            .children([
              new Component("p", { textContent: conversation.player.name }),
              ...conversation.chat.map((message) =>
                new Component("span", { textContent: message }).class(
                  "d-block",
                ),
              ),
            ]),
          new Input("Message").class("mt-3"),
        ]),
    ).class("col-8"),
    new Loading(
      PlayerService.getPlayers(), // get players
      (
        players, // when we have the players then we show the list
      ) =>
        new List("Online Players", players, {
          emptyListMessage: "No players online",
          itemRenderer: (player) =>
            new Component("span", { textContent: player.name })
              .class("d-flex justify-content-between mb-1")
              .children([
                new Component("div").class("d-flex gap-2").children([
                  new Button("Chat").addEventListener("click", () => {
                    console.log("Chat with Player", player);
                  }),
                  new Button("Challenge").addEventListener("click", () => {
                    console.log("Challenge Player ", player);
                  }),
                ]),
              ]),
        }),
    ).class("col-4"),
  ]);

  return page;
};
