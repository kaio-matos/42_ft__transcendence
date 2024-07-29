import { Component } from "../../components/component.mjs";
import { CanvasBall } from "../../components/PongCanvas/canvas-components/CanvasBall.mjs";
import { CanvasPaddle } from "../../components/PongCanvas/canvas-components/CanvasPaddle.mjs";
import { PongCanvas } from "../../components/PongCanvas/PongCanvas.mjs";
import { Player } from "../../game/player.mjs";
import { TournamentService } from "../../services/tournament.mjs";
import { NotFound } from "../not-found/index.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Game = ({ params }) => {
  const tournament_id = params.tournament;

  if (!tournament_id) {
    return NotFound({ params });
  }

  const page = new Component("div").class("container mx-auto");
  page.element.innerHTML = `
      <t-loading id="loading-tournament" loading="true">
        <t-pong-canvas id="pong-canvas"></t-pong-canvas>
      </t-loading>
  `;

  TournamentService.getTournament({ tournament_id }).then(() => {
    page.element.querySelector("#loading-tournament").setLoading(false);

    /** @type {PongCanvas} */
    const canvas = page.element.querySelector("#pong-canvas");

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

    canvas.render();

    setInterval(() => {
      player1.paddle.setY(canvas.VCH(player1.position));
      player2.paddle.setY(canvas.VCH(player2.position));

      canvas.render();
    }, 16);
  });

  return page;
};
