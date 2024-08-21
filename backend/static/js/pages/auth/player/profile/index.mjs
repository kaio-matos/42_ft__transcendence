import { Component } from "../../../../components/component.mjs";
import { PlayerService } from "../../../../services/player.mjs";
import { NotFound } from "../../../not-found/index.mjs";
import { useMatchesHistory } from "../../hooks/useMatchesHistory.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const PlayerProfile = ({ params }) => {
  const player_id = params.player;

  if (!player_id) {
    return NotFound({ params });
  }

  const page = new Component("div").class("container mx-auto");

  page.element.innerHTML = `
    <t-loading loading="true">
      <div class="border border-secondary p-2 rounded">
	<h1 id="name-placeholder">Perfil</h1>

	<span id="email-placeholder"></span>
      </div>
    </t-loading>

    <div class="border border-secondary p-2 rounded d-flex gap-2 mt-3">
      <div class="border border-secondary p-2 rounded w-100">
        <h2>Torneios</h2>

        <t-loading id="loading-tournaments" loading="true">
          <div id="tournaments-container" class="d-flex flex-column gap-2 overflow-auto" style="height: 50vh">

          </div>
        </t-loading>
      </div>
      <div class="border border-secondary p-2 rounded w-100">
        <h2>Partidas</h2>

        <t-loading id="loading-matches" loading="true">
          <div id="matches-container" class="d-flex flex-column gap-2 overflow-auto" style="height: 50vh">

          </div>
        </t-loading>
      </div>
    </div>
  `;

  const t_loading = page.element.querySelector("t-loading");
  const name_placeholder = page.element.querySelector("#name-placeholder");
  const email_placeholder = page.element.querySelector("#email-placeholder");

  PlayerService.getPlayer({ player_id }).then((player) => {
    t_loading.setLoading(false);

    name_placeholder.textContent = player.name;
    email_placeholder.textContent = player.email;

    useMatchesHistory(page, { from_player: player });
  });

  return page;
};
