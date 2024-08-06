import typing
from channels.generic.websocket import json
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
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

    challenged_player_id: str = form.data.get("challenged_player_id")
    player = typing.cast(Player, request.user)

    if not challenged_player_id:
        return http.NotFound({"message": _("Jogador não existe")})

    challenged_player = Player.objects.filter(public_id=challenged_player_id).first()

    if not challenged_player:
        return http.NotFound({"message": _("Jogador não existe")})

    tournament = Tournament(name="Torneio de Pong")
    tournament.save()
    tournament.players.add(player)
    tournament.players.add(challenged_player)

    tournament.broadcast(
        ws.WSResponse(ws.WSEvents.TOURNAMENT_BEGIN, {"tournament": tournament.toDict()})
    )

    return http.Created(tournament.toDict())
