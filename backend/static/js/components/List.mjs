import { Component } from "./component.mjs";

export class List extends Component {
  /** @type {Component} */
  ul;
  /** @type {(item: string) => Component?} */
  itemRenderer = null;

  /**
   * @param {string} title
   * @param {string[]?} items
   * @param {(item: string) => Component?} itemRenderer
   */
  constructor(title, items, itemRenderer) {
    super("div").class("border border-secondary p-2 rounded");
    this.ul = new Component("ul");
    this.itemRenderer = itemRenderer;

    if (items) {
      items.forEach((item) => this.addItem(item));
    }

    this.children([new Component("p", { textContent: title }), this.ul]);
  }

  /**
   * @param {string} item
   */
  addItem(item) {
    let li;
    if (this.itemRenderer) {
      li = new Component("li")
        .attributes({
          "data-name": item,
        })
        .children([this.itemRenderer(item)]);
    } else {
      li = new Component("li", {
        textContent: item,
      }).attributes({ "data-name": item });
    }
    this.ul.children([li]);
  }

  /**
   * @param {string} item
   */
  removeItem(item) {
    const child = this.ul.element.querySelector(`li[data-name=${item}]`);
    this.ul.element.removeChild(child);
  }
}
