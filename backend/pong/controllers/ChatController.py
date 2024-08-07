import typing
from uuid import UUID
from channels.generic.websocket import json
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from ft_transcendence.http import ws
from pong.forms.ChatForms import ChatCreationForm
from pong.models import Chat, Player


def index(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})
    player = typing.cast(Player, request.user)
    chats = Chat.objects.filter(players__in=[player]).all()
    chats = [chat.toDict() for chat in chats]

    return http.OK(chats)


def get(request: HttpRequest, public_id: str) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    chat = Chat.objects.get(public_id=public_id)
    if chat is None:
        return http.NotFound({"message": _("Conversa não encontrada")})

    return http.OK(chat.toDict())


def create(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    form = ChatCreationForm(json.loads(request.body))

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    player = typing.cast(Player, request.user)
    name: str | None = form.data.get("name")
    players_id: list[UUID] = form.data.get("players_id")
    players = Player.objects.filter(public_id__in=players_id).all()

    if not players:
        return http.NotFound({"message": _("Jogadores não encontrados")})

    chat = Chat(name=name)
    chat.save()
    chat.players.add(player)
    chat.players.add(*players)

    return http.Created(chat.toDict())


def block(request: HttpRequest, public_id: str) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})
    player = typing.cast(Player, request.user)
    chat = Chat.objects.get(public_id=public_id)
    if chat is None:
        return http.NotFound({"message": _("Conversa não encontrada")})

    player.blocked_chats.add(chat)

    return http.OK(chat.toDict())
