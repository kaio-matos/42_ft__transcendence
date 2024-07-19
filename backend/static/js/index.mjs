import { Home } from "./pages/home/index.mjs";
import { Router, Route } from "./router/router.mjs";

export const router = new Router([new Route("/", Home)]);

document.addEventListener("DOMContentLoaded", (event) => {
  router.render();
});
