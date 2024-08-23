import typing
from channels.generic.websocket import JsonWebsocketConsumer
from channels.http import async_to_sync
from django.utils import timezone
from datetime import timedelta

from ft_transcendence.http import ws
from pong.game.game import Game, GameDirection, GameScreen
from pong.models import Player, Match


class PlayerCommunicationConsumer(JsonWebsocketConsumer):
    player_id = None

    def connect(self):
        player = self.scope["user"]
        if not player.is_authenticated:
            self.close()
            return
        player = typing.cast(Player, player)
        self.player_id = str(player.public_id)
        self.accept()
        async_to_sync(self.channel_layer.group_add)(self.player_id, self.channel_name)
        player.set_activity_status(Player.ActivityStatus.ONLINE)
        player.last_login = timezone.now()  # Inicializa last_login na conexão
        player.save()

    def disconnect(self, code):
        if self.player_id:
            async_to_sync(self.channel_layer.group_discard)(
                self.player_id, self.channel_name
            )
            player = Player.objects.get(public_id=self.player_id)
            player.set_activity_status(Player.ActivityStatus.OFFLINE)

    def send_event(self, event):
        self.send_json(event["event"])

    def receive_json(self, content):
        event = content.get('event')
        if event == ws.WSEvents.CHECK_PLAYER_STATUS.value:
            self.handle_pong_event()

    def send_ping(self):
        """
        Send a ping message to the player to check their status.
        """
        self.send_json(ws.WSResponse(ws.WSEvents.CHECK_PLAYER_STATUS, {}))

    def handle_pong_event(self):
        """
        Handle pong response from the player, marking them as online.
        """
        player = Player.objects.get(public_id=self.player_id)
        player.set_activity_status(Player.ActivityStatus.ONLINE)
        player.last_login = timezone.now()
        player.save()

    def check_player_status(self):
        """
        Check if the player has responded to the last ping.
        """
        player = Player.objects.get(public_id=self.player_id)
        if player.is_ping_timeout():
            player.set_activity_status(Player.ActivityStatus.OFFLINE)
