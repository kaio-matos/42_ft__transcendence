import typing
from channels.generic.websocket import JsonWebsocketConsumer
from channels.http import async_to_sync
from django.core.exceptions import ValidationError

from ft_transcendence.http import ws
from pong.forms.ChatForms import ChatSendMessageForm
from pong.models import Chat, Message, Player
from django.utils.translation import gettext as _

from pong.resources.ChatResource import ChatResource


class ChatCommunicationConsumer(JsonWebsocketConsumer):
    chat: Chat

    def connect(self):
        player = self.scope["user"]
        if not player.is_authenticated:
            return
        player = typing.cast(Player, player)
        chat_channel_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat = Chat.objects.get(public_id=chat_channel_id)

        if self.chat is None:
            return

        self.accept()
        async_to_sync(self.channel_layer.group_add)(
            self.create_channel_name(player.public_id, chat_channel_id),
            self.channel_name,
        )

    def disconnect(self, code):
        player = typing.cast(Player, self.scope["user"])
        if self.chat:
            async_to_sync(self.channel_layer.group_discard)(
                self.create_channel_name(player.public_id, self.chat.public_id),
                self.channel_name,
            )

    def receive_json(self, content, **kwargs):
        player = typing.cast(Player, self.scope["user"])
        if not player.can_send_messages_to(self.chat):
            return

        if content["command"] == ws.WSCommands.CHAT_JOIN.value:
            async_to_sync(self.channel_layer.group_send)(
                self.create_channel_name(player.public_id, self.chat.public_id),
                ws.WSResponse(ws.WSEvents.CHAT_JOIN, ChatResource(self.chat, player)),
            )
            return

        if content["command"] == ws.WSCommands.CHAT_SEND_MESSAGE.value:
            form = ChatSendMessageForm(content["payload"])

            if not form.is_valid():
                self.error(
                    ws.WSCommands.CHAT_SEND_MESSAGE.value,
                    form.errors.as_data(),
                    content["timestamp"],
                )
                return

            sender = Player.objects.get(public_id=form.data.get("sender_id"))

            if sender is None:
                self.error(
                    ws.WSCommands.CHAT_SEND_MESSAGE.value,
                    {"_errors": _("O remetente não foi encontrado")},
                    content["timestamp"],
                )
                return

            participants = self.chat.players.all()

            message = Message(sender=sender, text=content["payload"]["text"])
            message.save()
            self.chat.messages.add(message)

            for participant in participants:
                if not participant.can_receive_messages_from(self.chat):
                    return

                async_to_sync(self.channel_layer.group_send)(
                    self.create_channel_name(
                        participant.public_id, self.chat.public_id
                    ),
                    ws.WSResponse(ws.WSEvents.CHAT_MESSAGE, message.toDict()),
                )

    def error(self, command, error, timestamp):
        self.send_event(
            ws.WSResponse(
                ws.WSEvents.ERROR,
                {
                    "caused_by_command": command,
                    "timestamp": timestamp,  # the timestamp is used by the frontend to identify which function call caused the error, so we just repass it
                    "error": ValidationError(error).message_dict,
                },
            )
        )

    def send_event(self, event):
        self.send_json(event["event"])

    def create_channel_name(self, player_id, chat_id):
        return str(chat_id) + "__" + str(player_id)
