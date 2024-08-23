from django import forms

from pong.forms.Forms import ArrayUUIDsField


class MatchGetFilterForm(forms.Form):
    player_id = forms.UUIDField(required=True)


class MatchRegistrationForm(forms.Form):
    players_id = ArrayUUIDsField(min=2, max=4, is_even=True)
