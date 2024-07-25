import { Component } from "../../components/component.mjs";
import { PlayerService } from "../../services/player.mjs";
import { t } from "../../language.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Registration = ({ onRegistration }) => {
  const page = new Component("div").class("container p-5");

  page.element.innerHTML = `
    <form id="registration-form" class="container d-flex flex-column gap-3 mx-auto">
      <t-input id="input-name" label="Name"></t-input>
      <t-button>Register</t-button>
    </form>
  `;

  let name = "";

  const form = page.element.querySelector("#registration-form");
  const t_input = form.querySelector("#input-name");

  t_input.input.addEventListener("change", (e) => {
    name = e.target.value;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    t_input.clearErrors();

    if (!name) {
      t_input.addErrors(t().error_home_form_registration_missing_name);
      return;
    }

    const player = await PlayerService.createPlayer({ name: name });
    onRegistration(player);
  });

  return page;
};
