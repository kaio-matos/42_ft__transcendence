# myapp/tasks.py
from celery import shared_task
from pong.models import Player

@shared_task
def check_player_status_task():
    # Sua lógica para verificar o status dos jogadores
    Player.check_all_players_status()
