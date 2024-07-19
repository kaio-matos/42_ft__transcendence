import { Component } from "../../components/component.mjs";
import { PlayerService } from "../../services/player.mjs";

/**
 * @param {string} label
 * @param {string} placeholder
 * @param {string} value
 */
export function Input(label = "", placeholder = "", value = "") {
  const input = new Component("input", {
    placeholder,
    value,
  }).class("form-control");

  const container = new Component("div")
    .children([
      () => input,
      () =>
        new Component("label", {
          textContent: label,
        }),
    ])
    .class("form-floating");

  return container;
}

/**
 * @param {string} content
 */
function Button(content) {
  const button = new Component("button", {
    textContent: content,
  }).class(["btn", "btn-primary"]);

  return button;
}

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Home = () => {
  let name = "";

  const form = new Component("form")
    .class(["d-flex", "flex-column", "gap-3"])
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const player = await PlayerService.createPlayer({ name: name });
    })
    .children([
      () =>
        Input("Name", "", name).addEventListener("change", (e) => {
          name = e.target.value;
        }),
      () => Button("Register"),
    ]);

  const page = new Component("div")
    .class(["container-fluid", "p-5"])
    .children([() => form]);

  return page;
};
