import { attachBootstrap, Component } from "./component.mjs";

export class Button extends HTMLElement {
  /** @type {Component} */
  button;

  constructor() {
    super();
    this.button = new Component("button");
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    attachBootstrap(shadow);

    this.button.class("btn btn-primary w-100");
    this.button.class(Array.from(this.classList.values()));
    this.button.element.append(document.createElement("slot"));
    shadow.appendChild(this.button.element);

    this.onclick = () =>
      this.closest("FORM")?.dispatchEvent(new Event("submit"));
  }
}
