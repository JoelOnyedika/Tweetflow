from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
import logging
import requests
from django.conf import settings
from core.models import Template
from core.serializers import *

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_video(request):
    try: 
        data = request.data
        if data:
            try:
                the_template = Template.objects.get(id=data['template'])
                serializer = TemplateSerializer(the_template).data
                print(serializer)

                serializer['text'] = data['text']

                if 'user' in serializer:
                    serializer['user'] = str(serializer['user'])

                response = requests.post(f'{settings.CONVERTER_SERVER_URL}/api/create-video', json=serializer)
                result = response.json()

                if 'data' in result:
                    print(result['data'])
                    return JsonResponse({'data': result['data']})
                else:
                    return JsonResponse(result['error'], status=response.status_code)
            except Template.DoesNotExist:
                return JsonResponse({'error': {'message': 'Whoops looks like this template does not exist. Refresh.'}})
            except Exception as e:
                logger.error(f"Error while getting data from creating video {str(e)}")
                return JsonResponse({'error': {'message': 'Whoops an error occurred while creating your video'}})		
        return JsonResponse({'data': data, 'error': 6})
    except Exception as e:
        print(e)
        logger.error(f"Error while creating video {str(e)}")
        return JsonResponse({'error': {'message': 'Whoops an error occurred while creating your video.'}})
