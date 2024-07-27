import typing
from channels.generic.websocket import json
from django.utils.translation import gettext_lazy as _
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from ft_transcendence.http import ws
from pong.models import Player, Tournament

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def index(request: HttpRequest) -> HttpResponse:
    tournaments = Tournament.objects.all()
    tournaments = [tournament.toDict() for tournament in tournaments]

    return http.OK(tournaments)


def create(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("You are not authenticated")})

    try:
        data = json.loads(request.body)
        challenged_player_id: str = data.get("challenged_player_id")
        player = typing.cast(Player, request.user)

        if not challenged_player_id:
            raise ValueError({"challenged_player_id": _("Player does not exist")})

        challenged_player = Player.objects.filter(
            public_id=challenged_player_id
        ).first()

        if not challenged_player:
            raise ValueError({"challenged_player_id": _("Player does not exist")})

        tournament = Tournament(name="Pong Tournament")
        tournament.save()
        tournament.players.add(player)
        tournament.players.add(challenged_player)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            player.public_id,
            ws.WSResponse("JOIN_TOURNAMENT", {"tournament": tournament.toDict()}),
        )

        return http.Created(tournament.toDict())
    except ValueError as e:
        return http.UnprocessableEntity({"error": e.args[0]})
