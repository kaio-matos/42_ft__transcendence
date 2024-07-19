import { Component } from "./component.mjs";

export class Button extends Component {
  /**
   * @param {string} content
   */
  constructor(content) {
    super("button", {
      textContent: content,
    }).class(["btn", "btn-primary"]);
  }
}
