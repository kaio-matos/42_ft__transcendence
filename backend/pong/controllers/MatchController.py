import typing
from uuid import UUID
from channels.generic.websocket import json
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from ft_transcendence.http import ws
from pong.forms.MatchForms import MatchGetFilterForm, MatchRegistrationForm
from pong.models import Player, Match
from pong.models.Tournament import Tournament
from pong.resources.MatchResource import MatchResource


def index(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    form = MatchGetFilterForm(request.GET.dict())

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    player = typing.cast(Player, request.user)
    target_player = Player.objects.filter(public_id=form.data.get("player_id")).first()

    if target_player is None:
        return http.NotFound({"message": _("Jogador não encontrado")})

    matches = Match.query_by_player([target_player])
    matches = [MatchResource(match, player) for match in matches]

    return http.OK(matches)


def get(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    match = Match.query_by_active_match_from([player]).first()
    if match is None:
        return http.NotFound({"message": _("Partida não encontrada")})

    return http.OK(MatchResource(match, player))


def matchmaking(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)

    # MODIFICAÇÃO: Buscar todos os jogadores online, excluindo o jogador atual
    all_online_players = Player.objects.filter(
        activity_status=Player.ActivityStatus.ONLINE
    ).exclude(id=player.id)

    # MODIFICAÇÃO: Filtrar jogadores que não estão em partidas ou torneios ativos
    available_players = []
    for potential_opponent in all_online_players:
        active_tournament = Tournament.query_by_active_tournament_from([player, potential_opponent])
        active_match = Match.query_by_active_match_from([player, potential_opponent])
        
        if not active_tournament.exists() and not active_match.exists():
            available_players.append(potential_opponent)

    # Se não houver jogadores disponíveis, retornar NotFound
    if not available_players:
        return http.NotFound(
            {"message": _("Não há nenhum jogador disponível para a partida")}
        )

    # MODIFICAÇÃO: Se houver apenas um jogador disponível, escolhê-lo diretamente
    if len(available_players) == 1:
        challenged_player = available_players[0]
    else:
        # MODIFICAÇÃO: Separar jogadores em não amigos e amigos
        non_friend_players = [p for p in available_players if p not in player.friends.all()]
        friend_players = [p for p in available_players if p in player.friends.all()]

        # Combinar as duas listas, priorizando não amigos
        potential_opponents = non_friend_players + friend_players

        # Escolher um oponente aleatório
        import random
        challenged_player = random.choice(potential_opponents)

    # Criar e iniciar a partida com o oponente escolhido
    match = Match(name="Partida de Pong")
    match.save()
    match.players.add(player)
    match.players.add(challenged_player)
    match.begin()

    return http.Created(MatchResource(match, player))


def create(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    form = MatchRegistrationForm(json.loads(request.body))

    if not form.is_valid():
        raise ValidationError(form.errors.as_data())

    player = typing.cast(Player, request.user)
    players_id: list[UUID] = form.data.get("players_id")
    players = Player.objects.filter(public_id__in=players_id).all()

    if not players:
        return http.NotFound({"message": _("Jogadores não encontrados")})

    active_tournament = Tournament.query_by_active_tournament_from(players)
    active_match = Match.query_by_active_match_from(players)
    if active_tournament.exists() or active_match.exists():
        raise ValidationError(
            {
                "players_id": [
                    _(f"Os jogadores selecionados já estão em partidas ativas")
                ]
            }
        )

    if form.data.get("type") == Match.Type.MULTIPLAYER_LOCAL.value:
        match = Match(name="Partida de Pong", max=1)
    else:
        if len(players) != 2 and len(players) != 4:
            raise ValidationError(
                {"players_id": [_("O número de jogadores deve ser 2 ou 4")]}
            )

        match = Match(name="Partida de Pong")

    if form.data.get("type"):
        match.type = form.data.get("type")
    match.save()
    match.players.add(*players)

    match.begin()

    return http.Created(MatchResource(match, player))


def accept(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    match = Match.query_by_active_match_from([player]).first()
    if match is None:
        return http.NotFound({"message": _("Partida não encontrada")})

    match.accept(player)

    return http.OK(MatchResource(match, player))


def reject(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return http.Unauthorized({"message": _("Você não está autenticado")})

    player = typing.cast(Player, request.user)
    match = Match.query_by_active_match_from([player]).first()
    if match is None:
        return http.NotFound({"message": _("Partida não encontrada")})

    match.reject(player)

    return http.OK(MatchResource(match, player))
