from django.urls import path, include
from rest_framework.routers import DefaultRouter
from kebab_spots_app.views import KebabSpotViewSet

router = DefaultRouter()
router.register('spot', KebabSpotViewSet)

urlpatterns = [
    path('', include(router.urls))
]
