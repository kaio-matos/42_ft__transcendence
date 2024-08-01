from ft_transcendence.http.methods import GET, POST, PUT
from pong.controllers import PlayerController, TournamentController

urlpatterns = [
    GET("player", PlayerController.index),
    POST("player/create", PlayerController.create),
    PUT("player/update", PlayerController.update),
    POST("player/login", PlayerController.login),
    GET("player/friends", PlayerController.getFriends),
    POST("player/friends/add", PlayerController.addFriend),
    #
    GET("tournament", TournamentController.index),
    POST("tournament/create", TournamentController.create),
    GET("tournament/<slug:public_id>", TournamentController.get),
]
