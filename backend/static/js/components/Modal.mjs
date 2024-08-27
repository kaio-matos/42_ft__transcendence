import { attachBootstrap, Component } from "./component.mjs";

export class Modal extends HTMLElement {
  /** @type {Component} */
  container;

  constructor() {
    super();
    this.container = new Component("div")
      .class("d-flex bg-secondary p-4 rounded flex-column")
      .styles({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "50vw",
        zIndex: 1000,
      });
    this.container.element.innerHTML = `
      <div>
        <slot name="header"></slot>
      </div>

      <div>
        <slot name="body"></slot>
      </div>

      <div>
        <slot name="footer"></slot>
      </div>
    `;
  }

  show() {
    this.classList.add("d-block");
    this.classList.remove("d-none");
  }

  hide() {
    this.classList.add("d-none");
    this.classList.remove("d-block");
  }

  connectedCallback() {
    const shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    shadow.innerHTML = "<style>:host { display: none; }</style>";
    attachBootstrap(shadow);

    shadow.appendChild(this.container.element);
  }
}
