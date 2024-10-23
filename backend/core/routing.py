from django.urls import re_path
from core.consumers import EstimateConsumer

websocket_urlpatterns = [
	re_path(r'ws/estimate/', EstimateConsumer.as_asgi())
]