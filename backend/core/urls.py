from django.urls import path
from core.views.views_auth import LoginView, SignupView
from core.views.views_voice import get_voice_models, get_voice_models_by_id, upload_voice
from core.views.views_credits import get_user_credits, chop_user_credits
from core.views.views_createvideo import create_video
from core.views.views_template import delete_template, UploadTemplatesView, get_templates_by_id, get_templates
from core.views.views_csrf import csrf_token_view
from django.views.decorators.csrf import get_token, csrf_exempt
from core.views.views_videos import get_videos_by_id, delete_video_by_id, change_video_upload_time, edit_scheduled_video, filter_videos_by_platforms, upload_video
from core.views.views_settings import get_settings, save_settings


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
    path('upload-voice/', upload_voice, name="upload_voice"),
    path('get-videos/<uuid:pk>/', get_videos_by_id, name="get_videos_by_id"),
    path('upload-video/<uuid:pk>/', upload_video, name="upload_video"),
    path('delete-video-by-id/<uuid:pk>/', delete_video_by_id, name="delete_video_by_id"),
    path('change-video-upload-time/<uuid:pk>/', change_video_upload_time, name="change_video_upload_time"),
    path('edit-scheduled-video/<uuid:pk>/', edit_scheduled_video, name="edit_scheduled_video"),
    path('videos-by-platforms/<uuid:pk>/', filter_videos_by_platforms, name="filter_videos_by_platforms"),
    path('get-user-settings/<uuid:pk>/', get_settings, name="get_settings"),
    path('save-user-settings/<uuid:pk>/', save_settings, name="save_settings"),
]