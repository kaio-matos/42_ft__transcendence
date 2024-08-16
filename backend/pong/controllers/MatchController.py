import typing
from channels.generic.websocket import json
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from ft_transcendence.http import ws
from pong.forms.MatchForms import MatchRegistrationForm
from pong.models import Player, Match
from pong.resources.MatchResource import MatchResource


def index(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})
    player = typing.cast(Player, request.user)
    matches = Match.objects.all()
    matches = [MatchResource(match, player) for match in matches]

    return http.OK(matches)


def get(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    match = Match.query_by_active_match_from([player]).first()
    if match is None:
        return http.NotFound({"message": _("Partida não encontrada")})

    return http.OK(MatchResource(match, player))


def matchmaking(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)

    # TODO: the challenged player should be someone that is Online

    # first we try to find someone that its not his friend
    challenged_player = player.query_by_not_friends().order_by("?").first()

    if not challenged_player:
        # if there is no one available we try to match him with some friend
        challenged_player = player.friends.order_by("?").first()
        # TODO: If currently there is no one to accept the match, should we wait for someone to show up or just return that there is no player?
        if not challenged_player:
            return http.NotFound(
                {"message": _("Não há nenhum jogador disponível para a partida")}
            )

    match = Match(name="Partida de Pong")
    match.save()
    match.players.add(player)
    match.players.add(challenged_player)

    match.begin()

    return http.Created(MatchResource(match, player))


def create(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    form = MatchRegistrationForm(json.loads(request.body))

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    challenged_player_id: str | None = form.data.get("challenged_player_id")
    player = typing.cast(Player, request.user)

    if not challenged_player_id:
        return http.NotFound({"message": _("Jogador não existe")})

    challenged_player = Player.objects.filter(public_id=challenged_player_id).first()

    if not challenged_player:
        return http.NotFound({"message": _("Jogador não existe")})

    match = Match(name="Partida de Pong")
    match.save()
    match.players.add(player)
    match.players.add(challenged_player)

    match.begin()

    return http.Created(MatchResource(match, player))


def accept(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    match = Match.query_by_active_match_from([player]).first()
    if match is None:
        return http.NotFound({"message": _("Partida não encontrada")})

    match.accept(player)

    return http.OK(MatchResource(match, player))


def reject(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    match = Match.query_by_active_match_from([player]).first()
    if match is None:
        return http.NotFound({"message": _("Partida não encontrada")})

    match.reject(player)

    return http.OK(MatchResource(match, player))
