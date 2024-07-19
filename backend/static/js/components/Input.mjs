import { Component } from "./component.mjs";

export class Input extends Component {
  /** @type Component */
  input;

  /** @type Component */
  label;

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
    this.children([() => this.input, () => this.label]);
    this.class("form-floating");
  }
}
