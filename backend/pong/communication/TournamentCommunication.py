import typing
from channels.generic.websocket import JsonWebsocketConsumer
from channels.http import async_to_sync

from ft_transcendence.http import ws
from pong.game.game import Game, GameDirection, GameScreen
from pong.models import Player, Tournament

# TODO: We MUST find some way to do this without creating this variable, and probably without saving into the postgresql
games: dict[str, Game] = {}


class TournamentCommunicationConsumer(JsonWebsocketConsumer):
    tournament_group_id: str
    tournament: Tournament

    def connect(self):
        player = self.scope["user"]
        if not player.is_authenticated:
            return
        player = typing.cast(Player, player)
        self.tournament_group_id = self.scope["url_route"]["kwargs"]["tournament_id"]
        self.tournament = Tournament.objects.get(public_id=self.tournament_group_id)
        self.accept()
        async_to_sync(self.channel_layer.group_add)(
            self.tournament_group_id, self.channel_name
        )

    def disconnect(self, code):
        if self.tournament_group_id:
            async_to_sync(self.channel_layer.group_discard)(
                self.tournament_group_id, self.channel_name
            )

    def receive_json(self, content, **kwargs):
        player = typing.cast(Player, self.scope["user"])
        match content["command"]:
            case ws.WSCommands.JOIN_TOURNAMENT.value:
                screen = GameScreen(
                    content["payload"]["screen"]["width"],
                    content["payload"]["screen"]["height"],
                )
                games[self.tournament_group_id] = Game(self.tournament, screen)
                game = games[self.tournament_group_id]

                # TODO: This code is assuming both players are ready to begint the tournament, we should add some way to check if both are ready
                async_to_sync(self.channel_layer.group_send)(
                    self.tournament_group_id,
                    ws.WSResponse(ws.WSEvents.TOURNAMENT_START, game.toDict()),
                )

            case ws.WSCommands.KEY_PRESS.value:
                if self.tournament is None:
                    return
                game = games[self.tournament_group_id]
                if game is None:
                    return
                direction = content["payload"]["direction"]
                game.handleKeyPress(player, direction)

                async_to_sync(self.channel_layer.group_send)(
                    self.tournament_group_id,
                    ws.WSResponse(ws.WSEvents.TOURNAMENT_UPDATE, game.toDict()),
                )

    def send_event(self, event):
        self.send_json(event["event"])

    pass
