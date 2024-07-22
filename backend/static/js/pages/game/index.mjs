import { Component } from "../../components/component.mjs";
import { CanvasPaddle } from "../../components/PongCanvas/canvas-components/CanvasPaddle.mjs";
import { PongCanvas } from "../../components/PongCanvas/PongCanvas.mjs";
import { Player } from "../../game/player.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Game = () => {
  const canvas = new PongCanvas();

  const player1 = new Player(
    50,
    new CanvasPaddle().pos(canvas.VCW(0), canvas.VCH(50)).translate(0, -50),
    canvas,
  );

  const player2 = new Player(
    50,
    new CanvasPaddle()
      .pos(canvas.VCW(100), canvas.VCH(50))
      .translate(-100, -50),
    canvas,
  );

  canvas.addCanvasElement(player1.paddle).addCanvasElement(player2.paddle);

  const page = new Component("div")
    .class(["container-fluid", "p-5"])
    .children([() => canvas]);

  canvas.render();

  setInterval(() => {
    if (Math.random() > 0.5) {
      player1.moveUp();
    } else {
      player1.moveDown();
    }

    if (Math.random() > 0.5) {
      player2.moveUp();
    } else {
      player2.moveDown();
    }

    player1.paddle.setY(canvas.VCH(player1.position));
    player2.paddle.setY(canvas.VCH(player2.position));

    canvas.render();
  }, 100);

  return page;
};
