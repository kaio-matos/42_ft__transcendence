import { attachBootstrap, Component } from "./component.mjs";

export class Errors extends HTMLElement {
  /** @type {Component} */
  container;
  /** @type {string[]} */
  errors = [];

  constructor() {
    super();
    this.container = new Component("div");
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    attachBootstrap(shadow);

    this.container.class(["text-danger-emphasis", ""]);

    shadow.appendChild(this.container.element);
  }

  /**
   * @param {string | string[]} error
   */
  addErrors(error) {
    if (Array.isArray(error)) {
      this.errors = [...this.errors, ...error];
    } else {
      this.errors.push(error);
    }
    this.#updateUI();
  }

  clearErrors() {
    this.errors = [];
    this.#updateUI();
  }

  #updateUI() {
    this.container.clear();
    if (this.errors) {
      this.container.children(
        this.errors.map((error) => new Component("p", { textContent: error })),
      );
    }
  }
}
