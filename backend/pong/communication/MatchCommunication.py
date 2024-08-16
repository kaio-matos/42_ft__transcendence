import typing
from channels.generic.websocket import JsonWebsocketConsumer
from channels.http import async_to_sync

from ft_transcendence.http import ws
from pong.game.game import Game, GameDirection, GameScreen
from pong.models import Player, Match, Tournament

# TODO: We MUST find some way to do this without creating this variable, and probably without saving into the postgresql
games: dict[str, Game] = {}


class MatchCommunicationConsumer(JsonWebsocketConsumer):
    match_group_id: str
    match: Match

    def connect(self):
        player = self.scope["user"]
        if not player.is_authenticated:
            return
        player = typing.cast(Player, player)
        self.match_group_id = self.scope["url_route"]["kwargs"]["match_id"]
        self.match = Match.objects.get(public_id=self.match_group_id)
        self.accept()
        async_to_sync(self.channel_layer.group_add)(
            self.match_group_id, self.channel_name
        )

    def disconnect(self, code):
        if self.match_group_id:
            async_to_sync(self.channel_layer.group_discard)(
                self.match_group_id, self.channel_name
            )

    def receive_json(self, content, **kwargs):
        player = typing.cast(Player, self.scope["user"])
        if self.match.has_finished():
            return

        match content["command"]:
            case ws.WSCommands.MATCH_JOIN.value:
                screen = GameScreen(
                    content["payload"]["screen"]["width"],
                    content["payload"]["screen"]["height"],
                )
                games[self.match_group_id] = Game(self.match, screen)
                game = games[self.match_group_id]

                # TODO: This code is assuming both players are ready to begint the match, we should add some way to check if both are ready
                self.match.broadcast_match(
                    ws.WSResponse(ws.WSEvents.MATCH_START, game.toDict()),
                )

            case ws.WSCommands.KEY_PRESS.value:
                if self.match is None:
                    return
                game = games[self.match_group_id]
                if game is None:
                    return
                direction = content["payload"]["direction"]
                game.handleKeyPress(player, direction)

                if game.hasFinished():
                    self.match.finish(game.winner)
                    tournament = Tournament.query_by_match(
                        self.match.get_root()
                    ).first()
                    if tournament:
                        try:
                            tournament.finish()
                        except:
                            pass

                self.match.broadcast_match(
                    ws.WSResponse(ws.WSEvents.MATCH_UPDATE, game.toDict()),
                )

    def send_event(self, event):
        self.send_json(event["event"])

    pass
