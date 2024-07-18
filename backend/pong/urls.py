from django.urls import path

from pong.controllers import PlayerController

from . import views

urlpatterns = [
    path("player", PlayerController.index),
    path("player/create", PlayerController.create),
    path("", views.index, name="index"),
]
