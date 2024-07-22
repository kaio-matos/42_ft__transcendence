import { CanvasPaddle } from "./canvas-components/CanvasPaddle.mjs";
import { Component } from "../component.mjs";

export class PongCanvas extends Component {
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  width = 1000;
  height = 500;

  constructor() {
    super("canvas");
    // TODO: Create dynamically sized canvas for better small screen support
    this.attributes({ width: this.width, height: this.height });
    this.#canvas = this.element;
    this.#ctx = this.#canvas.getContext("2d");
    new CanvasPaddle()
      .pos(this.#VCW(0), this.#VCH(50))
      .translate(0, -50)
      .render(this.#ctx);
    new CanvasPaddle()
      .pos(this.#VCW(99), this.#VCH(50))
      .translate(0, -50)
      .render(this.#ctx);
  }

  /**
   * VCW = View Canvas Width
   * Transforms `n` to a VCW unit, it should work like a `vw` unit but based on the canvas width
   * @param {import("./types.mjs").VCW} n - number between 0 and 100
   */
  #VCW(n) {
    return (n / 100) * this.width;
  }

  /**
   * VCH = View Canvas Height
   * Transforms `n` to a VCH unit, it should work like a `vh` unit but based on the canvas height
   *
   * @param {import("./types.mjs").VCH} n - number between 0 and 100
   */
  #VCH(n) {
    return (n / 100) * this.height;
  }
}
