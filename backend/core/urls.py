from django.urls import path
from core.views.views_auth import LoginView, SignupView
from core.views.views_voice import get_voice_models, get_voice_models_by_id
from core.views.views_credits import get_user_credits, chop_user_credits
from core.views.views_createvideo import create_video
from core.views.views_template import delete_template, UploadTemplatesView, get_templates_by_id, get_templates
from core.views.views_csrf import csrf_token_view
from django.views.decorators.csrf import get_token, csrf_exempt

urlpatterns = [  
    path('signup/', SignupView.as_view(), name='signup'),  
    path('login/', LoginView.as_view(), name='login'),
    path('csrf/', csrf_token_view, name='csrf'),
    path('voice-models/', get_voice_models, name='get_voice_models'),
    path('credits/<uuid:pk>/', get_user_credits, name='credits'),
    path('get-templates/<uuid:pk>/', get_templates, name='get_templates'),
    path('chop-credits/<uuid:pk>/', chop_user_credits, name='chop_user_credits'),
    path('get-templates-by-id/<uuid:pk>/', get_templates_by_id, name='get_templates_by_id'),
    path('delete-template/<uuid:pk>/', delete_template, name='delete_template'),
    path('get-voice-by-id/<uuid:pk>/', get_voice_models_by_id, name='get_voice_by_id'),
    path('upload-templates/', UploadTemplatesView.as_view(), name='upload_templates'),
    path('create-video/', create_video, name="create_video"),
    # path('upload-voice-data/', UploadVoiceDataView.as_view(), name='upload_voice_data'),
    # path('verify-user/<uuid:user_id>/', views.verify_user, name='verify_user'),
]