import uuid, json
from django.utils.translation import gettext_lazy as _
from django.core import serializers,validators
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.db import models
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http



class Player(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    name = models.CharField(max_length=150, unique=True)

    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(unique=True, db_index=True, default=uuid.uuid4, editable=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name','password']

    def __str__(self):
        return f'{self.name} ({self.email})'

    def toDict(self) -> dict:
        return {
            "id": str(self.public_id),
            "name": self.name,
            "email": self.email,
        }

class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    public_id = models.UUIDField(
        unique=True, db_index=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=200)
    players = models.ManyToManyField(Player)

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
