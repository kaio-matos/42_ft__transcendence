from channels.generic.websocket import AsyncJsonWebsocketConsumer


class PlayerEventsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_id, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content["command"] == "JOIN_TOURNAMENT":
            self.group_id = content["payload"]["tournament_id"]
            await self.channel_layer.group_add(self.group_id, self.channel_name)
            await self.send_response("onTournamentJoin", {"player": "Player X"})

    async def send_response(self, event: str, data: dict):
        await self.send_json({"event": event, "data": data})
