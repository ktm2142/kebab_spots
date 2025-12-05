from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import KebabSpot
from .serializers import KebabSpotSerializer


"""
ViewSet for CRUD operations for spot on map
"""
class KebabSpotViewSet(viewsets.ModelViewSet):
    serializer_class = KebabSpotSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = KebabSpot.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)