from django.urls import path
from . import views 

urlpatterns = [
    path('', views.index, name='index'),  
    path('signup/', views.SignupView.as_view(), name='signup'),  
    path('login/', views.LoginView.as_view(), name='login'),
    path('get-templates/<uuid:pk>/', views.get_templates, name='get_templates'),
    # path('verify-user/<uuid:user_id>/', views.verify_user, name='verify_user'),
]