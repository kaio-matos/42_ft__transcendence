import collections.abc
import uuid
from django.core.exceptions import ValidationError
from django.forms import forms

from django.utils.translation import gettext as _


class ArrayUUIDsField(forms.Field):

    def __init__(self, *args, min=1, is_even=False, **kwargs):
        self.min = min
        self.is_even = is_even

        super().__init__(*args, **kwargs)

    def clean(self, value):
        ids = super().clean(value)

        if not isinstance(ids, collections.abc.Sequence):
            raise ValidationError(_("Este campo deve ser uma lista"), code="array")

        if len(ids) < self.min:
            raise ValidationError(
                _("Esta lista deve ser maior do que " + str(self.min)), code="min"
            )

        if self.is_even and (len(ids) % 2 != 0):
            raise ValidationError(_("Esta lista deve ser par"), code="is_even")

        for id in ids:
            try:
                uuid.UUID(id, version=4)
            except ValueError:
                raise ValidationError(
                    _("Os dados da lista devem ser UUIDs"), code="uuid"
                )
        return ids
