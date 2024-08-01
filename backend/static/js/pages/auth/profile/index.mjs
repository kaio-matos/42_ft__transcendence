import { Component } from "../../../components/component.mjs";
import { PlayerService } from "../../../services/player.mjs";
import { session } from "../../../state/session.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Profile = () => {
  const page = new Component("div").class("container mx-auto");

  page.element.innerHTML = `
    <div class="border border-secondary p-2 rounded">
      <h1>Perfil</h1>
      <form id="update-form">
        <div class="mb-3">
          <strong>Email:</strong>
          <span id="email-placeholder"></span>
        </div>

        <t-input id="input-name" label="Nome"></t-input>

        <t-errors id="errors"></t-errors>
        <t-toast>
          <strong slot="header">Sucesso!</strong>
          Seu perfil foi atualizado com sucesso!
        </t-toast>
        <t-button id="save-button" class="mt-3">Salvar</t-button>
      </form>
    </div>
  `;

  const form = page.element.querySelector("#update-form");
  const t_input_name = form.querySelector("#input-name");
  const t_errors = form.querySelector("#errors");
  const t_button_save = form.querySelector("#save-button");
  const email_placeholder = form.querySelector("#email-placeholder");
  const t_toast_success = form.querySelector("t-toast");

  t_input_name.value = session.player.name;
  email_placeholder.textContent = session.player.email;

  let name = t_input_name.value;

  t_input_name.input.addEventListener("change", (e) => {
    name = e.target.value;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    t_input_name.clearErrors();
    t_errors.clearErrors();

    try {
      t_button_save.setLoading(true);
      const player = await PlayerService.updatePlayer({
        name: name,
      });
      session.player = player;
      t_toast_success.open();
    } catch (error) {
      if (error instanceof UnprocessableEntityError) {
        t_input_name.addErrors(error.data?.error?.name);
        t_errors.addErrors(error.data?.error?._errors);
      } else if (error instanceof RequestFailedError) {
        t_errors.addErrors(error.data?.error?._errors);
      }
    } finally {
      t_button_save.setLoading(false);
    }
  });

  return page;
};
