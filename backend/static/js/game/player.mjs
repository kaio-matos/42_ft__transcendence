import { CanvasPaddle } from "../components/PongCanvas/canvas-components/CanvasPaddle.mjs";

export class Player {
  /** @type {import("../../components/PongCanvas/types.mjs").VCH} */
  position;
  /** @type {CanvasPaddle} */
  paddle;

  /**
   * @param {import("../../components/PongCanvas/types.mjs").VCH} position
   * @param {CanvasPaddle} paddle
   */
  constructor(position, paddle) {
    this.position = position;
    this.paddle = paddle;
  }

  moveUp() {
    this.position -= 1;
  }

  moveDown() {
    this.position += 1;
  }
}
