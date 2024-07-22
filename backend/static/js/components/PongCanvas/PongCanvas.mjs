import { Component } from "../component.mjs";
import { CanvasElement } from "./canvas-components/CanvasElement.mjs";

export class PongCanvas extends Component {
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  width = 1000;
  height = 500;
  /** @type {CanvasElement[]} */
  elements = [];

  constructor() {
    super("canvas");
    // TODO: Create dynamically sized canvas for better small screen support
    this.attributes({ width: this.width, height: this.height });
    this.#canvas = this.element;
    this.#ctx = this.#canvas.getContext("2d");
  }

  /**
   * Transforms VCW to pixels
   * @param {import("./types.mjs").VCW} n
   */
  VCW(n) {
    return (n / 100) * this.width;
  }

  /**
   * Transforms VCH to pixels
   *
   * @param {import("./types.mjs").VCH} n
   */
  VCH(n) {
    return (n / 100) * this.height;
  }

  /**
   * Transforms pixels to VCW
   * @param {number} n
   * @returns {import("./types.mjs").VCW}
   */
  PixelsToVCW(n) {
    return (n * 100) / this.width;
  }

  /**
   * Transforms pixels to VCH
   * @param {number} n
   * @returns {import("./types.mjs").VCH}
   */
  PixelsToVCH(n) {
    return (n * 100) / this.height;
  }

  /**
   * @param {CanvasElement} element
   */
  addCanvasElement(element) {
    this.elements.push(element);
    return this;
  }

  clear() {
    this.#ctx.clearRect(0, 0, this.width, this.height);
  }

  render() {
    this.clear();
    for (const element of this.elements) {
      element.render(this.#ctx);
    }
  }
}
