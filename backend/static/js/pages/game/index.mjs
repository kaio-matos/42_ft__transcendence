import { Component } from "../../components/component.mjs";
import { CanvasBall } from "../../components/PongCanvas/canvas-components/CanvasBall.mjs";
import { CanvasPaddle } from "../../components/PongCanvas/canvas-components/CanvasPaddle.mjs";
import { PongCanvas } from "../../components/PongCanvas/PongCanvas.mjs";
import { Player } from "../../game/player.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Game = () => {
  const canvas = new PongCanvas();

  const ball = new CanvasBall()
    .pos(canvas.VCW(50), canvas.VCH(50))
    .translate(-50, -50);

  const player1 = new Player({
    position: 50,
    paddle: new CanvasPaddle()
      .pos(canvas.VCW(0), canvas.VCH(50))
      .translate(0, -50),
    keys: {
      up: "ArrowUp",
      down: "ArrowDown",
    },
  });

  const player2 = new Player({
    position: 50,
    paddle: new CanvasPaddle()
      .pos(canvas.VCW(100), canvas.VCH(50))
      .translate(-100, -50),
    keys: {
      up: "w",
      down: "s",
    },
  });

  canvas
    .addCanvasElement(player1.paddle)
    .addCanvasElement(player2.paddle)
    .addCanvasElement(ball);

  const page = new Component("div")
    .class(["container-fluid", "p-5"])
    .children([() => canvas]);

  canvas.render();

  setInterval(() => {
    player1.paddle.setY(canvas.VCH(player1.position));
    player2.paddle.setY(canvas.VCH(player2.position));

    canvas.render();
  }, 16);

  return page;
};
