import collections.abc
import uuid
from django import forms
from django.core.exceptions import ValidationError
from django.db.models import UUIDField
from django.utils.translation import gettext as _


class ArrayUUIDsField(forms.Field):
    def clean(self, value):
        ids = super().clean(value)

        if not isinstance(ids, collections.abc.Sequence):
            raise ValidationError(_("Este campo deve ser uma lista"), code="array")
        for id in ids:
            try:
                uuid.UUID(id, version=4)
            except ValueError:
                raise ValidationError(
                    _("Os dados da lista devem ser UUIDs"), code="uuid"
                )
        return ids


class ChatCreationForm(forms.Form):
    name = forms.CharField(required=False)
    players_id = ArrayUUIDsField()


class ChatSendMessageForm(forms.Form):
    sender_id = forms.UUIDField()
    text = forms.CharField(max_length=1000)
