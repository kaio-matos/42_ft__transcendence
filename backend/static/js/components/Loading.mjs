import { Component } from "./component.mjs";

export class Loading extends Component {
  /** @type {Component} */
  ul;

  /**
   * @param {Promise} promise
   * @param {(result) => Component} component
   */
  constructor(promise, component) {
    super("div", {
      textContent: "Loading...", // TODO: do a better loading feedback
    });
    const id = (Math.random() * 100).toFixed(0);
    this.attributes({
      "data-loading-id": id,
    });

    promise.then((result) => {
      const parent = this.parent;
      const child = parent.element.querySelector(
        `div[data-loading-id="${id}"]`,
      );
      parent.element.removeChild(child);
      this.element = component(result).element;
      parent.element.appendChild(this.element);
    });
  }
}
