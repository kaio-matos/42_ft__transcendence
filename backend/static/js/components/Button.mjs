import { router } from "../index.mjs";
import { attachBootstrap, Component } from "./component.mjs";

export class Button extends HTMLElement {
  static observedAttributes = ["to", "loading"];

  /** @type {Component} */
  button;
  listeners = new Map();

  constructor() {
    super();
    this.button = new Component("button");
  }

  /**
   * @param {boolean} value
   */
  setLoading(value) {
    this.setAttribute("loading", value ? "true" : "false");
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    attachBootstrap(shadow);

    this.button.class("btn btn-primary w-100 h-100");
    this.button.class(Array.from(this.classList.values()));
    this.button.element.append(document.createElement("slot"));
    shadow.appendChild(this.button.element);

    this.listeners.set("click_submit", () => {
      this.closest("FORM")?.dispatchEvent(new Event("submit"));
    });
    this.button.addEventListener("click", this.listeners.get("click_submit"));
  }

  disconnectedCallback() {
    this.listeners.forEach((listener) => {
      this.button.removeEventListener("click", listener);
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "to") {
      this.button.removeEventListener(
        "click",
        this.listeners.get("click_submit"),
      );
      this.listeners.delete("click_submit");

      this.listeners.set("click_navigate", () => {
        router.navigate(newValue);
      });
      this.button.addEventListener(
        "click",
        this.listeners.get("click_navigate"),
      );
    } else if (name === "loading") {
      if (newValue === "true") {
        this.button.clear();
        this.button.element.textContent = "Carregando...";
      } else {
        this.button.clear();
        this.button.children([document.createElement("slot")]);
      }
    }
  }
}
