from ft_transcendence.http.methods import GET, POST
from pong.controllers import PlayerController, TournamentController

urlpatterns = [
    GET("player", PlayerController.index),
    POST("player/create", PlayerController.create),
    GET("tournament", TournamentController.index),
    POST("tournament/create", TournamentController.create),
]
