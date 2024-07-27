from channels.generic.websocket import AsyncJsonWebsocketConsumer


class PlayerCommunicationConsumer(AsyncJsonWebsocketConsumer):
    player_id = None
    tournament_group_id = None

    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            return
        self.player_id = user.public_id
        await self.accept()
        await self.channel_layer.group_add(self.player_id, self.channel_name)

    async def disconnect(self, code):
        if self.player_id:
            await self.channel_layer.group_discard(self.player_id, self.channel_name)
        if self.tournament_group_id:
            await self.channel_layer.group_discard(
                self.tournament_group_id, self.channel_name
            )

    async def receive_json(self, content, **kwargs):
        if content["command"] == "COMMAND":
            pass

    pass
