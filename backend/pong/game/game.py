import time
import threading
import random
import math
from asgiref.sync import async_to_sync
from .constants import GamePlayerPlacement, GameDirection, CANVAS_WIDTH, CANVAS_HEIGHT
from ft_transcendence.http import ws
from .models import GameScreen, Position
from .player import GamePlayer
from .ball import Ball
from .paddle import Paddle
from ..models import Match, Player

class Game:
    ball_size = {"width": 0.8, "height": 0.8}
    ball_speed = 1.3 # Velocidade constante da bola

    def __init__(self, match: Match, screen: GameScreen):
        self.match = match
        self.screen = screen
        self.players = {}
        self.ball = Ball()
        self.game_running = False
        self.channel_layer = None
        self.match_group_id = None
        self.winner = None
        self.reset()

    def reset(self):
        num_players = len(self.match.players.all())
        self.paddle_size = self.calculate_paddle_size(num_players)
        self.paddle_velocity = 1.5  # Aumentado para movimento mais responsivo

        for i, player in enumerate(self.match.players.all()):
            if i == 0:
                placement = GamePlayerPlacement.FIRST_LEFT
                position = Position(0, CANVAS_HEIGHT / 2 - self.paddle_size["height"] / 2)
            elif i == 1:
                placement = GamePlayerPlacement.FIRST_RIGHT
                position = Position(CANVAS_WIDTH - self.paddle_size["width"], CANVAS_HEIGHT / 2 - self.paddle_size["height"] / 2)
            elif i == 2:
                placement = GamePlayerPlacement.SECOND_LEFT
                position = Position(0, CANVAS_HEIGHT / 2 - self.paddle_size["height"] / 2)
            elif i == 3:
                placement = GamePlayerPlacement.SECOND_RIGHT
                position = Position(CANVAS_WIDTH - self.paddle_size["width"], CANVAS_HEIGHT / 2 - self.paddle_size["height"] / 2)
            
            self.players[str(player.public_id)] = GamePlayer(placement, position, player.toDict())
        
        self.reset_ball()

    def calculate_paddle_size(self, num_players):
        if num_players == 2:
            return {"width": 1, "height": 20}
        else:  # 4 jogadores
            return {"width": 1, "height": 15}

    def reset_ball(self):
        self.ball.position = Position(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        angle = random.uniform(-math.pi/4, math.pi/4)
        self.ball.velocity = Position(
            self.ball_speed * math.cos(angle),
            self.ball_speed * math.sin(angle)
        )
        if random.choice([True, False]):
            self.ball.velocity.x *= -1

    def start_game(self):
        if not self.game_running:
            self.game_running = True
            game_thread = threading.Thread(target=self.game_loop)
            game_thread.start()

    def game_loop(self):
        while self.game_running:
            self.update_game_state()
            self.broadcast_game_state()
            time.sleep(0.016)  # Aproximadamente 60 FPS

    def update_game_state(self):
        self.move_ball()
        self.check_collisions()

    def move_ball(self):
        new_x = self.ball.position.x + self.ball.velocity.x
        new_y = self.ball.position.y + self.ball.velocity.y

        # Verificar e corrigir colisões com as paredes superior e inferior
        if new_y <= 0:
            new_y = 0
            self.ball.velocity.y = abs(self.ball.velocity.y)
        elif new_y >= CANVAS_HEIGHT - self.ball_size["height"]:
            new_y = CANVAS_HEIGHT - self.ball_size["height"]
            self.ball.velocity.y = -abs(self.ball.velocity.y)

        self.ball.position = Position(new_x, new_y)

    def check_collisions(self):
        # Verifica colisões com os paddles
        for player in self.players.values():
            if self.check_paddle_collision(player):
                break

        # Verifica se a bola saiu pelos lados (ponto)
        if self.ball.position.x <= 0 or self.ball.position.x >= CANVAS_WIDTH:
            self.reset_ball()

    def check_paddle_collision(self, player: GamePlayer):
        paddle = Paddle(player.position)
        ball_right = self.ball.position.x + self.ball_size["width"]
        ball_left = self.ball.position.x
        paddle_right = paddle.position.x + self.paddle_size["width"]
        paddle_left = paddle.position.x

        if ((ball_right >= paddle_left and ball_left <= paddle_right) and
            (self.ball.position.y + self.ball_size["height"] >= paddle.position.y) and
            (self.ball.position.y <= paddle.position.y + self.paddle_size["height"])):
            
            # Calcula o ponto de colisão relativo ao centro do paddle
            relative_intersect_y = (paddle.position.y + self.paddle_size["height"] / 2) - self.ball.position.y
            
            # Normaliza o ponto de interseção
            normalized_relative_intersect_y = relative_intersect_y / (self.paddle_size["height"] / 2)
            
            # Calcula o ângulo de rebote (máximo de 75 graus)
            bounce_angle = normalized_relative_intersect_y * (5 * math.pi / 12)  # 75 graus em radianos
            
            # Determina a direção da bola (esquerda ou direita)
            direction = -1 if self.ball.velocity.x > 0 else 1
            
            # Atualiza a velocidade da bola
            self.ball.velocity.x = direction * self.ball_speed * math.cos(bounce_angle)
            self.ball.velocity.y = self.ball_speed * -math.sin(bounce_angle)
            
            # Move a bola ligeiramente para fora do paddle para evitar colisões múltiplas
            if direction == 1:
                self.ball.position.x = paddle_right + 0.01
            else:
                self.ball.position.x = paddle_left - self.ball_size["width"] - 0.01
            
            return True
        return False

    def handleKeyPress(self, player: Player, direction: GameDirection):
        game_player = self.players.get(str(player.public_id))
        if game_player:
            if direction == GameDirection.UP:
                new_y = game_player.position.y - self.paddle_velocity
                game_player.position.y = max(new_y, 0)
            elif direction == GameDirection.DOWN:
                new_y = game_player.position.y + self.paddle_velocity
                game_player.position.y = min(new_y, CANVAS_HEIGHT - self.paddle_size["height"])

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
                "paddle": {"size": self.paddle_size},
                "is_running": self.game_running,
            },
        }

