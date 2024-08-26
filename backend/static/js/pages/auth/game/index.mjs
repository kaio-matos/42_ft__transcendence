import { MatchCommunication } from "../../../communication/match.mjs";
import { PlayerCommunication } from "../../../communication/player.mjs";
import { Component } from "../../../components/component.mjs";
import { CanvasBall } from "../../../components/PongCanvas/canvas-components/CanvasBall.mjs";
import { CanvasPaddle } from "../../../components/PongCanvas/canvas-components/CanvasPaddle.mjs";
import { PongCanvas } from "../../../components/PongCanvas/PongCanvas.mjs";
import { router } from "../../../index.mjs";
import { MatchType } from "../../../services/match.mjs";
import { session } from "../../../state/session.mjs";
import { NotFound } from "../../not-found/index.mjs";

/**
 * @typedef {{
 *   match: import("../../../services/match.mjs").Match,
 *   game: {
 *      players: {
 *        placement: number,
 *        position: { x: number, y: number },
 *        id: string,
 *        name: string,
 *        is_local_player: boolean,
 *        avatar: string
 *        paddle: { size: { width: number, height: number } },
 *        score: number
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

function setupKeyboardListenersFor(player, keys) {
  if (player.placement === 1 || player.placement === 2) {
    onKeysPressed({
      up: keys.up,
      down: keys.down,
      onKeyPressUp() {
        MatchCommunication.Communication.send(
          MatchCommunication.Commands.KEY_PRESS,
          { direction: "UP", id: player.id },
        );
      },
      onKeyPressDown() {
        MatchCommunication.Communication.send(
          MatchCommunication.Commands.KEY_PRESS,
          { direction: "DOWN", id: player.id },
        );
      },
    });
  } else {
    onKeysPressed({
      left: keys.left,
      right: keys.right,
      onKeyPressLeft() {
        MatchCommunication.Communication.send(
          MatchCommunication.Commands.KEY_PRESS,
          { direction: "LEFT", id: player.id },
        );
      },
      onKeyPressRight() {
        MatchCommunication.Communication.send(
          MatchCommunication.Commands.KEY_PRESS,
          { direction: "RIGHT", id: player.id },
        );
      },
    });
  }
}

/** @type {import("../../../router/router.mjs").Page} */
export const Game = ({ params }) => {
  const match_id = params.match;

  if (!match_id) {
    router.navigate("/not-found");
    return NotFound({ params });
  }

  const page = new Component("div").class("container mx-auto");
  page.element.innerHTML = `
      <t-loading id="loading-match" loading="true">
        <section class="d-flex flex-column position-relative">
          <h1 id="match-name-title" class="text-center"></h1>
          <span id="ping" class="position-absolute top-0 end-0"></span>
          <section class="mx-auto border border-secondary rounded p-2">
            <div class="player-data" data-placement="3"></div>
            <div class="gap-2" style="display: grid; grid-template-columns: 7rem 1fr 7rem">
              <div class="player-data" data-placement="1"></div>
              <t-pong-canvas id="pong-canvas" class="border border-secondary rounded"></t-pong-canvas>
              <div class="player-data" data-placement="2"></div>
            </div>
            <div class="player-data" data-placement="4"></div>
          </section>
        </section>
      </t-loading>
  `;

  /** @type {PongCanvas} */
  const canvas = page.element.querySelector("#pong-canvas");

  MatchCommunication.Communication.setPath("/ws/match/" + match_id);
  MatchCommunication.Communication.connect(() => {
    MatchCommunication.Communication.send(
      MatchCommunication.Commands.MATCH_JOIN, // We tell the server that we want to begin the match
      undefined,
    );
  });
  MatchCommunication.Communication.socket.onclose = () => {
    router.navigate("/not-found");
  };

  MatchCommunication.Communication.addEventListener(
    MatchCommunication.Events.MATCH_START, // and then as soon as the server tell us that we can start we setup the canvas and stop loading
    onMatchStart,
  );

  let has_started_running = false;

  let has_rendered_players = false;
  function renderPlayersData(players) {
    const player_data_containers =
      page.element.querySelectorAll(".player-data");

    for (const container of player_data_containers) {
      const placement = container.dataset.placement;
      if (!placement) continue;

      const player = players.find((p) => p.placement === Number(placement));
      if (!player) continue;
      const c = new Component(container);

      if (has_rendered_players) {
        const score = c.element.querySelector(".score");
        score.textContent = player.score ? player.score : "0";
        continue;
      }

      c.clear();
      c.class("d-flex flex-column").children([
        new Component("img")
          .attributes({
            src: player.avatar,
          })
          .styles({ width: "80px", aspectRatio: 1 })
          .class("object-fit-cover rounded-circle mx-auto"),
        new Component("strong", { textContent: player.name }).class(
          "fs-4 text-center text-truncate",
        ),
        new Component("strong", {
          textContent: player.score ? player.score : "0",
        }).class("score fs-3 text-center"),
      ]);
    }
    has_rendered_players = true;
  }

  /**
   * @param {Game} param0
   */
  function onMatchStart({ game, match, screen }) {
    if (game.is_running && has_started_running) {
      return;
    }
    page.element.querySelector("#match-name-title").textContent = match.name;
    page.element.querySelector("#loading-match").setLoading(false);

    const ball = new CanvasBall(
      canvas.VCW(game.ball.size.width),
      canvas.VCH(game.ball.size.height),
    )
      .pos(canvas.VCW(game.ball.position.x), canvas.VCH(game.ball.position.y))
      .translate(0, 0);

    const players = game.players.map(({ position, paddle: p }) => {
      const paddle = new CanvasPaddle(
        canvas.VCW(p.size.width),
        canvas.VCH(p.size.height),
      ).pos(canvas.VCW(position.x), canvas.VCH(position.y));

      return { paddle };
    });

    players.forEach((p) => canvas.addCanvasElement(p.paddle));
    canvas.addCanvasElement(ball);

    canvas.render();

    renderPlayersData(game.players);

    game.players.forEach((p) => {
      if (p.is_local_player)
        setupKeyboardListenersFor(p, {
          up: "w",
          down: "s",
          left: "a",
          right: "d",
        });
      else if ((p.id = session.player.id))
        setupKeyboardListenersFor(p, {
          up: "ArrowUp",
          down: "ArrowDown",
          left: "ArrowLeft",
          right: "ArrowRight",
        });
    });

    let start = 0;
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

      setTimeout(() => {
        page.element.querySelector("#ping").textContent =
          new Date().getMilliseconds() - start + " ms";
        renderPlayersData(game.players);
        start = new Date().getMilliseconds();
      });
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

  MatchCommunication.Communication.addEventListener(
    MatchCommunication.Events.MATCH_END,
    ({ match }) => {
      if (match?.winner?.id === session.player.id) {
        document.querySelector("#match-won-toast").open();
      }
      router.navigate("/auth");
    },
  );

  router.addEventListener(
    "onBeforePageChange",
    PlayerCommunication.Communication.addEventListener(
      PlayerCommunication.Events.PLAYER_NOTIFY_TOURNAMENT_END,
      onPlayerNotifyTournamentEnd,
    ),
  );

  router.addEventListener("onBeforePageChange", () => {
    MatchCommunication.Communication.disconnect();
  });

  return page;
};
