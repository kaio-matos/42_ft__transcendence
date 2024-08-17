from __future__ import annotations
import uuid
from django.utils.translation import gettext as _
from django.core import serializers
from django.db import models

from pong.models.Message import Message
from pong.models.Player import Player
from pong.models.mixins.TimestampMixin import TimestampMixin


class Chat(TimestampMixin):
    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(
        unique=True, db_index=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=100, null=True)
    players = models.ManyToManyField(Player)
    messages = models.ManyToManyField(Message)
    is_private = models.BooleanField()

    def broadcast(self, ws_response: dict):
        players = self.players.all()

        for player in players:
            player.send_message(ws_response)

    def toDict(self) -> dict:
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
