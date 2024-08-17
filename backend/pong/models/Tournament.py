from __future__ import annotations
from typing import Callable
import uuid
from django.utils.translation import gettext as _
from django.core import serializers
from django.db import models
from threading import Timer

from ft_transcendence.http import ws
from pong.models.Match import Match
from pong.models.Player import Player
from pong.resources.TournamentResource import TournamentResource


class Tournament(models.Model):
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
    root_match = models.ForeignKey(
        Match, default=None, null=True, on_delete=models.CASCADE
    )
    champion = models.ForeignKey(
        Player,
        default=None,
        null=True,
        on_delete=models.SET_NULL,
        related_name="champion",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CREATED
    )
    players = models.ManyToManyField(Player, blank=True)
    accepted_players = models.ManyToManyField(
        Player, blank=True, related_name="tournament_accepted_players"
    )
    rejected_players = models.ManyToManyField(
        Player, blank=True, related_name="tournement_rejected_players"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def query_by_match(match: Match):
        return Tournament.objects.filter(root_match=match)

    @staticmethod
    def query_by_active_tournament_from(players):
        return Tournament.objects.filter(players__in=players).filter(
            models.Q(status=Tournament.Status.AWAITING)
            | models.Q(status=Tournament.Status.IN_PROGRESS)
        )

    @staticmethod
    def query_by_awaiting_tournament_with_pending_response_by(players):
        return (
            Tournament.objects.filter(players__in=players)
            .filter(status=Tournament.Status.AWAITING)
            .exclude(accepted_players__in=players)
            .exclude(rejected_players__in=players)
        )

    def has_finished(self):
        return bool(self.champion != None and self.status == self.Status.FINISHED)

    def can_begin(self):
        return bool(
            self.root_match != None
            and not self.has_finished()
            and self.is_fully_accepted()
        )

    def can_accept_or_reject(self):
        return bool(
            self.status == Tournament.Status.CREATED
            and not self.has_players_in_another_tournament()
            and not self.is_fully_accepted()
            and not self.has_finished()
        )

    def is_fully_accepted(self):
        players_n = self.players.count()
        return bool(players_n > 0 and self.accepted_players.count() == players_n)

    def has_player_accepted(self, player: Player):
        return self.accepted_players.filter(id=player.id).exists()

    def has_player_rejected(self, player: Player):
        return self.rejected_players.filter(id=player.id).exists()

    def has_players_in_another_tournament(self):
        return (
            Tournament.query_by_active_tournament_from(self.players.all())
            .exclude(public_id=self.public_id)
            .exists()
        )

    def generate_matches_tree_for(self, players_n: int):
        self.root_match = Match(name=self.name + " - Partida Final")
        self.root_match.save()
        self.save()

        matches_n = players_n // 2

        if matches_n == 1:
            return

        if matches_n % 2 != 0:
            raise ValueError("Number of players should be multiple of 4")

        def generate_children(match: Match, n: int):
            if n <= 0:
                return
            match.child_upper = Match(name=self.name + " - Partida")
            match.child_lower = Match(name=self.name + " - Partida")
            match.child_upper.save()
            match.child_lower.save()
            match.save()
            n -= 2
            generate_children(match.child_upper, n)
            generate_children(match.child_lower, n)

        generate_children(self.root_match, matches_n)

    def initialize_matches_tree(self, players: list[Player]):
        self.players.add(*players)

        def it(match: Match):
            if match.child_upper is None and match.child_lower is None:
                p1 = players[0]
                p2 = players[1]
                match.players.add(p1)
                match.players.add(p2)
                match.save()
                players.remove(p1)
                players.remove(p2)

        self.foreach_match(it)

    def update_matches_tree(self):
        def it(match: Match):
            if not match.has_finished():
                return
            parent = match.get_parent()
            if not parent:
                return
            if parent.can_receive_new_players():
                parent.players.add(match.winner)
            # TODO: After implementing the acceptance step, we will show a modal asking if the user is ready to start the next match
            # for now lets just wait 10 seconds before the beginning of the next match
            Timer(10, parent.begin).start()

        self.foreach_match(it)

    def notify_players_update(self):
        players = self.players.all()

        for player in players:
            player.send_message(
                ws.WSResponse(
                    ws.WSEvents.PLAYER_NOTIFY_TOURNAMENT_UPDATE,
                    {"tournament": TournamentResource(self, player)},
                )
            )

    def begin(self):
        if self.can_accept_or_reject():
            self.status = Tournament.Status.AWAITING
            self.save()
            self.notify_players_update()

        if self.can_begin():
            self.status = Tournament.Status.IN_PROGRESS
            self.save()

            def it(match: Match):
                match.begin()

            self.foreach_match(it)
            self.notify_players_update()

    def accept(self, player: Player):
        self.accepted_players.add(player)
        if self.is_fully_accepted():
            self.begin()
        self.notify_players_update()

    def reject(self, player: Player):
        self.rejected_players.add(player)
        self.status = Tournament.Status.CANCELLED
        self.save()
        self.notify_players_update()

    def finish(self):
        has_finished = False

        def it(match: Match):
            nonlocal has_finished
            if match.has_finished():
                has_finished = True
            else:
                has_finished = False

        self.foreach_match(it)
        self.update_matches_tree()

        if has_finished:
            self.status = self.Status.FINISHED
            self.champion = self.root_match.winner
            self.save()
            self.champion.send_message(
                ws.WSResponse(
                    ws.WSEvents.PLAYER_NOTIFY_TOURNAMENT_END,
                    {"tournament": self.toDict()},
                )
            )
        else:
            raise ValueError(
                "All matches must be finished first before finishing the tournament"
            )

    def foreach_match(
        self, fn: Callable[[Match], None], start_root: Match | None = None
    ):
        if start_root is None:
            start_root = self.root_match

        def iterate_tree(match: Match):
            fn(match)

            if match.child_upper is not None:
                iterate_tree(match.child_upper)
            if match.child_lower is not None:
                iterate_tree(match.child_lower)

        iterate_tree(start_root)

    def toDict(self) -> dict:
        r = {}
        r["id"] = str(self.public_id)
        r["name"] = self.name
        r["status"] = self.status
        r["root_match"] = None if not self.root_match else self.root_match.toDict()
        r["champion"] = None if not self.champion else self.champion.toDict()
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
