from enum import Enum
from pong.models import Player, Match


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
    paddle_velocity = 1
    ball_position = Position(50, 50)

    def __init__(self, match: Match, screen: GameScreen):
        self.match = match
        self.players = self.match.toDict()["players"]
        self.screen = screen
        self.game_players: dict[str, GamePlayer] = {}
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

    def handleKeyPress(self, player: Player, direction: GameDirection):
        position = self.game_players[str(player.public_id)].position
        position.y += self.paddle_velocity
        # TODO: calculate new player position...
        self.game_players[str(player.public_id)].position = position

    def toDict(self) -> dict:
        return {
            "match": self.match.toDict(),
            "screen": self.screen.toDict(),
            "game": {
                "players": [player.toDict() for player in self.game_players.values()],
                "ball": {"position": self.ball_position.toDict()},
            },
        }
