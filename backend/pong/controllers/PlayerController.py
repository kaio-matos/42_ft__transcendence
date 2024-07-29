import json
import typing
from django.core import validators
from django.http import HttpRequest, HttpResponse
from django.utils.translation import gettext_lazy as _
from ft_transcendence.http import http
from pong.models import Player
from django.core.exceptions import ValidationError
from django.contrib import auth


def index(request: HttpRequest) -> HttpResponse:
    players = Player.objects.all()
    players = [player.toDict() for player in players]
    print(players)

    return http.OK(players)


def login(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")
    player = auth.authenticate(request, email=email, password=password)
    if player is not None:
        auth.login(request, player)
        return http.OK({"player": typing.cast(Player, player).toDict()})
    print(player)
    return http.Unauthorized({"error": {"_errors": "Invalid email or password"}})


def create(request: HttpRequest) -> HttpResponse:
    try:
        data = json.loads(request.body)
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            raise ValueError({"_errors": _("Email,Nome e senha são necessários!")})
        try:
            validators.validate_email(email)
        except ValidationError:
            raise ValueError({"email": _("Email inválido!")})

        if Player.objects.filter(email=email).exists():
            raise ValueError({"email": _("Email já existente!")})

        if Player.objects.filter(name=name).exists():
            raise ValueError({"name": _("Nome de usuário já existente!")})

        user = Player.objects.create_user(name=name, email=email, password=password)
        user.save()

        return http.Created(user.toDict())
    except ValueError as e:
        return http.UnprocessableEntity({"error": e.args[0]})
    except json.JSONDecodeError:
        return http.UnprocessableEntity({"error": "JSON inválido"})
