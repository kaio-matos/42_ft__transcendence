from .constants import GamePlayerPlacement
from .position import Position


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

