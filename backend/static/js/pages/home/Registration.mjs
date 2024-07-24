import { Component } from "../../components/component.mjs";
import { Button } from "../../components/Button.mjs";
import { Input } from "../../components/Input.mjs";
import { PlayerService } from "../../services/player.mjs";
import { t } from "../../language.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Registration = ({ onRegistration }) => {
  let name = "";

  const inputName = new Input(
    t().home_form_registration_input_name_label,
    "",
    name,
  );

  inputName.input.addEventListener("change", (e) => {
    name = e.target.value;
  });

  const form = new Component("form")
    .class(["d-flex", "flex-column", "gap-3"])
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      inputName.clearErrors();

      if (!name) {
        inputName.addErrors(t().error_home_form_registration_missing_name);
        return;
      }

      const player = await PlayerService.createPlayer({ name: name });
      onRegistration(player);
    })
    .children([inputName, new Button(t().home_form_registration_button)]);

  const page = new Component("div")
    .class(["container-fluid", "p-5"])
    .children([form]);

  return page;
};
