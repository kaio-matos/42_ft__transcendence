import typing
from channels.generic.websocket import JsonWebsocketConsumer
from channels.http import async_to_sync

from pong.models import Player


class PlayerCommunicationConsumer(JsonWebsocketConsumer):
    player_id = None

    def connect(self):
        player = self.scope["user"]
        if not player.is_authenticated:
            return
        player = typing.cast(Player, player)
        self.player_id = str(player.public_id)
        self.accept()
        async_to_sync(self.channel_layer.group_add)(self.player_id, self.channel_name)

    def disconnect(self, code):
        if self.player_id:
            async_to_sync(self.channel_layer.group_discard)(
                self.player_id, self.channel_name
            )

    def send_event(self, event):
        self.send_json(event["event"])
