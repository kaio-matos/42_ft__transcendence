from django import forms


class MatchRegistrationForm(forms.Form):
    challenged_player_id = forms.UUIDField()
