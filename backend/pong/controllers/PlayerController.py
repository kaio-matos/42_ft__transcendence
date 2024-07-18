from django.core import serializers
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from pong.models import Player


def index(request: HttpRequest) -> HttpResponse:
    if request.method != "GET":
        return http.MethodNotAllowed()
    players = Player.objects.all()
    players = [player.toDict() for player in players]

    return http.OK(players)


def create(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return http.MethodNotAllowed()
    return http.OK({})
