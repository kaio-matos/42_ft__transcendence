import { Component } from "./component.mjs";
import { Errors } from "./Errors.mjs";

export class Input extends Component {
  /** @type {Component} */
  input;

  /** @type {Component} */
  label;

  /** @type {Errors} */
  errors;

  /**
   * @param {string} label
   * @param {string} placeholder
   * @param {string} value
   */
  constructor(label = "", placeholder = "", value = "") {
    super("div");

    this.input = new Component("input", {
      placeholder,
      value,
    }).class("form-control");
    this.label = new Component("label", {
      textContent: label,
    });
    this.errors = new Errors();

    this.children([() => this.input, () => this.label, () => this.errors]);
    this.class("form-floating");
  }

  /**
   * @param {string | string[]} error
   */
  addErrors(errors) {
    this.errors.addErrors(errors);
    this.input.removeClass("is-valid");
    this.input.class("is-invalid");
    return this;
  }

  clearErrors() {
    this.errors.clearErrors();
    this.input.removeClass("is-invalid");
    this.input.class("is-valid");
    return this;
  }
}
