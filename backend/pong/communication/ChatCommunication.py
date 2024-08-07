import typing
from channels.generic.websocket import JsonWebsocketConsumer
from channels.http import async_to_sync

from ft_transcendence.http import ws
from pong.models import Chat, Message, Player


class ChatCommunicationConsumer(JsonWebsocketConsumer):
    chat_channel_id: str
    chat: Chat

    def connect(self):
        player = self.scope["user"]
        if not player.is_authenticated:
            return
        player = typing.cast(Player, player)
        self.chat_channel_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat = Chat.objects.get(public_id=self.chat_channel_id)

        if self.chat is None:
            return

        self.accept()
        async_to_sync(self.channel_layer.group_add)(
            self.chat_channel_id, self.channel_name
        )

    def disconnect(self, code):
        if self.chat_channel_id:
            async_to_sync(self.channel_layer.group_discard)(
                self.chat_channel_id, self.channel_name
            )

    def receive_json(self, content, **kwargs):
        player = typing.cast(Player, self.scope["user"])
        match content["command"]:
            case ws.WSCommands.CHAT_JOIN.value:
                async_to_sync(self.channel_layer.group_send)(
                    self.chat_channel_id,
                    ws.WSResponse(ws.WSEvents.CHAT_JOIN, self.chat.toDict()),
                )

            case ws.WSCommands.CHAT_SEND_MESSAGE.value:
                if self.chat in player.blocked_chats.all():
                    return

                # TODO: Validate object
                sender = Player.objects.get(public_id=content["payload"]["sender_id"])
                # TODO: Handle this case
                if sender is None:
                    raise ValueError("Sender does not exist")
                message = Message(sender=sender, text=content["payload"]["text"])
                message.save()
                self.chat.messages.add(message)

                async_to_sync(self.channel_layer.group_send)(
                    self.chat_channel_id,
                    ws.WSResponse(ws.WSEvents.CHAT_MESSAGE, message.toDict()),
                )

    def send_event(self, event):
        self.send_json(event["event"])

    pass
