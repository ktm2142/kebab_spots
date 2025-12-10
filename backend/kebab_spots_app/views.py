from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import KebabSpot
from .serializers import KebabSpotSerializer


class ListKebabSpotsAPIView(generics.ListAPIView):
    serializer_class = KebabSpotSerializer
    queryset = KebabSpot.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()

        lat = self.request.query_params.get('lat')
        lon = self.request.query_params.get('lon')
        radius = self.request.query_params.get('radius')

        if lat and lon:
            try:
                center_point = Point(float(lon), float(lat), srid=4326)
                return qs.filter(coordinates__distance_lte=(center_point, D(km=float(radius))))
            except (ValueError, TypeError):
                pass
        return qs


class DetailsKebabSpotAPIView(generics.RetrieveAPIView):
    serializer_class = KebabSpotSerializer
    queryset = KebabSpot.objects.all()


class CreateKebabSpotAPIView(generics.CreateAPIView):
    serializer_class = KebabSpotSerializer
    permission_classes = [IsAuthenticated]
    queryset = KebabSpot.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)