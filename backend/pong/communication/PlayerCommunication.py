from channels.generic.websocket import AsyncJsonWebsocketConsumer


class PlayerCommunicationConsumer(AsyncJsonWebsocketConsumer):
    user_id = None
    tournament_group_id = None

    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            return
        self.user_id = user.id
        await self.accept()
        await self.channel_layer.group_add(self.user_id, self.channel_name)

    async def disconnect(self, code):
        if self.user_id:
            await self.channel_layer.group_discard(self.user_id, self.channel_name)
        if self.tournament_group_id:
            await self.channel_layer.group_discard(
                self.tournament_group_id, self.channel_name
            )

    async def receive_json(self, content, **kwargs):
        if content["command"] == "COMMAND":
            pass

    pass

    async def send_response(self, event: str, data: dict):
        await self.send_json({"event": event, "data": data})
