import { Game } from "./pages/game/index.mjs";
import { Home } from "./pages/home/index.mjs";
import { NotFound } from "./pages/not-found/index.mjs";
import { Router, Route } from "./router/router.mjs";
import "./communication/player.mjs";
import "./components/index.mjs";

export const router = new Router(
  [new Route("/", Home), new Route("/game", Game)],
  { NotFoundPage: NotFound },
);

document.addEventListener("DOMContentLoaded", (event) => {
  router.render();
});
