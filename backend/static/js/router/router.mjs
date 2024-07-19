export class Route {
  /** @type {string} */
  path;
  /** @type {import("../components/component.mjs").FunctionalComponent} */
  page;

  /**
   * @param {string} path
   * @param {import("../components/component.mjs").FunctionalComponent} page
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

  /**
   * @param {Route[]} routes
   */
  constructor(routes) {
    this.routes = routes;
  }

  get current() {
    const pathname = window.location.pathname;
    const current = this.routes.find((route) => route.path.includes(pathname));

    return current;
  }

  get root() {
    return document.getElementById(this.root_id);
  }

  previous() {}
  navigate() {}
  next() {}

  render() {
    if (this.root && this.current) {
      this.root.innerHTML = "";
      this.root.appendChild(this.current.page().element);
    }
  }
}
