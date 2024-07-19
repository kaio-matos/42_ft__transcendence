import { Component } from "../../components/component.mjs";
import { Button } from "../../components/Button.mjs";
import { Input } from "../../components/Input.mjs";
import { PlayerService } from "../../services/player.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Home = () => {
  let name = "";

  const inputName = new Input("Name", "", name);

  inputName.input.addEventListener("change", (e) => {
    name = e.target.value;
  });

  const form = new Component("form")
    .class(["d-flex", "flex-column", "gap-3"])
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const player = await PlayerService.createPlayer({ name: name });
    })
    .children([() => inputName, () => new Button("Register")]);

  const page = new Component("div")
    .class(["container-fluid", "p-5"])
    .children([() => form]);

  return page;
};
