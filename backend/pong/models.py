from django.core import serializers
from django.db import models


class Player(models.Model):
    name = models.CharField(max_length=200)
    email = models.CharField(max_length=200)

    def toDict(self) -> dict:
        r = {}
        r["name"] = self.name
        r["email"] = self.email
        return r

    def __str__(self):
        return serializers.serialize(
            "json",
            [
                self,
            ],
        )
