import typing
from uuid import UUID
from channels.generic.websocket import json
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from pong.forms.TournamentForms import TournamentRegistrationForm
from pong.models import Player, Tournament
from pong.resources.TournamentResource import TournamentResource


def index(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})
    tournaments = Tournament.objects.all()
    tournaments = [tournament.toDict() for tournament in tournaments]

    return http.OK(tournaments)


def get(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    tournament = Tournament.query_by_active_tournament_from([player]).first()
    if tournament is None:
        return http.NotFound({"message": _("Torneio não encontrado")})

    return http.OK(TournamentResource(tournament, player))


def create(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    form = TournamentRegistrationForm(json.loads(request.body))

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    player = typing.cast(Player, request.user)
    name = form.data.get("name")
    players_id: list[UUID] = form.data.get("players_id")
    players = Player.objects.filter(public_id__in=players_id).all()

    if not players:
        return http.NotFound({"message": _("Jogadores não encontrados")})

    tournament = Tournament(name=name)
    tournament.save()
    tournament.generate_matches_tree_for(len(players))
    tournament.initialize_matches_tree(list(players))

    tournament.begin()

    return http.Created(TournamentResource(tournament, player))


def accept(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    tournament = Tournament.query_by_active_tournament_from([player]).first()
    if tournament is None:
        return http.NotFound({"message": _("Torneio não encontrado")})
    tournament.accept(player)

    return http.OK(TournamentResource(tournament, player))


def reject(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    tournament = Tournament.query_by_active_tournament_from([player]).first()
    if tournament is None:
        return http.NotFound({"message": _("Torneio não encontrado")})
    tournament.reject(player)

    return http.OK(TournamentResource(tournament, player))
