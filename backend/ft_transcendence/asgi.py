import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from pong.websocket_urls import websocket_urls


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ft_transcendence.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urls)),
    }
)
