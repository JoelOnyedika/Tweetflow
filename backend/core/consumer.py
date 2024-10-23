import json
from channels.generic.websocket import AsyncWebsocketConsumer

class EstimateConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()

	async def disconnect(self, close_code):
		pass 

	async def receive(self, data):
		data = json.loads(data)
		await self.send(data=json.dumps({
			'estimated_time': calculate_estimate(data['text'])
		}))

def calculate_estimate(self, text):
    rate = 0.551
    textLength = len(text)

    estimatedTime = rate * textLength + 13
    return estimatedTime
