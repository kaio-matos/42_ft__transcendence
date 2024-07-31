import { CanvasPaddle } from "../components/PongCanvas/canvas-components/CanvasPaddle.mjs";

export class GamePlayer {
  /** @type {CanvasPaddle} */
  paddle;
  /** @type {PlayerControlKeys | undefined} */
  keys;

  /**
   * @param {{ paddle: CanvasPaddle, keys?: PlayerControlKeys, onMovingUp: () => void, onMovingDown: () => void}} param0
   */
  constructor({ paddle, keys, onMovingUp, onMovingDown }) {
    this.paddle = paddle;
    this.keys = keys;

    if (!this.keys) return;
  }
}
