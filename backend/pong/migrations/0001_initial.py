# Generated by Django 4.2 on 2024-08-17 20:24

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import pong.models.Player
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Player",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "public_id",
                    models.UUIDField(
                        db_index=True, default=uuid.uuid4, editable=False, unique=True
                    ),
                ),
                (
                    "email",
                    models.EmailField(
                        max_length=254, unique=True, verbose_name="endereço de email"
                    ),
                ),
                ("name", models.CharField(max_length=150, unique=True)),
                (
                    "avatar",
                    models.ImageField(
                        blank=True,
                        default="/default/player/avatar/default.jpg",
                        upload_to=pong.models.playerAvatarPath,
                    ),
                ),
                (
                    "activity_status",
                    models.CharField(
                        choices=[("ONLINE", "Online"), ("OFFLINE", "Offline")],
                        default="OFFLINE",
                        max_length=20,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Match",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "public_id",
                    models.UUIDField(
                        db_index=True, default=uuid.uuid4, editable=False, unique=True
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("CREATED", "Criado"),
                            ("AWAITING_CONFIRMATION", "Aguardando Confirmação"),
                            ("IN_PROGRESS", "Em Progresso"),
                            ("FINISHED", "Finalizado"),
                            ("CANCELLED", "Cancelado"),
                        ],
                        default="CREATED",
                        max_length=100,
                    ),
                ),
                ("max", models.IntegerField(default=2)),
                (
                    "accepted_players",
                    models.ManyToManyField(
                        blank=True,
                        related_name="%(class)s_accepted_players",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "child_lower",
                    models.ForeignKey(
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="parent_lower",
                        to="pong.match",
                    ),
                ),
                (
                    "child_upper",
                    models.ForeignKey(
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="parent_upper",
                        to="pong.match",
                    ),
                ),
                (
                    "players",
                    models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
                ),
                (
                    "rejected_players",
                    models.ManyToManyField(
                        blank=True,
                        related_name="%(class)s_rejected_players",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "winner",
                    models.ForeignKey(
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="winner",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Tournament",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "public_id",
                    models.UUIDField(
                        db_index=True, default=uuid.uuid4, editable=False, unique=True
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("CREATED", "Criado"),
                            ("AWAITING_CONFIRMATION", "Aguardando Confirmação"),
                            ("IN_PROGRESS", "Em Progresso"),
                            ("FINISHED", "Finalizado"),
                            ("CANCELLED", "Cancelado"),
                        ],
                        default="CREATED",
                        max_length=100,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "accepted_players",
                    models.ManyToManyField(
                        blank=True,
                        related_name="%(class)s_accepted_players",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "champion",
                    models.ForeignKey(
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="champion",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "players",
                    models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
                ),
                (
                    "rejected_players",
                    models.ManyToManyField(
                        blank=True,
                        related_name="%(class)s_rejected_players",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "root_match",
                    models.ForeignKey(
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="pong.match",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Message",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "public_id",
                    models.UUIDField(
                        db_index=True, default=uuid.uuid4, editable=False, unique=True
                    ),
                ),
                ("text", models.CharField(max_length=1000)),
                (
                    "sender",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Chat",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "public_id",
                    models.UUIDField(
                        db_index=True, default=uuid.uuid4, editable=False, unique=True
                    ),
                ),
                ("name", models.CharField(max_length=100, null=True)),
                ("is_private", models.BooleanField()),
                ("messages", models.ManyToManyField(to="pong.message")),
                ("players", models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.AddField(
            model_name="player",
            name="blocked_chats",
            field=models.ManyToManyField(to="pong.chat"),
        ),
        migrations.AddField(
            model_name="player",
            name="friends",
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name="player",
            name="groups",
            field=models.ManyToManyField(
                blank=True,
                help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                related_name="user_set",
                related_query_name="user",
                to="auth.group",
                verbose_name="groups",
            ),
        ),
        migrations.AddField(
            model_name="player",
            name="user_permissions",
            field=models.ManyToManyField(
                blank=True,
                help_text="Specific permissions for this user.",
                related_name="user_set",
                related_query_name="user",
                to="auth.permission",
                verbose_name="user permissions",
            ),
        ),
    ]
