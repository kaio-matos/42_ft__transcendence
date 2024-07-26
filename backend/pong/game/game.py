from enum import Enum
from pong.models import Player, Tournament


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
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"


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
    def __init__(self, placement: GamePlayerPlacement, position: Position):
        self.placement = placement
        self.position = position

    def toDict(self) -> dict:
        return {"placement": self.placement, "position": self.position.toDict()}


class Game:
    paddle_velocity = 1
    ball_position = Position(50, 50)

    def __init__(self, tournament: Tournament, screen: GameScreen):
        self.tournament = tournament
        self.players = self.tournament.toDict()["players"]
        self.screen = screen
        self.game_players: dict[str, GamePlayer] = {}
        self.reset()

    def reset(self):
        n = 1
        for key in self.game_players:
            if n == 1:
                self.game_players[key].placement = GamePlayerPlacement.FIRST
                self.game_players[key].position = Position(0, 50)  # Left Wall Player
            if n == 2:
                self.game_players[key].placement = GamePlayerPlacement.SECOND
                self.game_players[key].position = Position(100, 50)  # Right Wall Player
            if n == 3:
                self.game_players[key].placement = GamePlayerPlacement.THIRD
                self.game_players[key].position = Position(50, 0)  # Top Wall Player
            if n == 4:
                self.game_players[key].placement = GamePlayerPlacement.FOURTH
                self.game_players[key].position = Position(
                    50, 100
                )  # Bottom Wall Player
            n += 1

    def handleKeyPress(self, player: Player, direction: GameDirection):
        position = self.game_players[player.id].position
        position.y += self.paddle_velocity
        # TODO: calculate new player position...
        self.game_players[player.id].position = position

    def toDict(self) -> dict:
        return {
            "tournament": self.tournament.toDict(),
            "screen": self.screen.toDict(),
            "game": {
                "players": [player.toDict() for player in self.game_players.values()],
                "ball": {"position": self.ball_position.toDict()},
            },
        }
