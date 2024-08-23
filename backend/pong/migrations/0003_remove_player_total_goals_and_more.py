# Generated by Django 4.2 on 2024-08-22 22:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0002_player_total_goals_player_total_play_time'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='player',
            name='total_goals',
        ),
        migrations.RemoveField(
            model_name='player',
            name='total_play_time',
        ),
        migrations.AddField(
            model_name='match',
            name='finished_at',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='match',
            name='scores',
            field=models.JSONField(null=True, verbose_name='scores'),
        ),
        migrations.AddField(
            model_name='match',
            name='started_at',
            field=models.DateTimeField(null=True),
        ),
    ]
