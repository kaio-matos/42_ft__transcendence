from django.core import serializers
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from pong.models import Player, Tournament


def index(request: HttpRequest) -> HttpResponse:
    tournaments = Tournament.objects.all()
    tournaments = [tournament.toDict() for tournament in tournaments]

    return http.OK(tournaments)


def create(request: HttpRequest) -> HttpResponse:
    tournament = Tournament(name="Pong Tournament - Best of 3")
    tournament.save()

    player_kaio = Player(name="kaio", email="kaio@example.com")
    player_kaio.save()
    tournament.players.add(player_kaio)

    player_joao = Player(name="joao", email="joao@example.com")
    player_joao.save()
    tournament.players.add(player_joao)

    return http.OK(tournament.toDict())
