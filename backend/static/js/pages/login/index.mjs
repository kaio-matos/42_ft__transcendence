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
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border border-secondary rounded rounded-3">
      <div class="container">
          <a class="navbar-brand" href="/">Transcendence</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ms-auto">
                  <li class="nav-item">
                      <a class="nav-link" href="/login">Login</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="/register">Registrar</a>
                  </li>
              </ul>
          </div>
      </div>
    </nav>
    <div class="container mx-auto mt-3 border border-secondary p-5 rounded rounded-3">
    <div class="top-image mt-3">
            <img src="/media/default/front/banner.jpg" alt="Banner" class="rounded rounded-5 w-50">
        </div>
      <form id="login-form" class="d-flex flex-column gap-3">
          <t-input id="input-email" label="Email" type="email"></t-input>
          <t-input id="input-password" label="Senha" type="password"></t-input>

          <t-errors id="errors"></t-errors>
          <t-button id="login-button" class="d-block" btn-class="w-100">Entrar</t-button>
      </form>
      <p class="mt-5 d-flex align-items-center gap-2">
          Não tem uma conta?
          <t-button to="/register">Registre agora</t-button>
      </p>
    </div>
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
      router.navigate("/auth");
    } catch (error) {
      if (error instanceof RequestFailedError) {
        t_input_email.addErrors(error.data?.error?.email);
        t_input_password.addErrors(error.data?.error?.password);
        t_errors.addErrors(error.data?.error?._errors);
      }
    } finally {
      t_button_login.setLoading(false);
    }
  });

  return page;
};
