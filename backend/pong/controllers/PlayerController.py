from django.core import serializers
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from pong.models import Player


def index(request: HttpRequest) -> HttpResponse:
    players = Player.objects.all()
    players = [player.toDict() for player in players]

    return http.OK(players)


def create(request: HttpRequest) -> HttpResponse:
    return http.OK({})
