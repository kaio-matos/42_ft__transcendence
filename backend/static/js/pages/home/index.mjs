import { Component } from "../../components/component.mjs";
import { Dashboard } from "./Dashboard.mjs";
import { Registration } from "./Registration.mjs";

/** @type {import("../../services/player.mjs").Player | null} */
let player = null;

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Home = () => {
  const page = new Component("div").class(["h-100", "w-100"]);

  // If the player is already logged in we want to show them the dashboard component, otherwise we show them the registration component
  if (player) {
    page.clear();
    page.children([Dashboard]);
  } else {
    page.clear();
    page.children([
      Registration({
        // After the registration this function will be called and we will show the user the dashboard
        onRegistration(registeredPlayer) {
          player = registeredPlayer;
          page.clear();
          page.children([Dashboard]);
        },
      }),
    ]);
  }

  return page;
};
