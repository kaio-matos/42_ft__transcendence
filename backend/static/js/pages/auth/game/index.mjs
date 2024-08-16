import { MatchCommunication } from "../../../communication/match.mjs";
import { PlayerCommunication } from "../../../communication/player.mjs";
import { Component } from "../../../components/component.mjs";
import { CanvasBall } from "../../../components/PongCanvas/canvas-components/CanvasBall.mjs";
import { CanvasPaddle } from "../../../components/PongCanvas/canvas-components/CanvasPaddle.mjs";
import { PongCanvas } from "../../../components/PongCanvas/PongCanvas.mjs";
import { router } from "../../../index.mjs";
import { NotFound } from "../../not-found/index.mjs";

/**
 * @typedef {{
 *   match: import("../../../services/match.mjs").Match,
 *   screen: { width: number, height: number },
 *   game: {
 *      players: { placement: number, position: { x: number, y: number }, data: import("../../../services/player.mjs").Player }[],
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

/** @type {import("../../../router/router.mjs").Page} */
export const Game = ({ params }) => {
  const match_id = params.match;

  if (!match_id) {
    return NotFound({ params });
  }

  const page = new Component("div").class("container mx-auto");
  page.element.innerHTML = `
      <t-loading id="loading-match" loading="true">
        <t-pong-canvas id="pong-canvas"></t-pong-canvas>
      </t-loading>
  `;

  /** @type {PongCanvas} */
  const canvas = page.element.querySelector("#pong-canvas");

  MatchCommunication.Communication.setPath("/ws/match/" + match_id);
  MatchCommunication.Communication.connect(() => {
    MatchCommunication.Communication.send(
      MatchCommunication.Commands.MATCH_JOIN, // We tell the server that we want to begin the match
      {
        screen: {
          width: canvas.width,
          height: canvas.height,
        },
      },
    );
  });

  MatchCommunication.Communication.addEventListener(
    MatchCommunication.Events.MATCH_START, // and then as soon as the server tell us that we can start we setup the canvas and stop loading
    onMatchStart,
  );

  /**
   * @param {Game} param0
   */
  function onMatchStart({ game, match, screen }) {
    page.element.querySelector("#loading-match").setLoading(false);

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
        MatchCommunication.Communication.send(
          MatchCommunication.Commands.KEY_PRESS,
          { direction: "UP" },
        );
      },
      onKeyPressDown() {
        MatchCommunication.Communication.send(
          MatchCommunication.Commands.KEY_PRESS,
          { direction: "DOWN" },
        );
      },
    });

    /**
     * @param {Game} param0
     */
    function onMatchUpdate({ game }) {
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

    MatchCommunication.Communication.addEventListener(
      MatchCommunication.Events.MATCH_UPDATE,
      onMatchUpdate,
    );

    setInterval(() => canvas.render(), 16); // TODO: do this the right way
  }

  /**
   * @param {{tournament: import("../../../services/tournament.mjs").Tournament}} param0
   */
  function onPlayerNotifyTournamentEnd({ tournament }) {
    // TODO: do something else to show that the user has won the game
    console.log("Voce ganhou parabens!", tournament);
  }

  PlayerCommunication.Communication.addEventListener(
    PlayerCommunication.Events.PLAYER_NOTIFY_TOURNAMENT_END,
    onPlayerNotifyTournamentEnd,
  );

  // TODO: add toast to notify the user that he has won/lose the match
  // NOTE: This logic can also be done in MATCH_UPDATE event by checking match.status property
  MatchCommunication.Communication.addEventListener(
    MatchCommunication.Events.MATCH_END,
    () => router.navigate("/auth"),
  );

  return page;
};
