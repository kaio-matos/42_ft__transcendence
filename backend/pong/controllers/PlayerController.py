import json
import typing
from django.core import validators
from django.http import HttpRequest, HttpResponse
from django.utils.translation import gettext_lazy as _
from ft_transcendence.http import http
from pong.models import Player
from django.core.exceptions import ValidationError
from django.contrib import auth


def login(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")
    player = auth.authenticate(request, email=email, password=password)
    if player is not None:
        auth.login(request, player)
        return http.OK(typing.cast(Player, player).toDict())
    return http.Unauthorized({"error": {"_errors": "Email ou senha inválidos"}})


def create(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        raise ValidationError(_("Email, nome e senha são campos obrigatórios!"))
    try:
        validators.validate_email(email)
    except ValidationError:
        raise ValidationError({"email": _("Email inválido!")})

    if Player.objects.filter(email=email).exists():
        raise ValidationError({"email": _("Email já existente!")})

    if Player.objects.filter(name=name).exists():
        raise ValidationError({"name": _("Nome de usuário já existente!")})

    user = Player.objects.create_user(name=name, email=email, password=password)
    user.save()

    return http.Created(user.toDict())


def index(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    players = Player.objects.all()
    players = [player.toDict() for player in players]

    return http.OK(players)


def get(request: HttpRequest, public_id: str) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = Player.objects.filter(public_id=public_id).first()

    if not player:
        return http.NotFound({"message": _("Jogador não encontrado")})

    return http.OK(player.toDict())


def update(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    data = json.loads(request.body)
    name = data.get("name")

    if not name:
        raise ValidationError(_("Nome inválido"))

    player.name = name
    player.save()

    return http.OK(player.toDict())


def addFriend(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    data = json.loads(request.body)
    email = data.get("email")

    try:
        validators.validate_email(email)
    except ValidationError:
        raise ValidationError({"email": _("Email inválido!")})

    if email == player.email:
        raise ValueError({"email": _("Você não pode adicionar a si mesmo como amigo")})

    if player.friends.filter(email=email).first() is not None:
        raise ValueError({"email": _("Este jogador já é seu amigo")})

    friend = Player.objects.filter(email=email).first()

    if not friend:
        return http.NotFound({"message": _("Jogador não encontrado")})

    player.friends.add(friend)
    player.save()

    return http.OK(player.toDict())


def getFriends(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    friends = player.friends.all()
    friends = [player.toDict() for player in friends]

    return http.OK(friends)
