import os
import uuid
from asgiref.sync import async_to_sync
from channels.consumer import get_channel_layer
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext as _
from django.core import serializers
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.contrib.postgres.fields import ArrayField


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
    friends = models.ManyToManyField("self", blank=True)
    blocked_chats = models.ManyToManyField("Chat")

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "password"]

    def query_exclude_self(self):
        return Player.objects.exclude(id=self.id)

    def query_by_not_friends(self):
        return self.query_exclude_self().exclude(id__in=self.friends.all())

    def __str__(self):
        return f"{self.name} ({self.email})"

    def toDict(self) -> dict:
        return {
            "id": str(self.public_id),
            "name": self.name,
            "email": self.email,
            "avatar": None if not self.avatar else self.avatar.url,
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

    def toDict(self) -> dict:
        r = {}
        r["id"] = str(self.public_id)
        r["messages"] = [message.toDict() for message in self.messages.all()]
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


class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(
        unique=True, db_index=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=200)
    players = models.ManyToManyField(Player)

    def broadcast(self, ws_response: dict):
        channel_layer = get_channel_layer()
        players = self.players.all()

        for player in players:
            async_to_sync(channel_layer.group_send)(str(player.public_id), ws_response)

    def toDict(self) -> dict:
        r = {}
        r["id"] = str(self.public_id)
        r["name"] = self.name
        r["players"] = [player.toDict() for player in self.players.all()]

        return r

    def __str__(self):
        return serializers.serialize(
            "json",
            [
                self,
            ],
        )
