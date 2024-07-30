import typing
from channels.generic.websocket import json
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from ft_transcendence.http import ws
from pong.models import Player, Tournament

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def index(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("You are not authenticated")})
    tournaments = Tournament.objects.all()
    tournaments = [tournament.toDict() for tournament in tournaments]

    return http.OK(tournaments)


def get(request: HttpRequest, public_id: str) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("You are not authenticated")})

    tournament = Tournament.objects.filter(public_id=public_id).first()
    if tournament is None:
        return http.NotFound({"message": _("Tournament not found")})

    return http.OK(tournament.toDict())


def create(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("You are not authenticated")})

    data = json.loads(request.body)
    challenged_player_id: str = data.get("challenged_player_id")
    player = typing.cast(Player, request.user)

    if not challenged_player_id:
        raise ValidationError({"challenged_player_id": _("Player does not exist")})

    challenged_player = Player.objects.filter(public_id=challenged_player_id).first()

    if not challenged_player:
        raise ValidationError({"challenged_player_id": _("Player does not exist")})

    tournament = Tournament(name="Pong Tournament")
    tournament.save()
    tournament.players.add(player)
    tournament.players.add(challenged_player)
    channel_layer = get_channel_layer()
    if player.websocket_channel_names[0] is None:
        raise ValueError(player.name + " is not online")
    if challenged_player.websocket_channel_names[0] is None:
        raise ValueError(challenged_player.name + " is not online")

    async_to_sync(
        channel_layer.group_add(
            str(tournament.public_id), player.websocket_channel_names[0]
        )
    )
    async_to_sync(
        channel_layer.group_add(
            str(tournament.public_id), challenged_player.websocket_channel_names[0]
        )
    )

    async_to_sync(channel_layer.group_send)(
        challenged_player_id,
        ws.WSResponse(
            ws.WSEvents.TOURNAMENT_BEGIN, {"tournament": tournament.toDict()}
        ),
    )

    # async_to_sync(channel_layer.group_send)(
    #     str(tournament.public_id),
    #     ws.WSResponse(
    #         ws.WSEvents.TOURNAMENT_BEGIN, {"tournament": tournament.toDict()}
    #     ),
    # )

    return http.Created(tournament.toDict())
