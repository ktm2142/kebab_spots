from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegistrationAPIVIew, UserProfileAPIVIew

urlpatterns = [
    path('registration/', RegistrationAPIVIew.as_view(), name='registration'),
    path('token/obtain/', TokenObtainPairView.as_view(), name='obtain_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='obtain_token'),
    path('user_profile/', UserProfileAPIVIew.as_view(), name='user_profile')
]