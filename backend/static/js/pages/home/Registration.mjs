import { Component } from "../../components/component.mjs";
import { PlayerService } from "../../services/player.mjs";
import { t } from "../../language.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Registration = ({ onRegistration }) => {
  const page = new Component("div").class("container p-5");

  page.element.innerHTML = `
    <form id="registration-form" class="container d-flex flex-column gap-3 mx-auto">
      <t-input id="input-name" label="Name"></t-input>
      <t-input id="input-email" label="Email"></t-input>
      <t-input id="input-password" label="Password"></t-input>
      <t-button>Register</t-button>
    </form>

    <p class="mt-5 d-flex gap-2">
      Already has an account?
      <t-button to="/login">Login now</t-button>
    </p>

  `;

  let name = "";
  let email = "";
  let password = "";
  const form = page.element.querySelector("#registration-form");
  const t_input_name = form.querySelector("#input-name");
  const t_input_email = form.querySelector("#input-email");
  const t_input_password = form.querySelector("#input-password");
  t_input_name.input.addEventListener("change", (e) => {
    name = e.target.value;
  });

  t_input_email.input.addEventListener("change", (e) => {
    email = e.target.value;
  });

  t_input_password.input.addEventListener("change", (e) => {
    password = e.target.value;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    t_input_name.clearErrors();

    if (!name) {
      t_input_name.addErrors(t().error_home_form_registration_missing_name);
      return;
    }

    const player = await PlayerService.createPlayer({
      name: name,
      email: email,
      password: password,
    });
    onRegistration(player);
  });

  return page;
};
