import { CanvasPaddle } from "../components/PongCanvas/canvas-components/CanvasPaddle.mjs";

/** @typedef {{ up: string, down: string }} PlayerControlKeys */

export class Player {
  /** @type {import("../../components/PongCanvas/types.mjs").VCH} */
  position;
  /** @type {CanvasPaddle} */
  paddle;
  /** @type {PlayerControlKeys} */
  keys;

  /**
   * @param {{ position: import("../../components/PongCanvas/types.mjs").VCH, paddle: CanvasPaddle, keys: PlayerControlKeys}} param0
   */
  constructor({ position, paddle, keys }) {
    this.position = position;
    this.paddle = paddle;
    this.keys = keys;
    let pressedKey = "";

    document.addEventListener("keydown", (event) => {
      // TODO: Cleanup this listener
      if ([this.keys.up, this.keys.down].includes(event.key)) {
        pressedKey = event.key;
      }
    });

    document.addEventListener("keyup", (event) => {
      // TODO: Cleanup this listener
      if ([this.keys.up, this.keys.down].includes(event.key)) {
        pressedKey = "";
      }
    });

    const move = () => {
      if (pressedKey == this.keys.up) {
        this.moveUp();
      } else if (pressedKey == this.keys.down) {
        this.moveDown();
      }
      window.requestAnimationFrame(move);
    };
    move();
  }

  moveUp() {
    this.position -= 1;
  }

  moveDown() {
    this.position += 1;
  }
}
