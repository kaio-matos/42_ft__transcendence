import { Component } from "../../components/component.mjs";
import { PlayerService } from "../../services/player.mjs";
import { t } from "../../language.mjs";
import { UnprocessableContentError } from "../../services/errors.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Registration = ({ onRegistration }) => {
  const page = new Component("div").class("container p-5");

  page.element.innerHTML = `
    <form id="registration-form" class="container d-flex flex-column gap-3 mx-auto">
      <t-input id="input-name" label="Name"></t-input>
      <t-input id="input-email" label="Email" type="email"></t-input>
      <t-input id="input-password" label="Password" type="password"></t-input>

      <t-errors id="errors"></t-errors>
      <t-button id="register-button">Register</t-button>
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
  const t_errors = form.querySelector("#errors");
  const t_button_register = form.querySelector("#register-button");

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
    t_input_email.clearErrors();
    t_input_password.clearErrors();
    t_errors.clearErrors();

    try {
      t_button_register.setLoading(true);
      const player = await PlayerService.createPlayer({
        name: name,
        email: email,
        password: password,
      });
      onRegistration(player);
    } catch (error) {
      if (error instanceof UnprocessableContentError) {
        t_input_name.addErrors(error.data?.error?.name);
        t_input_email.addErrors(error.data?.error?.email);
        t_input_password.addErrors(error.data?.error?.password);
        t_errors.addErrors(error.data?.error?._errors);
      } else if (error instanceof RequestFailedError) {
        t_errors.addErrors(error.data?.error?._errors);
      }
    } finally {
      t_button_register.setLoading(false);
    }
  });

  return page;
};
