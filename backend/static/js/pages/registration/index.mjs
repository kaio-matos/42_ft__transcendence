import { Component } from "../../components/component.mjs";
import { PlayerService } from "../../services/player.mjs";
import {
  RequestFailedError,
  UnprocessableEntityError,
} from "../../services/errors.mjs";
import { router } from "../../index.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Registration = () => {
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
      <form id="registration-form" class="container d-flex flex-column gap-3 mx-auto">
        <t-input id="input-name" label="Nome"></t-input>
        <t-input id="input-email" label="Email" type="email"></t-input>
        <t-input id="input-password" label="Senha" type="password"></t-input>

        <t-errors id="errors"></t-errors>
        <t-button id="register-button" class="d-block" btn-class="w-100">Registrar</t-button>
      </form>

      <p class="mt-5 d-flex gap-2 align-items-center">
        Já tem uma conta?
        <t-button to="/login">Entrar agora</t-button>
      </p>
    </div>
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
      await PlayerService.createPlayer({
        name: name,
        email: email,
        password: password,
      });
      router.navigate("/login");
    } catch (error) {
      if (error instanceof UnprocessableEntityError) {
        t_input_name.addErrors(error.data?.error?.name);
        t_input_email.addErrors(error.data?.error?.email);
        t_input_password.addErrors(error.data?.error?.password);
        t_errors.addErrors(error.data?.error?._errors);
      } else if (error instanceof RequestFailedError) {
        t_input_name.addErrors(error.data?.error?.name);
        t_input_email.addErrors(error.data?.error?.email);
        t_input_password.addErrors(error.data?.error?.password);
        t_errors.addErrors(error.data?.error?._errors);
      }
    } finally {
      t_button_register.setLoading(false);
    }
  });

  return page;
};
