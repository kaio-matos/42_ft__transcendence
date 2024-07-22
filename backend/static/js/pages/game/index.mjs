import { Component } from "../../components/component.mjs";
import { CanvasPaddle } from "../../components/PongCanvas/canvas-components/CanvasPaddle.mjs";
import { PongCanvas } from "../../components/PongCanvas/PongCanvas.mjs";

/** @type {import("../../components/component.mjs").FunctionalComponent} */
export const Game = () => {
  const canvas = new PongCanvas();

  const player1 = {
    position: canvas.VCH(50),
    paddle: new CanvasPaddle()
      .pos(canvas.VCW(0), canvas.VCH(50))
      .translate(0, -50),
  };

  const player2 = {
    paddle: new CanvasPaddle()
      .pos(canvas.VCW(100), canvas.VCH(50))
      .translate(-100, -50),
  };

  canvas.addCanvasElement(player1.paddle).addCanvasElement(player2.paddle);

  const page = new Component("div")
    .class(["container-fluid", "p-5"])
    .children([() => canvas]);

  canvas.render();

  setInterval(() => {
    player1.paddle.pos(canvas.VCW(0), (player1.position += 10));
    canvas.render();
  }, 1000);

  return page;
};
