from django import forms


class TournamentRegistrationForm(forms.Form):
    challenged_player_id = forms.UUIDField()
