from ft_transcendence.http.methods import GET, POST
from pong.controllers import PlayerController

from . import views

urlpatterns = [
    GET("player", PlayerController.index),
    POST("player/create", PlayerController.create),
    GET("", views.index),
]
