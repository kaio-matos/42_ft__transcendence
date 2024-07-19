export class Route {
  /** @type string */
  path;
  /** @type () => string */
  page;

  /**
   * @param {string} path
   * @param {() => string} page
   */
  constructor(path, page) {
    this.path = path;
    this.page = page;
  }
}

class Router {
  root_id = "app";
  routes = [
    new Route("/", () => "Home Page"),
    new Route("/about", () => "About Page"),
  ];

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
      this.root.innerHTML = this.current?.page();
    }
  }
}

export const router = new Router();
