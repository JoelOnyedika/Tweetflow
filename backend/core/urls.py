from django.urls import path
from core.views.views_auth import LoginView, SignupView
from core.views.views_credits import get_user_credits, chop_user_credits
from core.views.views_template import delete_template, UploadTemplatesView, get_templates_by_id, get_templates
from core.views.views_csrf import csrf_token_view
from django.views.decorators.csrf import get_token, csrf_exempt

urlpatterns = [  
    path('signup/', SignupView.as_view(), name='signup'),  
    path('login/', LoginView.as_view(), name='login'),
    path('csrf/', csrf_token_view, name='csrf'),
    path('credits/<uuid:pk>/', get_user_credits, name='credits'),
    path('get-templates/<uuid:pk>/', get_templates, name='get_templates'),
    path('chop-credits/<uuid:pk>/', chop_user_credits, name='chop_user_credits'),
    path('get-templates-by-id/<uuid:pk>/', get_templates_by_id, name='get_templates_by_id'),
    path('delete-template/<uuid:pk>/', delete_template, name='delete_template'),
    path('upload-templates/', UploadTemplatesView.as_view(), name='upload_templates'),
    # path('verify-user/<uuid:user_id>/', views.verify_user, name='verify_user'),
]