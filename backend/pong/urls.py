from ft_transcendence.http.methods import GET, POST
from pong.controllers import PlayerController, TournamentController

urlpatterns = [
    GET("player", PlayerController.index),
    POST("player/create", PlayerController.create),
    POST("player/login", PlayerController.login),
    GET("tournament", TournamentController.index),
    POST("tournament/create", TournamentController.create),
    GET("tournament/<slug:public_id>", TournamentController.get),
]
