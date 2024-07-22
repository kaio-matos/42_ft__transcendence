import { CanvasPaddle } from "./canvas-components/CanvasPaddle.mjs";
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
   * VCW = View Canvas Width
   * Transforms `n` to a VCW unit, it should work like a `vw` unit but based on the canvas width
   * @param {import("./types.mjs").VCW} n - number between 0 and 100
   */
  VCW(n) {
    return (n / 100) * this.width;
  }

  /**
   * VCH = View Canvas Height
   * Transforms `n` to a VCH unit, it should work like a `vh` unit but based on the canvas height
   *
   * @param {import("./types.mjs").VCH} n - number between 0 and 100
   */
  VCH(n) {
    return (n / 100) * this.height;
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
