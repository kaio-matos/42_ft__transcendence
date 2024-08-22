from .constants import GamePlayerPlacement
from .position import Position


class GamePlayer:
    def __init__(self, placement: GamePlayerPlacement, position: Position, data: dict):
        self.placement = placement
        self.position = position
        self.data = data

    def toDict(self) -> dict:
        paddle_size = {}
        if self.placement in [GamePlayerPlacement.LEFT, GamePlayerPlacement.RIGHT]:
            paddle_size = {"width": 1, "height": 20}
        else:
            paddle_size = {"width": 20, "height": 1}

        return {
            "placement": self.placement.value,
            "position": self.position.toDict(),
            "data": self.data,
            "paddle": {"size": paddle_size},
        }
