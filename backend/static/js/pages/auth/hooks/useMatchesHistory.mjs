import { Component } from "../../../components/component.mjs";
import { MatchService } from "../../../services/match.mjs";

/**
 * @param {Component} page
 * @param {{ from_player: import("../../../services/player.mjs").Player }} param1
 */
export function useMatchesHistory(page, { from_player }) {
  const t_loading = page.element.querySelector("#loading-matches");
  const matches_container = page.element.querySelector("#matches-container");
  MatchService.getMatches({ from_player_id: from_player.id }).then(
    (matches) => {
      t_loading.setLoading(false);

      const container = new Component(matches_container);

      container.clear();
      const matches_components = matches.map((match) => {
        const hasWonMatch = from_player.id === match.winner?.id;

        return new Component("div").class("card p-3").children([
          new Component("card-body").children([
            new Component("h5", { textContent: match.name })
              .class("card-title d-flex justify-content-between")
              .children([
                match.winner
                  ? new Component("span", {
                      textContent: hasWonMatch ? "Vitória" : "Derrota",
                    })
                      .class("p-2 rounded fs-6 text-center")
                      .styles({ width: "5rem" })
                      .class(hasWonMatch ? "text-bg-success" : "text-bg-danger")
                  : undefined,
              ]),
            new Component("h6", {
              textContent: `Vencedor: ${match.winner?.name}`,
            }).class("card-subtitle mb-2 text-body-secondary"),

            new Component("p", {
              textContent: `Contra: ${match.players.map((p) => p.name).join(" ")}`,
            }).class("card-text"),
          ]),
        ]);
      });
      container.children(matches_components);
    },
  );
}
