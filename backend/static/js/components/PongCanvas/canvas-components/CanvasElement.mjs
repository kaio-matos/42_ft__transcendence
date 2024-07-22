export class CanvasElement {
  /** @type {number} */
  __width;
  /** @type {number} */
  __height;
  /** @type {import("../types.mjs").VCW} */
  __x;
  /** @type {import("../types.mjs").VCH} */
  __y;

  /**
   * @param {number} w
   * @param {number} h
   * @returns {this}
   */
  size(w, h) {
    this.__width = w;
    this.__height = h;
  }

  /**
   * @param {import("../types.mjs").VCW} x
   * @param {import("../types.mjs").VCH} y
   */
  pos(x, y) {
    this.__x = x;
    this.__y = y;
    return this;
  }

  /**
   * @param {number} x - number between -100 and 100 to offset
   * @param {number} y - number between -100 and 100 to offset
   */
  translate(x, y) {
    if (x < 0) this.__x -= (Math.abs(x) / 100) * this.__width;
    else this.__x += (x / 100) * this.__width;

    if (y < 0) this.__y -= (Math.abs(y) / 100) * this.__height;
    else this.__y += (y / 100) * this.__height;

    return this;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @abstract
   * @returns {this}
   */
  render(ctx) {
    throw new Error("must be implemented by subclass!");
  }
}
