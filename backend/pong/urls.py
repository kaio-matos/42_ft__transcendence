from ft_transcendence.http.methods import GET, POST
from pong.controllers import PlayerController

urlpatterns = [
    GET("player", PlayerController.index),
    POST("player/create", PlayerController.create),
]
