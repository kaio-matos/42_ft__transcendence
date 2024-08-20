import time
import threading
from asgiref.sync import async_to_sync
from .constants import GamePlayerPlacement, GameDirection, CANVAS_WIDTH, CANVAS_HEIGHT
from ft_transcendence.http import ws
from .models import GameScreen, Position
from .player import GamePlayer
from .ball import Ball
from .paddle import Paddle
from ..models import Match, Player

class Game:
    paddle_size = {"width": 1, "height": 15}
    paddle_velocity = 1
    ball_size = {"width": 0.8, "height": 0.8}
    ball_position = Position(50, 50)
    winner: None | Player = None
    ball_velocity = Position(1.5, 1.5)

    def __init__(self, match: Match, screen: GameScreen):
        self.match = match
        self.screen = screen
        self.players = {}
        self.ball = Ball()
        self.game_running = False
        self.channel_layer = None
        self.match_group_id = None
        self.reset()

    def reset(self):
        for i, player in enumerate(self.match.players.all()):
            if i == 0:
                placement = GamePlayerPlacement.FIRST_LEFT
                position = Position(0, CANVAS_HEIGHT / 4)
            elif i == 1:
                placement = GamePlayerPlacement.FIRST_RIGHT
                position = Position(CANVAS_WIDTH, CANVAS_HEIGHT / 4)
            elif i == 2:
                placement = GamePlayerPlacement.SECOND_LEFT
                position = Position(0, 3 * CANVAS_HEIGHT / 4)
            elif i == 3:
                placement = GamePlayerPlacement.SECOND_RIGHT
                position = Position(CANVAS_WIDTH, 3 * CANVAS_HEIGHT / 4)
            
            self.players[str(player.public_id)] = GamePlayer(placement, position, player.toDict())
        
        self.ball.reset()

    def update_game_state(self):
        self.ball.update_position()
        self.check_collisions()

    def check_collisions(self):
        for player in self.players.values():
            if self.check_paddle_collision(player):
                self.ball.velocity.x *= -1
                break

    def check_paddle_collision(self, player: GamePlayer):
        paddle = Paddle(player.position)
        if (self.ball.position.x <= paddle.position.x + paddle.size["width"] and
            self.ball.position.x >= paddle.position.x and
            self.ball.position.y >= paddle.position.y and
            self.ball.position.y <= paddle.position.y + paddle.size["height"]):
            return True
        return False

    def handleKeyPress(self, player: Player, direction: GameDirection):
        game_player = self.players.get(player.id)
        if game_player:
            paddle = Paddle(game_player.position)
            if direction == GameDirection.UP:
                paddle.move(-1)
            elif direction == GameDirection.DOWN:
                paddle.move(1)
            game_player.position = paddle.position

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

    def broadcast_game_state(self):
        if self.channel_layer and self.match_group_id:
            state = self.toDict()
            self.match.broadcast_match(
                    ws.WSResponse(ws.WSEvents.MATCH_UPDATE, self.toDict()),
                )

        # Verifica colisões com as paredes
        if self.ball_position.x <= 0 or self.ball_position.x >= 100:
            self.ball_velocity.x *= -1
        if self.ball_position.y <= 0 or self.ball_position.y >= 100:
            self.ball_velocity.y *= -1

        # Verifica colisões com os paddles
        for player in self.players.values():
            if self.check_paddle_collision(player):
                self.ball_velocity.x *= -1
                break

    def check_paddle_collision(self, player: GamePlayer):
        paddle_x = player.position.x
        paddle_y = player.position.y
        paddle_width = self.paddle_size["width"]
        paddle_height = self.paddle_size["height"]

        if (self.ball_position.x >= paddle_x - self.ball_size["width"] and
            self.ball_position.x <= paddle_x + paddle_width and
            self.ball_position.y >= paddle_y - self.ball_size["height"] and
            self.ball_position.y <= paddle_y + paddle_height):
            return True
        return False

    def handleKeyPress(self, player: Player, direction: GameDirection):
        position = self.players[str(player.public_id)].position
        if direction == GameDirection.UP:
            position.y -= self.paddle_velocity
            if position.y < self.paddle_size["height"] / 2:
                position.y = self.paddle_size["height"] / 2
        elif direction == GameDirection.DOWN:
            position.y += self.paddle_velocity
            if position.y > 100 - self.paddle_size["height"] / 2:
                position.y = 100 - self.paddle_size["height"] / 2
        self.players[str(player.public_id)].position = position

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
                "paddle": {"size": self.paddle_size}
    
            },
        }