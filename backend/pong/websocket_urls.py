from django.urls import re_path

from pong.events.PlayerEventsConsumer import PlayerEventsConsumer


websocket_urls = [
    re_path(r"events/player/$", PlayerEventsConsumer.as_asgi()),
]
