import { Button } from "../../components/Button.mjs";
import { Component } from "../../components/component.mjs";
import { List } from "../../components/List.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Dashboard = () => {
  const page = new Component("div").class(["container-fluid", "p-5"]);

  page.children([
    () =>
      new List("Online Players", ["John", "Carlos", "Paulo"], (item) =>
        new Component("span", { textContent: item })
          .addEventListener("click", () => {
            console.log("Challenge Player " + item);
          })

          .class("d-flex justify-content-between mb-1")
          .children([() => new Button("Challenge")]),
      ),
  ]);

  return page;
};
