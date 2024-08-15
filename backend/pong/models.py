from __future__ import annotations
import os
from typing import Callable
import uuid
from asgiref.sync import async_to_sync
from channels.consumer import get_channel_layer
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext as _
from django.core import serializers
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from ft_transcendence.http import ws


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """

    def create_user(self, name, email, password, **extra_fields):
        """
        Create and save a user with the given email and password.
        """
        if not email:
            raise ValueError(_("The Email must be set"))
        name = name
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))
        return self.create_user(email, password, **extra_fields)


def playerAvatarPath(player, filename: str):
    _, extension = os.path.splitext(filename)
    return f"player/avatar/{player.public_id}{extension}"


class Player(AbstractBaseUser, PermissionsMixin):
    class ActivityStatus(models.TextChoices):
        ONLINE = "ONLINE", _("Online")
        OFFLINE = "OFFLINE", _("Offline")

    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(
        unique=True, db_index=True, default=uuid.uuid4, editable=False
    )
    email = models.EmailField(_("email address"), unique=True)
    name = models.CharField(max_length=150, unique=True)
    avatar = models.ImageField(
        upload_to=playerAvatarPath,
        default="/default/player/avatar/default.jpg",
        blank=True,
    )
    activity_status = models.CharField(
        max_length=20, choices=ActivityStatus.choices, default=ActivityStatus.OFFLINE
    )
    friends = models.ManyToManyField("self", blank=True)
    blocked_chats = models.ManyToManyField("Chat")

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "password"]

    def query_exclude_self(self):
        return Player.objects.exclude(id=self.id)

    def query_by_not_friends(self):
        return self.query_exclude_self().exclude(id__in=self.friends.all())

    def is_chat_blocked(self, chat):
        return chat in self.blocked_chats.all()

    def can_receive_messages_from(self, chat):
        return chat not in self.blocked_chats.all()

    def can_send_messages_to(self, chat):
        return chat not in self.blocked_chats.all()

    def set_activity_status(self, activity_status: ActivityStatus):
        self.activity_status = activity_status
        self.save()
        self.broadcast_friends(
            ws.WSResponse(ws.WSEvents.FRIEND_ACTIVITY_STATUS, self.toDict())
        )

    def broadcast_friends(self, ws_response: dict):
        channel_layer = get_channel_layer()
        friends = self.friends.all()

        for player in friends:
            async_to_sync(channel_layer.group_send)(str(player.public_id), ws_response)

    def __str__(self):
        return f"{self.name} ({self.email})"

    def toDict(self) -> dict:
        return {
            "id": str(self.public_id),
            "name": self.name,
            "email": self.email,
            "avatar": None if not self.avatar else self.avatar.url,
            "activity_status": self.activity_status,
        }


class Message(models.Model):
    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(
        unique=True, db_index=True, default=uuid.uuid4, editable=False
    )
    sender = models.ForeignKey(Player, on_delete=models.DO_NOTHING)
    text = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def toDict(self) -> dict:
        r = {}
        r["id"] = str(self.public_id)
        r["sender"] = self.sender.toDict()
        r["text"] = str(self.text)
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


class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(
        unique=True, db_index=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=100, null=True)
    players = models.ManyToManyField(Player)
    messages = models.ManyToManyField(Message)
    is_private = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def broadcast(self, ws_response: dict):
        channel_layer = get_channel_layer()
        players = self.players.all()

        for player in players:
            async_to_sync(channel_layer.group_send)(str(player.public_id), ws_response)

    def toDict(self, can_see_messages=False) -> dict:
        r = {}
        r["id"] = str(self.public_id)
        r["players"] = [player.toDict() for player in self.players.all()]
        r["is_private"] = self.is_private
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


class Match(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED", _("Criado")
        AWAITING = "AWAITING", _("Aguardando")
        IN_PROGRESS = "IN_PROGRESS", _("Em Progresso")
        FINISHED = "FINISHED", _("Finalizado")

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_full(self):
        return bool(self.players.count() > self.max)

    def has_finished(self):
        if self.winner is not None and self.status == self.Status.FINISHED:
            return True
        return False

    def can_receive_new_players(self):
        return bool(not self.is_full() and not self.has_finished())

    def can_begin(self):
        return bool(self.is_full() and not self.has_finished())

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

    def finish(self, winner):
        self.winner = winner
        self.status = self.Status.FINISHED
        self.save()

    def broadcast(self, ws_response: dict):
        channel_layer = get_channel_layer()
        players = self.players.all()

        for player in players:
            async_to_sync(channel_layer.group_send)(str(player.public_id), ws_response)

    def begin(self):
        if not self.can_begin():
            return
        self.status = Match.Status.IN_PROGRESS
        self.save()
        if self.has_finished():
            return
        self.broadcast(ws.WSResponse(ws.WSEvents.MATCH_BEGIN, {"match": self.toDict()}))

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


class Tournament(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED", _("Criado")
        IN_PROGRESS = "IN_PROGRESS", _("Em Progresso")
        FINISHED = "FINISHED", _("Finalizado")

    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(
        unique=True, db_index=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=200)
    root_match = models.ForeignKey(
        Match, default=None, null=True, on_delete=models.CASCADE
    )
    champion = models.ForeignKey(
        Player, default=None, null=True, on_delete=models.SET_NULL
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CREATED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def query_by_match(match: Match):
        return Tournament.objects.filter(root_match=match)

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
                parent.status = Match.Status.AWAITING
                parent.players.add(match.winner)
                parent.save()
            if parent.can_begin():
                parent.begin()

        self.foreach_match(it)

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
