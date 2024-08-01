import { attachBootstrap, Component } from "./component.mjs";

export class Loading extends HTMLElement {
  static observedAttributes = ["loading"];

  constructor() {
    super();
    this.container = new Component("div", {
      textContent: "Carregando...", // TODO: do a better loading feedback
    });
  }

  /**
   * @param {boolean} value
   */
  setLoading(value) {
    this.setAttribute("loading", value ? "true" : "false");
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    attachBootstrap(shadow);

    shadow.appendChild(this.container.element);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "loading") {
      if (newValue === "true") {
        this.container.clear();
        this.container.element.textContent = "Carregando...";
      } else {
        this.container.clear();
        this.container.children([document.createElement("slot")]);
      }
    }
  }
}
