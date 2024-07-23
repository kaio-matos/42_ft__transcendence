from django.urls import re_path

from pong.events.PlayerEventsConsumer import PlayerEventsConsumer


websocket_urlpatterns = [
    re_path(r"events/player/", PlayerEventsConsumer.as_asgi()),
]
