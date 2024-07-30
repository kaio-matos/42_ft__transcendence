import typing
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from pong.models import Player


class PlayerCommunicationConsumer(AsyncJsonWebsocketConsumer):
    player_id = None
    tournament_group_id = None

    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            return
        user = typing.cast(Player, user)
        self.player_id = str(user.public_id)
        await self.accept()
        await self.channel_layer.group_add(self.player_id, self.channel_name)
        await sync_to_async(user.save)()

    async def disconnect(self, code):
        user = typing.cast(Player, self.scope["user"])
        if self.player_id:
            await self.channel_layer.group_discard(self.player_id, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content["command"] == "COMMAND":
            pass

    async def send_event(self, event):
        await self.send_json(event["event"])

    pass
