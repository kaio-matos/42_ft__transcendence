import { Component } from "../../components/component.mjs";
import { PongCanvas } from "../../components/PongCanvas.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Game = () => {
  const canvas = new PongCanvas();

  const page = new Component("div")
    .class(["container-fluid", "p-5"])
    .children([() => canvas]);

  return page;
};
