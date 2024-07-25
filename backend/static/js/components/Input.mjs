import { attachBootstrap, Component } from "./component.mjs";
import { Errors } from "./Errors.mjs";

export class Input extends HTMLElement {
  /** @type {Component} */
  input;

  /** @type {Component} */
  label;

  /** @type {Errors} */
  errors;

  constructor() {
    super();

    const label = this.getAttribute("label");

    this.input = new Component("input")
      .attributes({
        placeholder: label,
      })
      .class("form-control");
    this.label = new Component("label", {
      textContent: label,
    });
    this.errors = new Component("t-errors");
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    attachBootstrap(shadow);

    const container = new Component("div");

    container.children([this.input, this.label, this.errors]);
    container.class("form-floating");

    shadow.appendChild(container.element);
  }

  /**
   * @param {string | string[]} error
   */
  addErrors(errors) {
    this.errors.element.addErrors(errors);
    this.input.removeClass("is-valid");
    this.input.class("is-invalid");
    return this;
  }

  clearErrors() {
    this.errors.element.clearErrors();
    this.input.removeClass("is-invalid");
    this.input.class("is-valid");
    return this;
  }
}
