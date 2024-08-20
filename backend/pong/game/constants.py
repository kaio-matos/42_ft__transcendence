from enum import Enum

class GamePlayerPlacement(Enum):
    FIRST_LEFT = 1
    FIRST_RIGHT = 2
    SECOND_LEFT = 3
    SECOND_RIGHT = 4

class GameDirection(Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

PADDLE_SIZE = {"width": 1, "height": 7.5}
BALL_SIZE = {"width": 0.8, "height": 0.8}
PADDLE_VELOCITY = 1
INITIAL_BALL_VELOCITY = 1.5

CANVAS_WIDTH = 100
CANVAS_HEIGHT = 100