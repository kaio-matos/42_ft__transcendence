import { MatchCommunication } from "../../../communication/match.mjs";
import { PlayerCommunication } from "../../../communication/player.mjs";
import { Component } from "../../../components/component.mjs";
import { CanvasBall } from "../../../components/PongCanvas/canvas-components/CanvasBall.mjs";
import { CanvasPaddle } from "../../../components/PongCanvas/canvas-components/CanvasPaddle.mjs";
import { PongCanvas } from "../../../components/PongCanvas/PongCanvas.mjs";
import { router } from "../../../index.mjs";
import { session } from "../../../state/session.mjs";
import { NotFound } from "../../not-found/index.mjs";

/**
 * @typedef {{
 *   match: import("../../../services/match.mjs").Match,
 *   screen: { width: number, height: number },
 *   game: {
 *      players: {
 *        placement: number,
 *        position: { x: number, y: number },
 *        data: import("../../../services/player.mjs").Player,
 *        paddle: { size: { width: number, height: number } }
 *      }[],
 *      ball: { size: {width: number, height: number} ,position: { x: number, y: number} },
 *      is_running: boolean
 *   },
 * }} Game
 */

/** @typedef {{ up: string, down: string, left: string, right: string }} PlayerControlKeys */

/**
 * @param {PlayerControlKeys & { onKeyPressUp: () => void, onKeyPressDown: () => void, onKeyPressLeft: () => void, onKeyPressRight: () => void }} options
 */
function onKeysPressed(options) {
  let pressedKey = "";
  const keys = [options.up, options.down, options.left, options.right];

  document.addEventListener("keydown", (event) => {
    // TODO: Cleanup this listener
    if (keys.includes(event.key)) {
      pressedKey = event.key;
    }
  });

  document.addEventListener("keyup", (event) => {
    // TODO: Cleanup this listener
    if (keys.includes(event.key)) {
      pressedKey = "";
    }
  });

  const onKeyPress = () => {
    if (pressedKey == options.up) {
      options?.onKeyPressUp();
    } else if (pressedKey == options.down) {
      options?.onKeyPressDown();
    } else if (pressedKey == options.left) {
      options?.onKeyPressLeft();
    } else if (pressedKey == options.right) {
      options?.onKeyPressRight();
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

  let has_started_running = false;

  /**
   * @param {Game} param0
   */
  function onMatchStart({ game, match, screen }) {
    if (game.is_running && has_started_running) {
      return;
    }
    page.element.querySelector("#loading-match").setLoading(false);

    const ball = new CanvasBall(
      canvas.VCW(game.ball.size.width),
      canvas.VCH(game.ball.size.height),
    )
      .pos(canvas.VCW(game.ball.position.x), canvas.VCH(game.ball.position.y))
      .translate(0, 0);

    const players = game.players.map(
      ({ placement, position, data, paddle: p }) => {
        const paddle = new CanvasPaddle(
          canvas.VCW(p.size.width),
          canvas.VCH(p.size.height),
        ).pos(canvas.VCW(position.x), canvas.VCH(position.y));

        switch (placement) {
          case 1:
            paddle.translate(0, 0);
            break;
          case 2:
            paddle.translate(0, 0);
            break;
          case 3:
            paddle.translate(0, 0);
            break;
          case 4:
            paddle.translate(0, 0);
            break;
        }

        return {
          paddle,
          data,
        };
      },
    );
    const game_player = game.players.find(
      (p) => p.data.id === session.player.id,
    );

    players.forEach((p) => canvas.addCanvasElement(p.paddle));
    canvas.addCanvasElement(ball);

    canvas.render();

    if (game_player.placement === 1 || game_player.placement === 2) {
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
    } else {
      onKeysPressed({
        left: "ArrowLeft",
        right: "ArrowRight",
        onKeyPressLeft() {
          MatchCommunication.Communication.send(
            MatchCommunication.Commands.KEY_PRESS,
            { direction: "LEFT" },
          );
        },
        onKeyPressRight() {
          MatchCommunication.Communication.send(
            MatchCommunication.Commands.KEY_PRESS,
            { direction: "RIGHT" },
          );
        },
      });
    }

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

      canvas.render();
    }

    MatchCommunication.Communication.addEventListener(
      MatchCommunication.Events.MATCH_UPDATE,
      onMatchUpdate,
    );
    has_started_running = true;
  }

  /**
   * @param {{tournament: import("../../../services/tournament.mjs").Tournament}} param0
   */
  function onPlayerNotifyTournamentEnd({ tournament }) {
    document.querySelector("#tournament-won-toast")?.open();
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
