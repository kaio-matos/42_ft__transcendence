import { Component } from "./component.mjs";

export class List extends Component {
  /** @type {Component} */
  ul;
  /** @type {(item: string) => Component?} */
  itemRenderer = null;

  /**
   * @param {string} title
   * @param {any[]} items
   * @param {{ emptyListMessage: string itemRenderer: (item: any) => Component?}} options
   */
  constructor(title, items, { itemRenderer, emptyListMessage }) {
    super("div").class("border border-secondary p-2 rounded");
    this.ul = new Component("ul");
    this.itemRenderer = itemRenderer;

    if (items.length) {
      items.forEach((item) => this.addItem(item));
      this.children([new Component("p", { textContent: title }), this.ul]);
    } else {
      this.children([
        new Component("p", { textContent: title }),
        new Component("span", { textContent: emptyListMessage }),
      ]);
    }
  }

  /**
   * @param {any} item
   */
  addItem(item) {
    let li;
    if (this.itemRenderer) {
      li = new Component("li")
        .attributes({
          "data-name": String(item),
        })
        .children([this.itemRenderer(item)]);
    } else {
      li = new Component("li", {
        textContent: String(item),
      }).attributes({ "data-name": String(item) });
    }
    this.ul.children([li]);
  }

  /**
   * @param {string} item
   */
  removeItem(item) {
    const child = this.ul.element.querySelector(`li[data-name="${item}"]`);
    this.ul.element.removeChild(child);
  }
}
