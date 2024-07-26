from django.urls import re_path

from pong.communication.PlayerCommunication import PlayerCommunicationConsumer


websocket_urlpatterns = [
    re_path(r"ws/player/", PlayerCommunicationConsumer.as_asgi()),
]
