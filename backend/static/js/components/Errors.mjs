import { Component } from "./component.mjs";

export class Errors extends Component {
  /** @type {string[]} */
  errors = [];

  /**
   * @param {string[]} errors
   */
  constructor(errors) {
    super("div");
    if (errors) {
      this.errors = errors;
    }
    this.class(["text-danger-emphasis", ""]);

    this.#updateUI();
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
    this.clear();

    if (this.errors) {
      this.children(
        this.errors.map((error) => new Component("p", { textContent: error })),
      );
    }
  }
}
