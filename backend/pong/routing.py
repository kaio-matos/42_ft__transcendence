from django.urls import path, re_path

from pong.communication.ChatCommunication import ChatCommunicationConsumer
from pong.communication.PlayerCommunication import PlayerCommunicationConsumer
from pong.communication.TournamentCommunication import TournamentCommunicationConsumer


websocket_urlpatterns = [
    re_path(r"ws/player/", PlayerCommunicationConsumer.as_asgi()),
    path(r"ws/chat/<slug:chat_id>", ChatCommunicationConsumer.as_asgi()),
    path(
        r"ws/tournament/<slug:tournament_id>", TournamentCommunicationConsumer.as_asgi()
    ),
]
