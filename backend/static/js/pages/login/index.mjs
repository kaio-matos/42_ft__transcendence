import { PlayerCommunication } from "../../communication/player.mjs";
import { Component } from "../../components/component.mjs";
import { router } from "../../index.mjs";
import { PlayerService } from "../../services/player.mjs";
import { session } from "../../state/session.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Login = () => {
  const page = new Component("div");

  page.element.innerHTML = `
    <form id="login-form" class="container d-flex flex-column gap-3 mx-auto">
      <t-input id="input-email" label="Email"></t-input>
      <t-input id="input-password" label="Password"></t-input>

      <t-button>Login</t-button>
    </form>
  `;

  let email = "";
  let password = "";

  const form = page.element.querySelector("#login-form");
  const t_input_email = form.querySelector("#input-email");
  const t_input_password = form.querySelector("#input-password");

  t_input_email.input.addEventListener("change", (e) => {
    email = e.target.value;
  });

  t_input_password.input.addEventListener("change", (e) => {
    password = e.target.value;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    t_input_email.clearErrors();
    t_input_password.clearErrors();

    const player = await PlayerService.login({
      email: email,
      password: password,
    });
    session.player = player;
    PlayerCommunication.Communication.connect();
    router.navigate("/");
  });

  return page;
};
