import typing
from uuid import UUID
from channels.generic.websocket import json
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from ft_transcendence.http import ws
from pong.forms.TournamentForms import TournamentRegistrationForm
from pong.models import Player, Tournament


def index(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})
    tournaments = Tournament.objects.all()
    tournaments = [tournament.toDict() for tournament in tournaments]

    return http.OK(tournaments)


def get(request: HttpRequest, public_id: str) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    tournament = Tournament.objects.filter(public_id=public_id).first()
    if tournament is None:
        return http.NotFound({"message": _("Torneio não encontrado")})

    return http.OK(tournament.toDict())


def create(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    form = TournamentRegistrationForm(json.loads(request.body))

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    name = form.data.get("name")
    players_id: list[UUID] = form.data.get("players_id")
    players = Player.objects.filter(public_id__in=players_id).all()

    if not players:
        return http.NotFound({"message": _("Jogadores não encontrados")})

    tournament = Tournament(name=name)
    tournament.save()
    tournament.generate_matches_tree_for(len(players))
    tournament.initialize_matches_tree(list(players))

    return http.Created(tournament.toDict())
