from enum import Enum
from pong.models import Player, Match
import time
import threading
from asgiref.sync import async_to_sync


class Position:
    def __init__(self, x: float, y: float):
        if x < 0 or x > 100:
            raise ValueError(
                "Position.x is outside of boundary, Position coordinates should be between 0 and 100"
            )
        if y < 0 or y > 100:
            raise ValueError(
                "Position.y is outside of boundary, Position coordinates should be between 0 and 100"
            )
        self.x = x
        self.y = y

    def toDict(self) -> dict:
        return {"x": self.x, "y": self.y}


class GameDirection(Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"


class GamePlayerPlacement(Enum):
    FIRST = 1
    SECOND = 2
    THIRD = 3
    FOURTH = 4


class GameScreen:
    
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height

    def toDict(self) -> dict:
        return {"width": self.width, "height": self.height}


class GamePlayer:
    def __init__(self, placement: GamePlayerPlacement, position: Position, data: dict):
        self.placement = placement
        self.position = position
        self.data = data

    def toDict(self) -> dict:
        return {
            "placement": self.placement.value,
            "position": self.position.toDict(),
            "data": self.data,
        }


class Game:
    paddle_size = {"width": 1, "height": 15}
    paddle_velocity = 1
    ball_size = {"width": 0.8, "height": 0.8}
    ball_position = Position(50, 50)
    winner: None | Player = None
    ball_velocity = Position(1.5, 1.5)

    def __init__(self, match: Match, screen: GameScreen):
        self.match = match
        self.players = self.match.toDict()["players"]
        self.screen = screen
        self.game_players: dict[str, GamePlayer] = {}
        self.game_running = False
        self.channel_layer = None
        self.match_group_id = None
        self.ball_position = Position(50, 50)
        self.ball_velocity = Position(1.5, 1.5)
        self.reset()


    def reset(self):
        n = 1
        for player in self.players:
            id = player["id"]
            if n == 1:
                self.game_players[id] = GamePlayer(
                    GamePlayerPlacement.FIRST, Position(0, 50), player
                )  # Left Wall Player
            if n == 2:
                self.game_players[id] = GamePlayer(
                    GamePlayerPlacement.SECOND, Position(100, 50), player
                )  # Right Wall Player
            if n == 3:
                self.game_players[id] = GamePlayer(
                    GamePlayerPlacement.THIRD, Position(50, 0), player
                )  # Top Wall Player
            if n == 4:
                self.game_players[id] = GamePlayer(
                    GamePlayerPlacement.FOURTH, Position(50, 100), player
                )  # Bottom Wall Player
            n += 1
            
    def game_loop(self):
        while self.game_running:
            self.update_game_state()
            self.broadcast_game_state()
            time.sleep(0.016)  # Aproximadamente 60 FPS

    def start_game(self):
        if not self.game_running:
            self.game_running = True
            game_thread = threading.Thread(target=self.game_loop)
            game_thread.start()

    def broadcast_game_state(self):
        if self.channel_layer and self.match_group_id:
            state = self.toDict()
            async_to_sync(self.channel_layer.group_send)(
                self.match_group_id,
                {"type": "send_event", "event": {"command": "MATCH_UPDATE", "payload": state}}
            )
    
    def update_game_state(self):
        # Atualiza a posição da bola
        self.ball_position.x += self.ball_velocity.x
        self.ball_position.y += self.ball_velocity.y

        # Verifica colisões com as paredes
        if self.ball_position.x <= 0 or self.ball_position.x >= 100:
            self.ball_velocity.x *= -1
        if self.ball_position.y <= 0 or self.ball_position.y >= 100:
            self.ball_velocity.y *= -1

        # Verifica colisões com os paddles
        for player in self.game_players.values():
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
        position = self.game_players[str(player.public_id)].position
        if direction == GameDirection.UP:
            position.y -= self.paddle_velocity
            if position.y < self.paddle_size["height"] / 2:
                position.y = self.paddle_size["height"] / 2
        elif direction == GameDirection.DOWN:
            position.y += self.paddle_velocity
            if position.y > 100 - self.paddle_size["height"] / 2:
                position.y = 100 - self.paddle_size["height"] / 2
        self.game_players[str(player.public_id)].position = position

    def hasFinished(self):
        # self.winner = self.match.players.first()
        # return True
        return False

        
    def toDict(self) -> dict:
        return {
            "match": self.match.toDict(),
            "screen": self.screen.toDict(),
            "game": {
                "players": [player.toDict() for player in self.game_players.values()],
                "ball": {"size": self.ball_size,"position": self.ball_position.toDict()}, "paddle": {"size": self.paddle_size},
            },
        }
