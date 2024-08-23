import typing
from channels.generic.websocket import json
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from ft_transcendence.http import ws
from pong.forms.MatchForms import MatchGetFilterForm, MatchRegistrationForm
from pong.models import Player, Match
from pong.resources.MatchResource import MatchResource


def index(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    form = MatchGetFilterForm(request.GET.dict())

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    player = typing.cast(Player, request.user)
    target_player = Player.objects.filter(public_id=form.data.get("player_id")).first()

    if target_player is None:
        return http.NotFound({"message": _("Jogador não encontrado")})

    matches = Match.query_by_player([target_player])
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

    # first we try to find someone that its not his friend
    challenged_player = (
        player.query_by_not_friends()
        .filter(activity_status=Player.ActivityStatus.ONLINE)
        .order_by("?")
        .first()
    )

    if not challenged_player:
        # if there is no one available we try to match him with some friend that is online
        challenged_player = player.friends.order_by("?").filter(
            activity_status=Player.ActivityStatus.ONLINE
        ).first()
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

    player = typing.cast(Player, request.user)
    players_id: list[UUID] = form.data.get("players_id")
    players = Player.objects.filter(public_id__in=players_id).all()

    if not players:
        return http.NotFound({"message": _("Jogadores não encontrados")})

    match = Match(name="Partida de Pong")
    match.save()
    match.players.add(*players)

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
