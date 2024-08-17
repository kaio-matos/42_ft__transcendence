from __future__ import annotations
import uuid
from asgiref.sync import async_to_sync
from channels.consumer import get_channel_layer
from django.utils.translation import gettext as _
from django.core import serializers
from django.db import models

from ft_transcendence.http import ws
from pong.models.Player import Player
from pong.resources.MatchResource import MatchResource


class Match(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED", _("Criado")
        AWAITING = "AWAITING", _("Aguardando")
        IN_PROGRESS = "IN_PROGRESS", _("Em Progresso")
        FINISHED = "FINISHED", _("Finalizado")
        CANCELLED = "CANCELLED", _("Cancelado")

    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(
        unique=True, db_index=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=200)
    players = models.ManyToManyField(Player, blank=True)
    winner = models.ForeignKey(
        Player,
        default=None,
        null=True,
        on_delete=models.SET_NULL,
        related_name="winner",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CREATED
    )
    child_upper = models.ForeignKey(
        "self",
        default=None,
        null=True,
        on_delete=models.CASCADE,
        related_name="parent_upper",
    )
    child_lower = models.ForeignKey(
        "self",
        default=None,
        null=True,
        on_delete=models.CASCADE,
        related_name="parent_lower",
    )
    max = models.IntegerField(default=2)
    accepted_players = models.ManyToManyField(
        Player, blank=True, related_name="accepted_players"
    )
    rejected_players = models.ManyToManyField(
        Player, blank=True, related_name="rejected_players"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def query_by_player(players):
        return Match.objects.filter(players__in=players)

    @staticmethod
    def query_by_awaiting():
        return Match.objects.filter(status=Match.Status.AWAITING)

    @staticmethod
    def query_by_active_match_from(players):
        return Match.objects.filter(players__in=players).filter(
            models.Q(status=Match.Status.AWAITING)
            | models.Q(status=Match.Status.IN_PROGRESS)
        )

    @staticmethod
    def query_by_in_progress_match_from(players):
        return Match.objects.filter(players__in=players).filter(
            status=Match.Status.IN_PROGRESS
        )

    @staticmethod
    def query_by_awaiting_matches_with_pending_response_by(players):
        return (
            Match.objects.filter(players__in=players)
            .filter(status=Match.Status.AWAITING)
            .exclude(accepted_players__in=players)
            .exclude(rejected_players__in=players)
        )

    def is_full(self):
        return bool(self.players.count() >= self.max)

    def is_fully_accepted(self):
        players_n = self.players.count()
        return bool(players_n > 0 and self.accepted_players.count() == players_n)

    def has_player_accepted(self, player: Player):
        return self.accepted_players.filter(id=player.id).exists()

    def has_player_rejected(self, player: Player):
        return self.rejected_players.filter(id=player.id).exists()

    def has_players_in_another_match(self):
        return (
            Match.query_by_active_match_from(self.players.all())
            .exclude(public_id=self.public_id)
            .exists()
        )

    def has_finished(self):
        if self.winner is not None and self.status == self.Status.FINISHED:
            return True
        return False

    def can_receive_new_players(self):
        return bool(not self.is_full() and not self.has_finished())

    def can_accept_or_reject(self):
        return bool(
            self.status == Match.Status.CREATED
            and not self.has_players_in_another_match()
            and self.is_full()
            and not self.is_fully_accepted()
            and not self.has_finished()
        )

    def can_begin(self):
        return bool(
            self.is_full() and self.is_fully_accepted() and not self.has_finished()
        )

    def get_root(self) -> Match | None:
        child = self
        parent = child.get_parent()

        if parent is None:
            return child

        while parent is not None:
            child = parent
            parent = child.get_parent()
            if parent is None:
                return child

        return child

    def get_parent(self) -> Match | None:
        p = self.parent_upper.first()
        if p is None:
            p = self.parent_lower.first()
        return p

    def broadcast_match(self, ws_response: dict):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(str(self.public_id), ws_response)

    def notify_players_update(self):
        players = self.players.all()

        for player in players:
            player.send_message(
                ws.WSResponse(
                    ws.WSEvents.PLAYER_NOTIFY_MATCH_UPDATE,
                    {"match": MatchResource(self, player)},
                )
            )

    def ask_for_confirmation(self):
        if self.can_accept_or_reject():
            self.status = Match.Status.AWAITING
            self.save()
            self.notify_players_update()

    def begin(self):
        self.ask_for_confirmation()

        if self.can_begin():
            self.status = Match.Status.IN_PROGRESS
            self.save()

    def accept(self, player: Player):
        self.accepted_players.add(player)
        if self.is_fully_accepted():
            self.begin()
        self.notify_players_update()

    def reject(self, player: Player):
        self.rejected_players.add(player)
        self.status = Match.Status.CANCELLED
        self.save()
        self.notify_players_update()

    def finish(self, winner: Player):
        self.winner = winner
        self.status = self.Status.FINISHED
        self.save()
        self.broadcast_match(
            ws.WSResponse(ws.WSEvents.MATCH_END, {"match": self.toDict()})
        )

    def toDict(self) -> dict:
        r = {}

        r["id"] = str(self.public_id)
        r["name"] = self.name
        r["status"] = self.status
        r["players"] = [player.toDict() for player in self.players.all()]
        r["child_upper"] = None if not self.child_upper else self.child_upper.toDict()
        r["child_lower"] = None if not self.child_lower else self.child_lower.toDict()
        r["winner"] = None if not self.winner else self.winner.toDict()
        r["has_finished"] = self.has_finished()
        r["created_at"] = str(self.created_at)
        r["updated_at"] = str(self.updated_at)

        return r

    def __str__(self):
        return serializers.serialize(
            "json",
            [
                self,
            ],
        )
