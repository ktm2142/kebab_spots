from django.urls import path
from .views import ListKebabSpotsAPIView, CreateKebabSpotAPIView, DetailsKebabSpotAPIView

urlpatterns = [
    path('spots/', ListKebabSpotsAPIView.as_view(), name='spots'),
    path('spot_detail/<int:pk>/', DetailsKebabSpotAPIView.as_view(), name='spot_detail'),
    path('create_spot/', CreateKebabSpotAPIView.as_view(), name='create_spot'),
]
