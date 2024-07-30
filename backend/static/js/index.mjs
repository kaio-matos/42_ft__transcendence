import "./override.mjs";
import { Game } from "./pages/game/index.mjs";
import { Home } from "./pages/home/index.mjs";
import { NotFound } from "./pages/not-found/index.mjs";
import { Login } from "./pages/login/index.mjs";
import { Router, Route } from "./router/router.mjs";
import "./communication/player.mjs";
import "./components/index.mjs";

export const router = new Router(
  [new Route("/", Home), new Route("/game", Game), new Route("/login", Login)],
  { NotFoundPage: NotFound },
);

function render() {
  router.render();
}

document.addEventListener("DOMContentLoaded", render);
window.addEventListener("pushstate", render);
window.addEventListener("popstate", render);
window.addEventListener("beforeunload", render, {
  passive: true,
});
