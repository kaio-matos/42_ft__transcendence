import json
import typing
from django.http import HttpRequest, HttpResponse
from django.utils.translation import gettext_lazy as _
from ft_transcendence.http import http
from pong.models import Player
from django.core.exceptions import ValidationError
from django.contrib import auth

from pong.forms.PlayerForms import (
    PlayerAddFriendForm,
    PlayerAvatarForm,
    PlayerLoginForm,
    PlayerRegistrationForm,
    PlayerUpdateForm,
)


def login(request: HttpRequest) -> HttpResponse:
    form = PlayerLoginForm(json.loads(request.body))

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    player = auth.authenticate(
        request, email=form.data.get("email"), password=form.data.get("password")
    )
    if player is not None:
        auth.login(request, player)
        return http.OK(typing.cast(Player, player).toDict())
    return http.Unauthorized({"error": {"_errors": "Email ou senha inválidos"}})


def create(request: HttpRequest) -> HttpResponse:
    form = PlayerRegistrationForm(json.loads(request.body))

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    if Player.objects.filter(email=form.data.get("email")).exists():
        raise ValueError({"email": "Email já existente!"})

    if Player.objects.filter(name=form.data.get("name")).exists():
        raise ValueError({"name": "Nome de usuário já existente!"})

    user = Player.objects.create_user(
        name=form.data.get("name"),
        email=form.data.get("email"),
        password=form.data.get("password"),
    )
    user.save()

    return http.Created(user.toDict())


def setAvatar(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)

    form = PlayerAvatarForm(request.POST, request.FILES)

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    player.avatar = form.files.get("avatar")
    player.save()

    return http.OK(player.toDict())


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
    form = PlayerUpdateForm(json.loads(request.body))

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    player.name = form.data.get("name")
    player.save()

    return http.OK(player.toDict())


def addFriend(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    form = PlayerAddFriendForm(json.loads(request.body))
    email = form.data.get("email")

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    if email == player.email:
        raise ValueError({"email": "Você não pode adicionar a si mesmo como amigo"})

    friend = Player.objects.filter(email=email).first()

    if not friend:
        raise ValueError({"email": "Jogador não encontrado"})

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
