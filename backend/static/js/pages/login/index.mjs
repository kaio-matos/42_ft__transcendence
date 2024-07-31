import { PlayerCommunication } from "../../communication/player.mjs";
import { Component } from "../../components/component.mjs";
import { router } from "../../index.mjs";
import { RequestFailedError } from "../../services/errors.mjs";
import { PlayerService } from "../../services/player.mjs";
import { session } from "../../state/session.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Login = () => {
  const page = new Component("div").class("container mx-auto");

  page.element.innerHTML = `
    <form id="login-form" class="d-flex flex-column gap-3">
      <t-input id="input-email" label="Email"></t-input>
      <t-input id="input-password" label="Password" type="password"></t-input>

      <t-errors id="errors"></t-errors>
      <t-button id="login-button">Login</t-button>
    </form>
    <p class="mt-5 d-flex gap-2">
      Does not have an account?
      <t-button to="/">Register now</t-button>
    </p>
  `;

  let email = "";
  let password = "";

  const form = page.element.querySelector("#login-form");
  const t_input_email = form.querySelector("#input-email");
  const t_input_password = form.querySelector("#input-password");
  const t_errors = form.querySelector("#errors");
  const t_button_login = form.querySelector("#login-button");

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
    t_errors.clearErrors();

    try {
      t_button_login.setLoading(true);
      const player = await PlayerService.login({
        email: email,
        password: password,
      });
      session.player = player;
      PlayerCommunication.Communication.connect();
      router.navigate("/");
    } catch (error) {
      if (error instanceof UnprocessableContentError) {
        t_input_email.addErrors(error.data?.error?.email);
        t_input_password.addErrors(error.data?.error?.password);
        t_errors.addErrors(error.data?.error?._errors);
      } else if (error instanceof RequestFailedError) {
        t_errors.addErrors(error.data?.error?._errors);
      }
    } finally {
      t_button_login.setLoading(false);
    }
  });

  return page;
};
