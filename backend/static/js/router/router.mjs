import { Component } from "../components/component.mjs";
import { router } from "../index.mjs";

/** @typedef {Record<string, string | undefined} Params */
/** @typedef {(props: { params: Params }) => Component} Page */

// TODO: Fix navigation
window.navigation.addEventListener("navigate", (event) => {
  router.render();
});

export class Route {
  /** @type {string} */
  path;
  /** @type {Page} */
  page;

  /**
   * @param {string} path
   * @param {Page} page
   */
  constructor(path, page) {
    this.path = path;
    this.page = page;
  }
}

export class Router {
  root_id = "app";
  /** @type {Route[]} */
  routes;
  /** @type {import("../components/component.mjs").FunctionalComponent} */
  NotFoundPage;

  /**
   * @param {Route[]} routes
   * @param {{ NotFoundPage: import("../components/component.mjs").FunctionalComponent }} fallback
   */
  constructor(routes, fallback) {
    this.routes = routes;
    this.NotFoundPage = fallback.NotFoundPage;
  }

  get current() {
    const pathname = window.location.pathname;
    const removeSlashes = (str) => str.replace("/", "");

    const matchedRoutes = this.routes.find((route) => {
      const pathnameWithoutSlashes = removeSlashes(pathname);
      const routePathWithoutSlashes = removeSlashes(route.path);
      return pathnameWithoutSlashes == routePathWithoutSlashes;
    });

    return matchedRoutes;
  }

  get root() {
    return document.getElementById(this.root_id);
  }

  previous() {}

  /**
   * @param {string} path
   */
  navigate(path) {
    window.history.pushState({}, "unused", path);
  }
  next() {}

  render() {
    if (!this.root) return;
    const params = this.#getUrlParams(window.location.search);
    if (!this.current) {
      this.root.innerHTML = "";
      this.root.appendChild(this.NotFoundPage({ params }).element);
      return;
    }
    this.root.innerHTML = "";
    this.root.appendChild(this.current.page({ params }).element);
  }

  /**
   * @param {string} string
   * @returns {Params}
   */
  #getUrlParams(string) {
    const params = {};

    for (const [key, value] of new URLSearchParams(string).entries()) {
      params[key] = value;
    }

    return params;
  }
}
