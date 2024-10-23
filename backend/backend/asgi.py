import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddleWareStack
from core import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
	'https': get_asgi_application(),
	'websocket': AuthMiddleWareStack(
		URLRouter(
			routing.websocket_urlpatterns
		)
	)
})
