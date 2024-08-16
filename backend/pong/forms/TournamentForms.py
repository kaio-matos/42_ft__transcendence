from django import forms
from django.utils.translation import gettext as _

from pong.forms.Forms import ArrayUUIDsField


class TournamentRegistrationForm(forms.Form):
    name = forms.CharField(max_length=100)
    players_id = ArrayUUIDsField(min=4, is_even=True)
