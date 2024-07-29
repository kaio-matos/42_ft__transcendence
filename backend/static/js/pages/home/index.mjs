import { Component } from "../../components/component.mjs";
import { router } from "../../index.mjs";
import { session } from "../../state/session.mjs";
import { Dashboard } from "./Dashboard.mjs";
import { Registration } from "./Registration.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Home = () => {
  const page = new Component("div").class(["h-100", "w-100"]);

  // If the player is already logged in we want to show them the dashboard component, otherwise we show them the registration component
  if (session.player) {
    page.clear();
    page.children([Dashboard]);
  } else {
    page.clear();
    page.children([
      Registration({
        // After the registration this function will be called and we will show the user the dashboard
        onRegistration(registeredPlayer) {
          router.navigate("/login");
        },
      }),
    ]);
  }

  return page;
};
