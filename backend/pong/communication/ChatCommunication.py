import typing
from channels.generic.websocket import JsonWebsocketConsumer
from channels.http import async_to_sync
from django.core.exceptions import ValidationError

from ft_transcendence.http import ws
from pong.forms.ChatForms import ChatSendMessageForm
from pong.models import Chat, Message, Player
from django.utils.translation import gettext as _


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

        if content["command"] == ws.WSCommands.CHAT_JOIN.value:
            async_to_sync(self.channel_layer.group_send)(
                self.chat_channel_id,
                ws.WSResponse(ws.WSEvents.CHAT_JOIN, self.chat.toDict()),
            )
            return

        if content["command"] == ws.WSCommands.CHAT_SEND_MESSAGE.value:
            if self.chat in player.blocked_chats.all():
                return

            form = ChatSendMessageForm(content["payload"])

            if not form.is_valid():
                self.error(ws.WSCommands.CHAT_SEND_MESSAGE.value, form.errors.as_data())
                return

            sender = Player.objects.get(public_id=form.data.get("sender_id"))

            if sender is None:
                self.error(
                    ws.WSCommands.CHAT_SEND_MESSAGE.value,
                    {"_errors": _("O remetente não foi encontrado")},
                )
                return
            message = Message(sender=sender, text=content["payload"]["text"])
            message.save()
            self.chat.messages.add(message)

            async_to_sync(self.channel_layer.group_send)(
                self.chat_channel_id,
                ws.WSResponse(ws.WSEvents.CHAT_MESSAGE, message.toDict()),
            )

    def error(self, command, error):
        self.send_json(
            ws.WSResponse(
                ws.WSEvents.ERROR,
                {
                    "caused_by_command": command,
                    "error": ValidationError(error).message_dict,
                },
            )
        )

    def send_event(self, event):
        self.send_json(event["event"])
