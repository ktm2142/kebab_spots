from django.urls import path
from .views import (ListKebabSpotsAPIView, CreateKebabSpotAPIView, DetailsKebabSpotAPIView, UpdateKebabSpotAPIView,
                    SearchKebabSpotsAPIView, RateKebabSpotAPIView)

urlpatterns = [
    path('spots/', ListKebabSpotsAPIView.as_view(), name='spots'),
    path('search/', SearchKebabSpotsAPIView.as_view(), name='search'),
    path('spot_detail/<int:pk>/', DetailsKebabSpotAPIView.as_view(), name='spot_detail'),
    path('spot_update/<int:pk>/', UpdateKebabSpotAPIView.as_view(), name='spot_update'),
    path('create_spot/', CreateKebabSpotAPIView.as_view(), name='create_spot'),
    path('rating/<int:pk>/rate/', RateKebabSpotAPIView.as_view(), name='rate_spot'),
]
