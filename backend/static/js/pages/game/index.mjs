import { TournamentCommunication } from "../../communication/tournament.mjs";
import { Component } from "../../components/component.mjs";
import { CanvasBall } from "../../components/PongCanvas/canvas-components/CanvasBall.mjs";
import { CanvasPaddle } from "../../components/PongCanvas/canvas-components/CanvasPaddle.mjs";
import { PongCanvas } from "../../components/PongCanvas/PongCanvas.mjs";
import { NotFound } from "../not-found/index.mjs";

/**
 * @typedef {{
 *   tournament: import("../../services/tournament.mjs").Tournament,
 *   screen: { width: number, height: number },
 *   game: {
 *      players: { placement: number, position: { x: number, y: number }, data: import("../../services/player.mjs").Player }[],
 *      ball: { position:  { x: number, y: number} },
 *   },
 * }} Game
 */

/** @typedef {{ up: string, down: string }} PlayerControlKeys */

/**
 * @param {PlayerControlKeys & { onKeyPressUp: () => void, onKeyPressDown: () => void }} options
 */
function onKeysPressed(options) {
  let pressedKey = "";

  document.addEventListener("keydown", (event) => {
    // TODO: Cleanup this listener
    if ([options.up, options.down].includes(event.key)) {
      pressedKey = event.key;
    }
  });

  document.addEventListener("keyup", (event) => {
    // TODO: Cleanup this listener
    if ([options.up, options.down].includes(event.key)) {
      pressedKey = "";
    }
  });

  const onKeyPress = () => {
    if (pressedKey == options.up) {
      options.onKeyPressUp();
    } else if (pressedKey == options.down) {
      options.onKeyPressDown();
    }
    window.requestAnimationFrame(onKeyPress);
  };
  onKeyPress();
}

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

  /** @type {PongCanvas} */
  const canvas = page.element.querySelector("#pong-canvas");

  TournamentCommunication.Communication.setPath(
    "ws/tournament/" + tournament_id,
  );
  TournamentCommunication.Communication.connect(() => {
    TournamentCommunication.Communication.send(
      TournamentCommunication.Commands.JOIN_TOURNAMENT, // We tell the server that we want to begin the tournament
      {
        screen: {
          width: canvas.width,
          height: canvas.height,
        },
      },
    );
  });

  TournamentCommunication.Communication.addEventListener(
    TournamentCommunication.Events.TOURNAMENT_START, // and then as soon as the server tell us that we can start we setup the canvas and stop loading
    onTournamentStart,
  );

  /**
   * @param {Game} param0
   */
  function onTournamentStart({ game, tournament, screen }) {
    page.element.querySelector("#loading-tournament").setLoading(false);

    const ball = new CanvasBall()
      .pos(canvas.VCW(game.ball.position.x), canvas.VCH(game.ball.position.y))
      .translate(-50, -50);

    const players = game.players.map(({ placement, position, data }) => {
      const paddle = new CanvasPaddle().pos(
        canvas.VCW(position.x),
        canvas.VCH(position.y),
      );

      switch (placement) {
        case 1:
          paddle.translate(0, -50);
          break;
        case 2:
          paddle.translate(-100, -50);
          break;
        case 3:
          paddle.translate(-50, 100);
          break;
        case 4:
          paddle.translate(-50, -100);
          break;
      }

      return {
        paddle,
        data,
      };
    });

    players.forEach((p) => canvas.addCanvasElement(p.paddle));
    canvas.addCanvasElement(ball);

    canvas.render();

    onKeysPressed({
      up: "ArrowUp",
      down: "ArrowDown",
      onKeyPressUp() {
        TournamentCommunication.Communication.send(
          TournamentCommunication.Commands.KEY_PRESS,
          { direction: "UP" },
        );
      },
      onKeyPressDown() {
        TournamentCommunication.Communication.send(
          TournamentCommunication.Commands.KEY_PRESS,
          { direction: "DOWN" },
        );
      },
    });

    /**
     * @param {Game} param0
     */
    function onTournamentUpdate({ game }) {
      players.forEach((p, i) =>
        p.paddle.pos(
          canvas.VCW(game.players[i].position.x),
          canvas.VCH(game.players[i].position.y),
        ),
      );

      ball.pos(
        canvas.VCW(game.ball.position.x),
        canvas.VCH(game.ball.position.y),
      );
    }

    TournamentCommunication.Communication.addEventListener(
      TournamentCommunication.Events.TOURNAMENT_UPDATE,
      onTournamentUpdate,
    );

    setInterval(() => canvas.render(), 16); // TODO: do this the right way
  }

  return page;
};
