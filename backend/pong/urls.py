from ft_transcendence.http.methods import GET, POST, PUT
from pong.controllers import PlayerController, TournamentController

urlpatterns = [
    GET("player", PlayerController.index),
    POST("player/create", PlayerController.create),
    PUT("player/update", PlayerController.update),
    POST("player/avatar", PlayerController.setAvatar),
    POST("player/login", PlayerController.login),
    GET("player/friends", PlayerController.getFriends),
    POST("player/friends/add", PlayerController.addFriend),
    GET("player/<slug:public_id>", PlayerController.get),
    #
    GET("tournament", TournamentController.index),
    GET("tournament/matchmaking", TournamentController.matchmaking),
    POST("tournament/create", TournamentController.create),
    GET("tournament/<slug:public_id>", TournamentController.get),
]
