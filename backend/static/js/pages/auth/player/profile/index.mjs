import { Component } from "../../../../components/component.mjs";
import { PlayerService } from "../../../../services/player.mjs";
import { NotFound } from "../../../not-found/index.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const PlayerProfile = ({ params }) => {
  const player_id = params.player;

  if (!player_id) {
    return NotFound({ params });
  }

  const page = new Component("div").class("container mx-auto row");

  page.element.innerHTML = `
    <t-loading loading="true">
      <div class="border border-secondary p-2 rounded">
	<h1 id="name-placeholder">Perfil</h1>

	<span id="email-placeholder"></span>
      </div>
    </t-loading>
  `;

  const t_loading = page.element.querySelector("t-loading");
  const name_placeholder = page.element.querySelector("#name-placeholder");
  const email_placeholder = page.element.querySelector("#email-placeholder");

  PlayerService.getPlayer({ player_id }).then((player) => {
    t_loading.setLoading(false);

    name_placeholder.textContent = player.name;
    email_placeholder.textContent = player.email;
  });

  return page;
};
