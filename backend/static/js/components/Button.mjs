import { router } from "../index.mjs";
import { attachBootstrap, Component } from "./component.mjs";

export class Button extends HTMLElement {
  static observedAttributes = [
    "to",
    "loading",
    "theme",
    "btn-class",
    "disabled",
  ];

  /** @type {Component} */
  button;

  listeners = new Map();

  theme = "primary";

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

  /**
   * @param {boolean} value
   */
  setDisabled(value) {
    this.setAttribute("disabled", value ? "true" : "false");
  }

  connectedCallback() {
    const shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    shadow.innerHTML = "<style>:host { display: inline-block; }</style>";
    attachBootstrap(shadow);

    const themes = {
      none: "bg-transparent",
      primary: "btn btn-primary",
      secondary: "btn btn-secondary",
      danger: "btn btn-danger",
      dark: "btn btn-dark",
    };

    if (this.theme === "none") {
      this.button.styles({
        outline: "none",
        padding: "0px",
        border: "none",
      });
    }
    this.button
      .class(themes[this.theme])
      .class(this.attributes.getNamedItem("btn-class")?.nodeValue);
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

      this.button.removeEventListener(
        "click",
        this.listeners.get("click_navigate"),
      );
      this.listeners.delete("click_navigate");

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
        this.button.class("disabled");
      } else {
        this.button.clear();
        this.button.removeClass("disabled");
        this.button.children([document.createElement("slot")]);
      }
    } else if (name === "theme") {
      this.theme = newValue ? newValue : "primary";
    } else if (name === "disabled") {
      if (this.getAttribute("disabled") === "true") {
        this.button.element.setAttribute("disabled", "true");
      } else {
        this.button.element.removeAttribute("disabled");
      }
    }
  }
}
