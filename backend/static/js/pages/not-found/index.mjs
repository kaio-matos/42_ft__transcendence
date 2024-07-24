import { Component } from "../../components/component.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const NotFound = () => {
  const page = new Component("div", {
    textContent: "Page not found | 404",
  }).class("container text-center font-3 p-5");

  return page;
};
