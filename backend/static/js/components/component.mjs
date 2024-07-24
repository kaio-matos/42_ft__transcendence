/** @typedef {() => Component} FunctionalComponent */

export class Component {
  /** @type {HTMLElement} */
  element;

  /**
   * @param {HTMLElement | Parameters<typeof document.createElement>[0]} ElementOrTag
   * @param {object} options
   */
  constructor(ElementOrTag, options) {
    if (typeof ElementOrTag === "object") {
      this.element = ElementOrTag;
      return;
    }

    this.element = document.createElement(ElementOrTag);

    if (!options) return;
    for (const key in options) {
      if (options[key]) {
        this.element[key] = options[key];
      }
    }
  }

  get parent() {
    return new Component(this.element.parentElement);
  }

  /**
   * Remove children from this component
   */
  clear() {
    this.element.innerHTML = "";
    return this;
  }

  /**
   * @param {(FunctionalComponent | Component | Parameters<HTMLElement['appendChild']>[0])[]} children
   */
  children(children) {
    for (const child of children) {
      let component;
      if (typeof child === "function") {
        component = child();
      } else {
        component = child;
      }
      if (component instanceof Component) {
        this.element.appendChild(component.element);
      } else {
        this.element.appendChild(component);
      }
    }
    return this;
  }

  /**
   * @param {string | string[]} classes
   */
  class(classes) {
    if (!classes) return this;

    if (Array.isArray(classes)) {
      classes = classes.filter((c) => c);
      if (classes.length == 0) return this;

      this.element.classList.add(...classes);
    } else {
      this.element.classList.add(...classes.split(" "));
    }
    return this;
  }

  /**
   * @param {string | string[]} classes
   */
  removeClass(classes) {
    if (!classes) return this;

    if (Array.isArray(classes)) {
      classes = classes.filter((c) => c);
      if (classes.length == 0) return this;

      this.element.classList.remove(...classes);
    } else {
      this.element.classList.remove(classes);
    }
    return this;
  }

  /**
   * @param {object} obj
   */
  attributes(obj) {
    for (const key in obj) {
      this.element.setAttribute(key, obj[key]);
    }
    return this;
  }

  /**
   * @param {CSSStyleDeclaration} obj
   */
  styles(obj) {
    for (const key in obj) {
      this.element.style[key] = obj[key];
    }
    return this;
  }

  /**
   * @param {Parameters<HTMLElement['addEventListener']>[0]} event
   * @param {Parameters<HTMLElement['addEventListener']>[1]} callback
   */
  addEventListener(event, callback) {
    this.element.addEventListener(event, callback);
    return this;
  }

  /**
   * @param {Parameters<HTMLElement['removeEventListener']>[0]} event */
  removeEventListener(event) {
    this.element.removeEventListener(event);
    return this;
  }
}
