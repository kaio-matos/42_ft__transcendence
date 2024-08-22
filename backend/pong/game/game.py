import time
import threading
import random
import math
from asgiref.sync import async_to_sync
from .constants import GamePlayerPlacement, GameDirection, CANVAS_WIDTH, CANVAS_HEIGHT
from ft_transcendence.http import ws
from .position import Position
from .gamescreen import GameScreen
from .player import GamePlayer
from .ball import Ball
from .paddle import Paddle
from ..models import Match, Player


class Game:
    ball_size = {"width": 0.8, "height": 0.8}
    ball_speed = 1.3  # Velocidade constante da bola
    vertical_paddle_size = {"width": 1, "height": 20}
    horizontal_paddle_size = {"width": 20, "height": 1}

    def __init__(self, match: Match, screen: GameScreen):
        self.match = match
        self.screen = screen
        self.players = {}
        self.paddle_sizes = {}  # Para armazenar os tamanhos dos paddles
        self.ball = Ball()
        self.game_running = False
        self.channel_layer = None
        self.match_group_id = None
        self.winner = None
        self.last_paddle_hit = None  # Para rastrear o último paddle que bateu na bola
        self.reset()

    def reset(self):
        num_players = len(self.match.players.all())
        self.paddle_velocity = 1.5

        placements = [
            GamePlayerPlacement.LEFT,
            GamePlayerPlacement.RIGHT,
            GamePlayerPlacement.TOP,
            GamePlayerPlacement.BOTTOM,
        ]

        for i, player in enumerate(self.match.players.all()):
            placement = placements[i]
            paddle_size = self.get_paddle_size(placement)
            position = self.get_initial_position(placement, paddle_size)

            self.players[str(player.public_id)] = GamePlayer(
                placement, position, player.toDict()
            )
            self.paddle_sizes[str(player.public_id)] = (
                paddle_size  # Armazena o tamanho do paddle separadamente
            )

        self.reset_ball()

    def get_paddle_size(self, placement):
        if placement in [GamePlayerPlacement.LEFT, GamePlayerPlacement.RIGHT]:
            return self.vertical_paddle_size
        else:  # TOP ou BOTTOM
            return self.horizontal_paddle_size

    def get_initial_position(self, placement, paddle_size):
        if placement == GamePlayerPlacement.LEFT:
            return Position(0, CANVAS_HEIGHT / 2 - paddle_size["height"] / 2)
        elif placement == GamePlayerPlacement.RIGHT:
            return Position(
                CANVAS_WIDTH - paddle_size["width"],
                CANVAS_HEIGHT / 2 - paddle_size["height"] / 2,
            )
        elif placement == GamePlayerPlacement.TOP:
            return Position(CANVAS_WIDTH / 2 - paddle_size["width"] / 2, 0)
        elif placement == GamePlayerPlacement.BOTTOM:
            return Position(
                CANVAS_WIDTH / 2 - paddle_size["width"] / 2,
                CANVAS_HEIGHT - paddle_size["height"],
            )

    def reset_ball(self):
        self.ball.position = Position(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        angle = random.uniform(-math.pi / 4, math.pi / 4)
        self.ball.velocity = Position(
            self.ball_speed * math.cos(angle), self.ball_speed * math.sin(angle)
        )
        if random.choice([True, False]):
            self.ball.velocity.x *= -1
        self.last_paddle_hit = None

    def start_game(self):
        if not self.game_running:
            self.game_running = True
            game_thread = threading.Thread(target=self.game_loop)
            game_thread.start()

    def game_loop(self):
        while self.game_running:
            self.update_game_state()
            self.broadcast_game_state()
            time.sleep(0.016)

    def update_game_state(self):
        self.move_ball()
        self.check_collisions()

    def move_ball(self):
        new_x = self.ball.position.x + self.ball.velocity.x
        new_y = self.ball.position.y + self.ball.velocity.y

        # Verificar colisões com os paddles primeiro
        if self.check_collisions():
            return  # Se houve colisão com um paddle, não precisamos verificar as paredes

        # Verificar colisões com as paredes e resetar a bola se necessário
        if new_x <= 0 or new_x >= CANVAS_WIDTH - self.ball_size["width"]:
            self.reset_ball()
            return

        if new_y <= 0 or new_y >= CANVAS_HEIGHT - self.ball_size["height"]:
            self.reset_ball()
            return

        # Se não houve colisão, move a bola normalmente
        self.ball.position = Position(new_x, new_y)

    def check_collisions(self):
        for player_id, player in self.players.items():
            if self.check_paddle_collision(player_id, player):
                self.last_paddle_hit = player_id
                return True
        return False

    def check_paddle_collision(self, player_id: str, player: GamePlayer):
        paddle = Paddle(player.position)
        paddle_size = self.paddle_sizes[player_id]
        ball_next_x = self.ball.position.x + self.ball.velocity.x
        ball_next_y = self.ball.position.y + self.ball.velocity.y
        ball_right = ball_next_x + self.ball_size["width"]
        ball_left = ball_next_x
        ball_top = ball_next_y
        ball_bottom = ball_next_y + self.ball_size["height"]
        paddle_right = paddle.position.x + paddle_size["width"]
        paddle_left = paddle.position.x
        paddle_top = paddle.position.y
        paddle_bottom = paddle.position.y + paddle_size["height"]

        if (ball_right >= paddle_left and ball_left <= paddle_right) and (
            ball_bottom >= paddle_top and ball_top <= paddle_bottom
        ):

            # Calcula o ponto de colisão relativo ao centro do paddle
            if player.placement in [
                GamePlayerPlacement.LEFT,
                GamePlayerPlacement.RIGHT,
            ]:
                relative_intersect_y = (
                    paddle.position.y + paddle_size["height"] / 2
                ) - ball_next_y
                normalized_relative_intersect = relative_intersect_y / (
                    paddle_size["height"] / 2
                )
                bounce_angle = normalized_relative_intersect * (5 * math.pi / 12)
                direction = -1 if self.ball.velocity.x > 0 else 1
                self.ball.velocity.x = (
                    direction * self.ball_speed * math.cos(bounce_angle)
                )
                self.ball.velocity.y = self.ball_speed * -math.sin(bounce_angle)
            else:
                relative_intersect_x = (
                    paddle.position.x + paddle_size["width"] / 2
                ) - ball_next_x
                normalized_relative_intersect = relative_intersect_x / (
                    paddle_size["width"] / 2
                )
                bounce_angle = normalized_relative_intersect * (5 * math.pi / 12)
                direction = -1 if self.ball.velocity.y > 0 else 1
                self.ball.velocity.x = self.ball_speed * -math.sin(bounce_angle)
                self.ball.velocity.y = (
                    direction * self.ball_speed * math.cos(bounce_angle)
                )

            # Move a bola ligeiramente para fora do paddle para evitar colisões múltiplas
            # if player.placement == GamePlayerPlacement.LEFT:
            #     self.ball.position.x = paddle_right + 0.01
            # elif player.placement == GamePlayerPlacement.RIGHT:
            #     self.ball.position.x = paddle_left - self.ball_size["width"] - 0.01
            # elif player.placement == GamePlayerPlacement.TOP:
            #     self.ball.position.y = paddle_bottom + 0.01
            # elif player.placement == GamePlayerPlacement.BOTTOM:
            #     self.ball.position.y = paddle_top - self.ball_size["height"] - 0.01

            return True
        return False

    def handleKeyPress(self, player: Player, direction: GameDirection):
        game_player = self.players.get(str(player.public_id))
        if game_player:
            paddle_size = self.paddle_sizes[str(player.public_id)]
            if game_player.placement in [
                GamePlayerPlacement.LEFT,
                GamePlayerPlacement.RIGHT,
            ]:
                if direction == GameDirection.UP:
                    new_y = game_player.position.y - self.paddle_velocity
                    game_player.position.y = max(new_y, 0)
                elif direction == GameDirection.DOWN:
                    new_y = game_player.position.y + self.paddle_velocity
                    game_player.position.y = min(
                        new_y, CANVAS_HEIGHT - paddle_size["height"]
                    )
            else:
                if direction == GameDirection.LEFT:
                    new_x = game_player.position.x - self.paddle_velocity
                    game_player.position.x = max(new_x, 0)
                elif direction == GameDirection.RIGHT:
                    new_x = game_player.position.x + self.paddle_velocity
                    game_player.position.x = min(
                        new_x, CANVAS_WIDTH - paddle_size["width"]
                    )

    def broadcast_game_state(self):
        self.match.broadcast_match(
            ws.WSResponse(ws.WSEvents.MATCH_UPDATE, self.toDict()),
        )

    def hasFinished(self):
        # self.winner = self.match.players.first()
        # return True
        return False

    def toDict(self) -> dict:
        return {
            "match": self.match.toDict(),
            "screen": self.screen.toDict(),
            "game": {
                "players": [player.toDict() for player in self.players.values()],
                "ball": self.ball.toDict(),
                "is_running": self.game_running,
                "last_paddle_hit": self.last_paddle_hit,
            },
        }
