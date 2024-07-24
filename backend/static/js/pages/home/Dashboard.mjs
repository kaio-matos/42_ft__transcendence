import { Button } from "../../components/Button.mjs";
import { Component } from "../../components/component.mjs";
import { List } from "../../components/List.mjs";
import { Loading } from "../../components/Loading.mjs";
import { PlayerService } from "../../services/player.mjs";
import { TournamentService } from "../../services/tournament.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Dashboard = () => {
  const page = new Component("div").class(["container-fluid", "p-5"]);

  page.children([
    new Loading(
      PlayerService.getPlayers(), // get players
      (
        result, // when we have the players then we show the list
      ) =>
        new List("Online Players", result, {
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
    ),
  ]);

  return page;
};
